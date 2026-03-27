import { useState, useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

type Strategy = 'aggressive' | 'defensive' | 'flanker' | 'sniper' | 'balanced';
type Phase = 'design' | 'battle' | 'result';

interface TankConfig {
  name: string;
  armor: number;
  speed: number;
  power: number;
  rate: number;
  range: number;
  strategy: Strategy;
}

interface TankState {
  x: number;
  y: number;
  bodyAngle: number;
  turretAngle: number;
  hp: number;
  maxHp: number;
  config: TankConfig;
  cooldown: number;
  isPlayer: boolean;
  hitFlash: number;
  alive: boolean;
  prevX: number;
  prevY: number;
  stuckFrames: number;
  stuckAngle: number;
}

interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  damage: number;
  maxDist: number;
  traveled: number;
  owner: 'player' | 'enemy';
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rect { x: number; y: number; w: number; h: number }

interface GameState {
  player: TankState;
  enemy: TankState;
  bullets: Bullet[];
  particles: Particle[];
  obstacles: Rect[];
  frame: number;
  countdown: number;
  countdownTimer: number;
  over: boolean;
  endTimer: number;
  winner: 'player' | 'enemy' | null;
}

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

const W = 700, H = 440;
const TANK_R = 11;
const TURRET_LEN = 14;
const BULLET_SPD = 5;
const BULLET_R = 2.5;
const BUDGET = 15;

const P_COLOR = '#0EA5E9';
const E_COLOR = '#E94560';

const toHp = (a: number) => a * 32 + 28;
const toSpd = (s: number) => s * 0.65 + 0.55;
const toDmg = (p: number) => p * 3 + 2;
const toCd = (r: number) => Math.max(14, 82 - r * 14);
const toRng = (r: number) => r * 38 + 62;

const OBSTACLES: Rect[] = [
  { x: 155, y: 60, w: 48, h: 48 },
  { x: 497, y: 60, w: 48, h: 48 },
  { x: 312, y: 190, w: 76, h: 32 },
  { x: 155, y: 332, w: 48, h: 48 },
  { x: 497, y: 332, w: 48, h: 48 },
];

// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════

const STRATEGIES: { key: Strategy; name: string; prompt: string; tip: string; color: string }[] = [
  { key: 'aggressive', name: 'Aggressive', color: '#E94560',
    prompt: 'Close distance. Fire constantly. Prioritize damage over survival.',
    tip: 'Speed + Rate' },
  { key: 'defensive', name: 'Defensive', color: '#0F3460',
    prompt: 'Maintain distance. Wait for openings. Outlast the opponent.',
    tip: 'Armor + Range' },
  { key: 'flanker', name: 'Flanker', color: '#7B61FF',
    prompt: 'Circle the opponent. Never approach head-on. Attack from the side.',
    tip: 'Speed + Power' },
  { key: 'sniper', name: 'Sniper', color: '#F5A623',
    prompt: 'Maximize distance. Precise shots only. Retreat if they close in.',
    tip: 'Range + Power' },
  { key: 'balanced', name: 'Balanced', color: '#16C79A',
    prompt: 'Adapt to the situation. Aggressive when healthy, cautious when hurt.',
    tip: 'Flexible' },
];

const OPPONENTS: (TankConfig & { desc: string })[] = [
  { name: 'Rookie', desc: 'Balanced but basic', armor: 2, speed: 2, power: 2, rate: 2, range: 2, strategy: 'balanced' },
  { name: 'Scout', desc: 'Fast & reckless', armor: 1, speed: 5, power: 2, rate: 3, range: 2, strategy: 'aggressive' },
  { name: 'Turtle', desc: 'Slow but tanky', armor: 5, speed: 1, power: 2, rate: 3, range: 3, strategy: 'defensive' },
  { name: 'Ghost', desc: 'Elusive flanker', armor: 2, speed: 4, power: 3, rate: 3, range: 2, strategy: 'flanker' },
  { name: 'Railgun', desc: 'Long-range sniper', armor: 2, speed: 2, power: 5, rate: 1, range: 5, strategy: 'sniper' },
];

const STAT_DEFS = [
  { key: 'armor', label: 'Armor' },
  { key: 'speed', label: 'Speed' },
  { key: 'power', label: 'Power' },
  { key: 'rate', label: 'Rate' },
  { key: 'range', label: 'Range' },
] as const;

// ═══════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════

function angleDiff(from: number, to: number): number {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function hitRect(x: number, y: number, r: number, o: Rect): boolean {
  const cx = Math.max(o.x, Math.min(x, o.x + o.w));
  const cy = Math.max(o.y, Math.min(y, o.y + o.h));
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}

function hitsAny(x: number, y: number, r: number, obs: Rect[]): boolean {
  return obs.some(o => hitRect(x, y, r, o));
}

function inBounds(x: number, y: number, r: number): boolean {
  return x > r + 2 && x < W - r - 2 && y > r + 2 && y < H - r - 2;
}

function makeTank(cfg: TankConfig, x: number, y: number, angle: number, isPlayer: boolean): TankState {
  const mhp = toHp(cfg.armor);
  return { x, y, bodyAngle: angle, turretAngle: angle, hp: mhp, maxHp: mhp, config: cfg,
    cooldown: 0, isPlayer, hitFlash: 0, alive: true, prevX: x, prevY: y, stuckFrames: 0, stuckAngle: 0 };
}

function initGame(pCfg: TankConfig, eCfg: TankConfig): GameState {
  return {
    player: makeTank(pCfg, 65, H / 2, 0, true),
    enemy: makeTank(eCfg, W - 65, H / 2, Math.PI, false),
    bullets: [], particles: [], obstacles: [...OBSTACLES],
    frame: 0, countdown: 3, countdownTimer: 60, over: false, endTimer: 0, winner: null,
  };
}

function runAI(tank: TankState, foe: TankState, game: GameState): boolean {
  if (!tank.alive) return false;

  const dx = foe.x - tank.x, dy = foe.y - tank.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const toFoe = Math.atan2(dy, dx);
  const myRng = toRng(tank.config.range);
  const mySpd = toSpd(tank.config.speed);
  const hpPct = tank.hp / tank.maxHp;

  let wantBody = toFoe;
  let moveDir = 1;
  let aimTh = 0.3;
  let wantFire = false;

  const jitter = Math.sin(game.frame * 0.047 + (tank.isPlayer ? 0 : 137)) * 0.06;

  switch (tank.config.strategy) {
    case 'aggressive':
      wantBody = toFoe;
      moveDir = dist > TANK_R * 5 ? 1 : 0;
      wantFire = dist < myRng * 1.2;
      aimTh = 0.4;
      break;
    case 'defensive':
      if (dist < myRng * 0.45) { wantBody = toFoe + Math.PI; moveDir = 1; }
      else if (dist < myRng * 0.8) {
        wantBody = toFoe + (Math.PI / 2) * (game.frame % 280 < 140 ? 1 : -1);
        moveDir = 1;
      } else { wantBody = toFoe; moveDir = 0; }
      wantFire = dist < myRng;
      aimTh = 0.22;
      break;
    case 'flanker': {
      const ideal = myRng * 0.6;
      if (dist > ideal * 1.5) wantBody = toFoe + Math.PI * 0.25;
      else if (dist < ideal * 0.55) wantBody = toFoe + Math.PI * 0.75;
      else wantBody = toFoe + Math.PI / 2;
      moveDir = 1;
      wantFire = dist < myRng;
      aimTh = 0.35;
      break;
    }
    case 'sniper': {
      const ideal = myRng * 0.78;
      if (dist < ideal * 0.55) { wantBody = toFoe + Math.PI; moveDir = 1; }
      else if (dist > ideal * 1.15) { wantBody = toFoe; moveDir = 1; }
      else { wantBody = toFoe; moveDir = 0; }
      wantFire = dist < myRng;
      aimTh = 0.1;
      break;
    }
    case 'balanced':
      if (hpPct > 0.5) { wantBody = toFoe; moveDir = dist > myRng * 0.35 ? 1 : 0; aimTh = 0.35; }
      else { wantBody = dist < myRng * 0.45 ? toFoe + Math.PI : toFoe; moveDir = dist < myRng * 0.45 ? 1 : 0; aimTh = 0.2; }
      wantFire = dist < myRng;
      break;
  }

  wantBody += jitter;

  // Stuck detection
  if (game.frame % 25 === 0) {
    const moved = Math.sqrt((tank.x - tank.prevX) ** 2 + (tank.y - tank.prevY) ** 2);
    if (moved < 2 && moveDir !== 0) {
      tank.stuckAngle = wantBody + (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.4 + Math.random() * Math.PI * 0.6);
      tank.stuckFrames = 35;
    }
    tank.prevX = tank.x; tank.prevY = tank.y;
  }
  if (tank.stuckFrames > 0) { wantBody = tank.stuckAngle; moveDir = 1; tank.stuckFrames--; }

  // Rotate body
  const bTurn = 0.04 + toSpd(tank.config.speed) * 0.009;
  const bd = angleDiff(tank.bodyAngle, wantBody);
  tank.bodyAngle += Math.abs(bd) > bTurn ? Math.sign(bd) * bTurn : bd;

  // Rotate turret toward foe
  const tTurn = 0.065;
  const td = angleDiff(tank.turretAngle, toFoe);
  tank.turretAngle += Math.abs(td) > tTurn ? Math.sign(td) * tTurn : td;

  // Move
  if (moveDir !== 0) {
    const nx = tank.x + Math.cos(tank.bodyAngle) * mySpd * moveDir;
    const ny = tank.y + Math.sin(tank.bodyAngle) * mySpd * moveDir;
    if (inBounds(nx, ny, TANK_R) && !hitsAny(nx, ny, TANK_R + 2, game.obstacles)) {
      tank.x = nx; tank.y = ny;
    }
  }

  // Fire?
  tank.cooldown = Math.max(0, tank.cooldown - 1);
  if (wantFire && tank.cooldown <= 0 && Math.abs(td) < aimTh) {
    tank.cooldown = toCd(tank.config.rate);
    return true;
  }
  return false;
}

function spawnBullet(tank: TankState, game: GameState) {
  const tx = tank.x + Math.cos(tank.turretAngle) * (TANK_R + TURRET_LEN);
  const ty = tank.y + Math.sin(tank.turretAngle) * (TANK_R + TURRET_LEN);
  game.bullets.push({
    x: tx, y: ty,
    dx: Math.cos(tank.turretAngle) * BULLET_SPD,
    dy: Math.sin(tank.turretAngle) * BULLET_SPD,
    damage: toDmg(tank.config.power),
    maxDist: toRng(tank.config.range),
    traveled: 0,
    owner: tank.isPlayer ? 'player' : 'enemy',
  });
  game.particles.push({ x: tx, y: ty, dx: 0, dy: 0, life: 5, maxLife: 5,
    color: tank.isPlayer ? '#7DD3FC' : '#FCA5A5', size: 5 });
}

function stepGame(g: GameState) {
  g.frame++;
  const pairs: [TankState, TankState][] = [[g.player, g.enemy], [g.enemy, g.player]];
  for (const [t, f] of pairs) {
    if (runAI(t, f, g)) spawnBullet(t, g);
    t.hitFlash = Math.max(0, t.hitFlash - 1);
  }

  // Bullets
  g.bullets = g.bullets.filter(b => {
    b.x += b.dx; b.y += b.dy; b.traveled += BULLET_SPD;
    if (b.traveled > b.maxDist || !inBounds(b.x, b.y, 0)) return false;
    if (hitsAny(b.x, b.y, BULLET_R, g.obstacles)) {
      for (let i = 0; i < 3; i++)
        g.particles.push({ x: b.x, y: b.y, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2,
          life: 8, maxLife: 8, color: '#B8B3AA', size: 2 });
      return false;
    }
    const tgt = b.owner === 'player' ? g.enemy : g.player;
    if (tgt.alive && (b.x - tgt.x) ** 2 + (b.y - tgt.y) ** 2 < (TANK_R + BULLET_R) ** 2) {
      tgt.hp -= b.damage; tgt.hitFlash = 6;
      for (let i = 0; i < 4; i++)
        g.particles.push({ x: b.x, y: b.y, dx: (Math.random() - 0.5) * 2.5, dy: (Math.random() - 0.5) * 2.5,
          life: 12, maxLife: 12, color: '#F5A623', size: 2 + Math.random() * 2 });
      if (tgt.hp <= 0) {
        tgt.hp = 0; tgt.alive = false; g.over = true;
        g.winner = b.owner; g.endTimer = 80;
        for (let i = 0; i < 20; i++) {
          const a = (Math.PI * 2 * i) / 20, s = 1 + Math.random() * 2.5;
          g.particles.push({ x: tgt.x, y: tgt.y, dx: Math.cos(a) * s, dy: Math.sin(a) * s,
            life: 25 + Math.random() * 25, maxLife: 50,
            color: tgt.isPlayer ? P_COLOR : E_COLOR, size: 2.5 + Math.random() * 4 });
        }
      }
      return false;
    }
    return true;
  });

  // Particles
  g.particles = g.particles.filter(p => {
    p.x += p.dx; p.y += p.dy; p.dx *= 0.95; p.dy *= 0.95; p.life--;
    return p.life > 0;
  });
}

// ═══════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════

function draw(ctx: CanvasRenderingContext2D, g: GameState, cw: number, ch: number) {
  const sx = cw / W, sy = ch / H;
  ctx.clearRect(0, 0, cw, ch);
  ctx.save(); ctx.scale(sx, sy);

  // Background
  ctx.fillStyle = '#F5F2ED';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(26,26,46,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Border
  ctx.strokeStyle = 'rgba(26,26,46,0.07)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(1, 1, W - 2, H - 2, 10); ctx.stroke();

  // Obstacles
  for (const o of g.obstacles) {
    ctx.fillStyle = 'rgba(26,26,46,0.04)';
    ctx.beginPath(); ctx.roundRect(o.x + 2, o.y + 2, o.w, o.h, 7); ctx.fill();
    ctx.fillStyle = '#D6D1C9';
    ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 7); ctx.fill();
  }

  // Bullets
  for (const b of g.bullets) {
    const c = b.owner === 'player' ? P_COLOR : E_COLOR;
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = c; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.dx * 2, b.y - b.dy * 2); ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(b.x, b.y, BULLET_R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Particles
  for (const p of g.particles) {
    const a = p.life / p.maxLife;
    ctx.globalAlpha = a * 0.8;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.3 + a * 0.7), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Tanks
  const drawTank = (t: TankState) => {
    if (!t.alive && g.endTimer < 50) return;
    const col = t.isPlayer ? P_COLOR : E_COLOR;
    ctx.globalAlpha = t.alive ? 1 : Math.max(0, (g.endTimer - 20) / 60);

    // Shadow
    ctx.fillStyle = 'rgba(26,26,46,0.08)';
    ctx.beginPath(); ctx.arc(t.x + 1.5, t.y + 1.5, TANK_R, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = t.hitFlash > 0 ? '#FFF' : col;
    ctx.beginPath(); ctx.arc(t.x, t.y, TANK_R, 0, Math.PI * 2); ctx.fill();

    // Ring
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(t.x, t.y, TANK_R - 2.5, 0, Math.PI * 2); ctx.stroke();

    // Turret
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    const tx1 = t.x + Math.cos(t.turretAngle) * 3;
    const ty1 = t.y + Math.sin(t.turretAngle) * 3;
    const tx2 = t.x + Math.cos(t.turretAngle) * (TANK_R + TURRET_LEN - 3);
    const ty2 = t.y + Math.sin(t.turretAngle) * (TANK_R + TURRET_LEN - 3);
    ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.stroke();

    // Tip dot
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(tx2, ty2, 2, 0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = 1;

    // HP bar
    if (t.alive) {
      const bw = 26, bh = 2.5, bx = t.x - bw / 2, by = t.y - TANK_R - 9;
      const frac = t.hp / t.maxHp;
      ctx.fillStyle = 'rgba(26,26,46,0.06)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 1); ctx.fill();
      ctx.fillStyle = frac > 0.5 ? '#16C79A' : frac > 0.25 ? '#F5A623' : '#E94560';
      ctx.beginPath(); ctx.roundRect(bx, by, bw * frac, bh, 1); ctx.fill();

      // Name
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;
      ctx.font = '600 7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.config.name.toUpperCase(), t.x, by - 3);
      ctx.globalAlpha = 1;
    }
  };
  drawTank(g.player);
  drawTank(g.enemy);

  // Countdown
  if (g.countdown > 0) {
    ctx.fillStyle = 'rgba(250,248,245,0.55)';
    ctx.fillRect(0, 0, W, H);
    const s = 1 + (g.countdownTimer / 60) * 0.25;
    ctx.globalAlpha = 0.25 + (g.countdownTimer / 60) * 0.75;
    ctx.fillStyle = '#1A1A2E';
    ctx.font = '800 52px "Playfair Display", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s);
    ctx.fillText(String(g.countdown), 0, 0);
    ctx.restore(); ctx.globalAlpha = 1;
  }

  // FIGHT!
  if (g.countdown === 0 && g.frame > 0 && g.frame < 36) {
    ctx.globalAlpha = Math.max(0, 1 - g.frame / 36);
    ctx.fillStyle = '#E94560';
    ctx.font = '800 30px "Playfair Display", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FIGHT', W / 2, H / 2);
    ctx.globalAlpha = 1;
  }

  // Winner
  if (g.over && g.endTimer < 50) {
    ctx.globalAlpha = Math.min(1, (50 - g.endTimer) / 25);
    ctx.fillStyle = g.winner === 'player' ? '#16C79A' : '#E94560';
    ctx.font = '800 26px "Playfair Display", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(g.winner === 'player' ? 'VICTORY' : 'DEFEATED', W / 2, H / 2);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════
// INSIGHTS
// ═══════════════════════════════════════════════

function getInsight(won: boolean, pStrat: Strategy, eStrat: Strategy, eName: string): string {
  if (won) return `Your ${pStrat} strategy defeated ${eName}. In real agent design, matching capabilities to the task is everything.`;
  const tips: Partial<Record<Strategy, string>> = {
    aggressive: `${eName} closed distance fast. More Armor helps survive rushes, or try outranging with Sniper.`,
    defensive: `${eName} outlasted you. High Power + Aggressive can break through before they recover.`,
    flanker: `${eName} kept circling. High Rate helps land hits on moving targets.`,
    sniper: `${eName} punished from range. Speed helps close the gap — Flanker works well against snipers.`,
    balanced: `${eName} adapted well. A specialized build can overwhelm generalists.`,
  };
  return tips[eStrat] || 'Try a different combination. Agent design is iterative — you learn what works by testing.';
}

// ═══════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════

type Stats = { armor: number; speed: number; power: number; rate: number; range: number };

export default function AgentArena() {
  const [phase, setPhase] = useState<Phase>('design');
  const [stats, setStats] = useState<Stats>({ armor: 2, speed: 2, power: 2, rate: 2, range: 2 });
  const [strategy, setStrategy] = useState<Strategy>('aggressive');
  const [tankName, setTankName] = useState('');
  const [oppIdx, setOppIdx] = useState(0);
  const [result, setResult] = useState<{ won: boolean; pHp: number; eHp: number } | null>(null);
  const [wins, setWins] = useState<boolean[]>(() => {
    try { return JSON.parse(localStorage.getItem('arena_wins') || '[]'); } catch { return []; }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const animRef = useRef(0);

  const totalUsed = Object.values(stats).reduce((a, b) => a + b, 0);
  const remaining = BUDGET - totalUsed;

  const handleStat = useCallback((key: keyof Stats, level: number) => {
    setStats(prev => {
      const cur = prev[key];
      const target = level === cur && cur > 1 ? cur - 1 : level;
      const diff = target - cur;
      if (diff > 0 && diff > BUDGET - Object.values(prev).reduce((a, b) => a + b, 0)) return prev;
      if (target < 1 || target > 5) return prev;
      return { ...prev, [key]: target };
    });
  }, []);

  const startBattle = useCallback(() => {
    const opp = OPPONENTS[oppIdx];
    const pCfg: TankConfig = { name: tankName || 'Agent', ...stats, strategy };
    const eCfg: TankConfig = { name: opp.name, armor: opp.armor, speed: opp.speed, power: opp.power, rate: opp.rate, range: opp.range, strategy: opp.strategy };
    gameRef.current = initGame(pCfg, eCfg);
    setResult(null);
    setPhase('battle');
  }, [tankName, stats, strategy, oppIdx]);

  // Battle loop
  useEffect(() => {
    if (phase !== 'battle') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const cw = Math.min(W, container.clientWidth);
      const ch = Math.round(cw * H / W);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    let running = true;
    const loop = () => {
      if (!running || !gameRef.current) return;
      const g = gameRef.current;
      const ctx = canvas.getContext('2d')!;

      if (g.countdown > 0) {
        g.countdownTimer--;
        if (g.countdownTimer <= 0) { g.countdown--; g.countdownTimer = 60; }
      } else if (!g.over) {
        stepGame(g);
      } else {
        g.endTimer--;
        // Keep updating particles during end
        g.particles = g.particles.filter(p => {
          p.x += p.dx; p.y += p.dy; p.dx *= 0.95; p.dy *= 0.95; p.life--;
          return p.life > 0;
        });
        if (g.endTimer <= 0) {
          setResult({ won: g.winner === 'player', pHp: Math.max(0, g.player.hp), eHp: Math.max(0, g.enemy.hp) });
          setPhase('result');
          running = false;
          return;
        }
      }

      draw(ctx, g, canvas.width, canvas.height);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => { running = false; cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [phase]);

  // Save wins
  useEffect(() => {
    if (phase === 'result' && result?.won) {
      setWins(prev => {
        const next = [...prev];
        next[oppIdx] = true;
        try { localStorage.setItem('arena_wins', JSON.stringify(next)); } catch { /* */ }
        return next;
      });
    }
  }, [phase, result, oppIdx]);

  const stratDef = STRATEGIES.find(s => s.key === strategy)!;

  // ─── DESIGN PHASE ───
  if (phase === 'design') return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-deep)', margin: 0, opacity: 0.55, lineHeight: 1.6 }}>
          Configure your tank agent's capabilities and strategy, then deploy it to fight.
        </p>
      </div>

      {/* Name + Budget */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input type="text" value={tankName} onChange={e => setTankName(e.target.value)}
          placeholder="Name your agent..." maxLength={12}
          style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8,
            border: '1px solid rgba(26,26,46,0.08)', background: '#FEFDFB',
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1A1A2E', outline: 'none' }}
          onFocus={e => e.currentTarget.style.borderColor = '#E9456030'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'}
        />
        <div style={{ padding: '5px 12px', borderRadius: 100,
          background: remaining > 0 ? 'rgba(22,199,154,0.06)' : remaining === 0 ? 'rgba(26,26,46,0.04)' : 'rgba(233,69,96,0.06)',
          border: `1px solid ${remaining > 0 ? 'rgba(22,199,154,0.15)' : 'rgba(26,26,46,0.08)'}`,
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
          color: remaining > 0 ? '#16C79A' : '#6B7280', whiteSpace: 'nowrap' as const }}>
          {remaining} pts left
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
          Capabilities
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {STAT_DEFS.map(({ key, label }) => {
            const val = stats[key as keyof Stats];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                  color: '#1A1A2E', width: 48, textAlign: 'right' as const, opacity: 0.7 }}>{label}</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1, 2, 3, 4, 5].map(n => {
                    const filled = n <= val;
                    const over = !filled && (n - val) > remaining;
                    return (
                      <button key={n} onClick={() => handleStat(key as keyof Stats, n)}
                        style={{ width: 20, height: 20, borderRadius: 4, border: 'none', padding: 0,
                          background: filled ? '#E94560' : 'rgba(26,26,46,0.05)',
                          cursor: over ? 'default' : 'pointer',
                          opacity: filled ? 1 : over ? 0.12 : 0.28,
                          transition: 'all 0.15s' }} />
                    );
                  })}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--color-subtle)', opacity: 0.6 }}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategy */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
          Strategy <span style={{ opacity: 0.5, fontWeight: 400, letterSpacing: 0, textTransform: 'none' as const }}>(system prompt)</span>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 8 }}>
          {STRATEGIES.map(s => (
            <button key={s.key} onClick={() => setStrategy(s.key)}
              style={{ padding: '5px 12px', borderRadius: 100, border: 'none',
                background: strategy === s.key ? s.color : 'rgba(26,26,46,0.04)',
                color: strategy === s.key ? 'white' : 'var(--color-subtle)',
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s' }}>
              {s.name}
            </button>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(26,26,46,0.02)',
          borderLeft: `2px solid ${stratDef.color}20` }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontStyle: 'italic',
            color: 'var(--color-deep)', opacity: 0.45, margin: 0, lineHeight: 1.5 }}>
            "{stratDef.prompt}"
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: stratDef.color,
            margin: '4px 0 0', opacity: 0.7 }}>
            Pairs with: {stratDef.tip}
          </p>
        </div>
      </div>

      {/* Opponents */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
          Opponent
        </p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
          {OPPONENTS.map((opp, i) => (
            <button key={i} onClick={() => setOppIdx(i)}
              style={{ padding: '7px 12px', borderRadius: 8, textAlign: 'left' as const,
                border: `1.5px solid ${oppIdx === i ? '#E94560' : 'rgba(26,26,46,0.06)'}`,
                background: oppIdx === i ? 'rgba(233,69,96,0.03)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s', position: 'relative' as const }}>
              {wins[i] && (
                <span style={{ position: 'absolute' as const, top: -3, right: -3, width: 13, height: 13,
                  borderRadius: '50%', background: '#16C79A', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>✓</span>
              )}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700,
                color: '#1A1A2E', margin: '0 0 1px' }}>{opp.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-subtle)', margin: 0 }}>
                {opp.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Deploy */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={startBattle}
          style={{ padding: '11px 32px', borderRadius: 100, border: 'none',
            background: '#1A1A2E', color: 'white',
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s' }}>
          Deploy to Arena
        </button>
        {wins.some(Boolean) && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-subtle)',
            margin: '0.6rem 0 0', opacity: 0.6 }}>
            {wins.filter(Boolean).length}/{OPPONENTS.length} defeated
          </p>
        )}
      </div>
    </div>
  );

  // ─── BATTLE PHASE ───
  if (phase === 'battle') return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6, padding: '0 2px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: P_COLOR }}>
          {tankName || 'Agent'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-subtle)', opacity: 0.5 }}>
          VS
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: E_COLOR }}>
          {OPPONENTS[oppIdx].name}
        </span>
      </div>
      <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 10 }} />
    </div>
  );

  // ─── RESULT PHASE ───
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 0.75rem',
        background: result?.won ? 'rgba(22,199,154,0.08)' : 'rgba(233,69,96,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: result?.won ? '#16C79A' : '#E94560',
        fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
        {result?.won ? '✓' : '✗'}
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800,
        color: result?.won ? '#16C79A' : '#E94560', margin: '0 0 0.35rem' }}>
        {result?.won ? 'Victory' : 'Defeated'}
      </h3>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)',
        opacity: 0.5, margin: '0 0 1.25rem', lineHeight: 1.6 }}>
        {result?.won
          ? `Your agent won with ${Math.round((result.pHp / toHp(stats.armor)) * 100)}% health remaining.`
          : `The opponent had ${Math.round((result?.eHp || 0) / toHp(OPPONENTS[oppIdx].armor) * 100)}% health left.`}
      </p>

      {/* Insight */}
      <div style={{ maxWidth: 420, margin: '0 auto 1.25rem', padding: '0.75rem 1rem', borderRadius: 10,
        background: 'rgba(26,26,46,0.02)', border: '1px solid rgba(26,26,46,0.05)', textAlign: 'left' as const }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase' as const, color: stratDef.color, margin: '0 0 0.2rem' }}>
          Agent Insight
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-deep)',
          margin: 0, lineHeight: 1.6, opacity: 0.6 }}>
          {getInsight(!!result?.won, strategy, OPPONENTS[oppIdx].strategy, OPPONENTS[oppIdx].name)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
        <button onClick={startBattle}
          style={{ padding: '9px 22px', borderRadius: 100,
            border: '1px solid rgba(26,26,46,0.1)', background: 'transparent',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
            color: '#1A1A2E', cursor: 'pointer' }}>
          Retry
        </button>
        <button onClick={() => setPhase('design')}
          style={{ padding: '9px 22px', borderRadius: 100, border: 'none',
            background: '#1A1A2E', color: 'white',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer' }}>
          Redesign
        </button>
      </div>
    </div>
  );
}
