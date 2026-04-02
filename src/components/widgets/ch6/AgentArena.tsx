import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useTranslation } from '../../../i18n/useTranslation';

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
  treadOffset: number;
  thought: string;
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

// Per-enemy visual identity
const ENEMY_STYLES: Record<string, { body: string; tread: string; flash: string }> = {
  'Rookie':  { body: '#9CA3AF', tread: '#6B7280', flash: '#D1D5DB' },
  'Scout':   { body: '#F59E0B', tread: '#B45309', flash: '#FDE68A' },
  'Turtle':  { body: '#16C79A', tread: '#0E8A6D', flash: '#6EE7B7' },
  'Ghost':   { body: '#8B5CF6', tread: '#5B21B6', flash: '#C4B5FD' },
  'Railgun': { body: '#EF4444', tread: '#B91C1C', flash: '#FCA5A5' },
};

const getEnemyColor = (name: string) => ENEMY_STYLES[name]?.body || E_COLOR;

const toHp = (a: number) => a * 32 + 28;
const toSpd = (s: number) => s * 0.65 + 0.55;
const toDmg = (p: number) => p * 3 + 2;
const toCd = (r: number) => Math.max(14, 82 - r * 14);
const toRng = (r: number) => r * 38 + 62;

const G = 20; // Grid unit — obstacles snap to this

const OBSTACLES: Rect[] = [
  // ── Top-left L ──
  { x: G*8, y: G*3, w: G*2, h: G },       // 2-unit bar
  { x: G*8, y: G*4, w: G, h: G*2 },       // 2-unit stem

  // ── Top-right L (mirror) ──
  { x: G*25, y: G*3, w: G*2, h: G },
  { x: G*26, y: G*4, w: G, h: G*2 },

  // ── Mid-left wall ──
  { x: G*12, y: G*7, w: G, h: G*3 },      // 3-unit vertical

  // ── Center cross ──
  { x: G*17, y: G*9, w: G, h: G },        // 1-unit cap
  { x: G*16, y: G*10, w: G*3, h: G },     // 3-unit bar
  { x: G*17, y: G*11, w: G, h: G*2 },     // 2-unit stem

  // ── Mid-right wall ──
  { x: G*22, y: G*12, w: G, h: G*3 },     // 3-unit vertical

  // ── Bottom-left L ──
  { x: G*8, y: G*16, w: G, h: G*2 },
  { x: G*8, y: G*18, w: G*2, h: G },

  // ── Bottom-right L (mirror) ──
  { x: G*26, y: G*16, w: G, h: G*2 },
  { x: G*25, y: G*18, w: G*2, h: G },
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
  return x > r + 5 && x < W - r - 5 && y > r + 5 && y < H - r - 5;
}

// Hard-clamp a tank inside walls and outside obstacles (runs every frame)
function clampTank(t: TankState, obstacles: Rect[]) {
  const pad = TANK_R + 5;
  t.x = Math.max(pad, Math.min(W - pad, t.x));
  t.y = Math.max(pad, Math.min(H - pad, t.y));
  for (const o of obstacles) {
    const nearX = Math.max(o.x, Math.min(t.x, o.x + o.w));
    const nearY = Math.max(o.y, Math.min(t.y, o.y + o.h));
    const dx = t.x - nearX, dy = t.y - nearY;
    const d = Math.sqrt(dx * dx + dy * dy);
    const minD = TANK_R + 4;
    if (d < minD) {
      if (d > 0.01) {
        t.x += (dx / d) * (minD - d);
        t.y += (dy / d) * (minD - d);
      } else {
        const dists = [t.x - o.x, o.x + o.w - t.x, t.y - o.y, o.y + o.h - t.y];
        const mi = dists.indexOf(Math.min(...dists));
        if (mi === 0) t.x = o.x - minD;
        else if (mi === 1) t.x = o.x + o.w + minD;
        else if (mi === 2) t.y = o.y - minD;
        else t.y = o.y + o.h + minD;
      }
    }
  }
}

function makeTank(cfg: TankConfig, x: number, y: number, angle: number, isPlayer: boolean): TankState {
  const mhp = toHp(cfg.armor);
  return { x, y, bodyAngle: angle, turretAngle: angle, hp: mhp, maxHp: mhp, config: cfg,
    cooldown: 0, isPlayer, hitFlash: 0, alive: true, prevX: x, prevY: y, stuckFrames: 0, stuckAngle: 0, treadOffset: 0, thought: '' };
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

  // Stronger jitter at close range to break symmetry
  const jitterAmp = dist < TANK_R * 6 ? 0.18 : 0.06;
  const jitter = Math.sin(game.frame * 0.047 + (tank.isPlayer ? 0 : 137)) * jitterAmp;

  switch (tank.config.strategy) {
    case 'aggressive':
      wantBody = toFoe;
      moveDir = dist > TANK_R * 5 ? 1 : 0;
      wantFire = dist < myRng * 1.2;
      aimTh = 0.4;
      tank.thought = moveDir ? 'Closing distance...' : 'Point blank — engaging!';
      break;
    case 'defensive':
      if (dist < myRng * 0.45) { wantBody = toFoe + Math.PI; moveDir = 1;
        tank.thought = 'Too close — retreating...';
      } else if (dist < myRng * 0.8) {
        wantBody = toFoe + (Math.PI / 2) * (game.frame % 280 < 140 ? 1 : -1);
        moveDir = 1;
        tank.thought = 'Maintaining safe distance...';
      } else { wantBody = toFoe; moveDir = 0;
        tank.thought = 'Holding position...';
      }
      wantFire = dist < myRng;
      aimTh = 0.22;
      break;
    case 'flanker': {
      const ideal = myRng * 0.6;
      if (dist > ideal * 1.5) { wantBody = toFoe + Math.PI * 0.25;
        tank.thought = 'Approaching at angle...';
      } else if (dist < ideal * 0.55) { wantBody = toFoe + Math.PI * 0.75;
        tank.thought = 'Too close — peeling off...';
      } else { wantBody = toFoe + Math.PI / 2;
        tank.thought = 'Circling target...';
      }
      moveDir = 1;
      wantFire = dist < myRng;
      aimTh = 0.35;
      break;
    }
    case 'sniper': {
      const ideal = myRng * 0.78;
      if (dist < ideal * 0.55) { wantBody = toFoe + Math.PI; moveDir = 1;
        tank.thought = 'Too close — pulling back...';
      } else if (dist > ideal * 1.15) { wantBody = toFoe; moveDir = 1;
        tank.thought = 'Moving into range...';
      } else { wantBody = toFoe; moveDir = 0;
        tank.thought = 'In position — lining up shot...';
      }
      wantFire = dist < myRng;
      aimTh = 0.1;
      break;
    }
    case 'balanced':
      if (hpPct > 0.5) { wantBody = toFoe; moveDir = dist > myRng * 0.35 ? 1 : 0; aimTh = 0.35;
        tank.thought = moveDir ? 'Health good — advancing...' : 'In range — engaging...';
      } else { wantBody = dist < myRng * 0.45 ? toFoe + Math.PI : toFoe; moveDir = dist < myRng * 0.45 ? 1 : 0; aimTh = 0.2;
        tank.thought = moveDir ? 'Taking damage — falling back...' : 'Playing cautious...';
      }
      wantFire = dist < myRng;
      break;
  }

  wantBody += jitter;

  // Close-range circling: never park nose-to-nose
  if (dist < TANK_R * 5 && moveDir === 0) {
    const side = ((game.frame + (tank.isPlayer ? 0 : 70)) % 220 < 110) ? 1 : -1;
    wantBody = toFoe + (Math.PI * 0.55) * side;
    moveDir = 1;
    tank.thought = 'Close quarters — strafing!';
  }

  // ── Enemy intelligence upgrades ──
  let aimAt = toFoe;
  let tTurnBoost = 0;

  if (!tank.isPlayer) {
    switch (tank.config.name) {
      case 'Turtle': {
        // Tighter aim than base defensive
        aimTh = Math.min(aimTh, 0.18);
        // Desperation mode: go aggressive below 35% HP
        if (hpPct < 0.35) {
          wantBody = toFoe;
          moveDir = 1;
          aimTh = 0.35;
          wantFire = true;
          tank.thought = 'Shell cracked — going all in!';
        }
        // Smarter retreats: prefer backing toward arena center when fleeing
        if (moveDir === 1 && Math.abs(angleDiff(wantBody, toFoe + Math.PI)) < 0.6) {
          const toCenterX = W / 2 - tank.x, toCenterY = H / 2 - tank.y;
          const toCenter = Math.atan2(toCenterY, toCenterX);
          wantBody = toFoe + Math.PI * 0.7 + angleDiff(toFoe + Math.PI, toCenter) * 0.3;
          tank.thought = 'Retreating to center...';
        }
        break;
      }
      case 'Ghost': {
        // Lead targeting (moderate — 50% prediction)
        const gSpd = toSpd(foe.config.speed);
        const gVx = Math.cos(foe.bodyAngle) * gSpd;
        const gVy = Math.sin(foe.bodyAngle) * gSpd;
        const gFrames = dist / BULLET_SPD;
        aimAt = Math.atan2(
          foe.y + gVy * gFrames * 0.5 - tank.y,
          foe.x + gVx * gFrames * 0.5 - tank.x
        );
        tTurnBoost = 0.012;
        aimTh = Math.min(aimTh, 0.28);

        // Extra wobble — hard to hit
        wantBody += Math.sin(game.frame * 0.09 + 42) * 0.25;

        // Bullet dodge: jink sideways when a bullet is heading our way
        for (const b of game.bullets) {
          if (b.owner === 'enemy') continue;
          const bDx = b.x - tank.x, bDy = b.y - tank.y;
          const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
          if (bDist < 65) {
            const bAngle = Math.atan2(b.dy, b.dx);
            const toMe = Math.atan2(-bDy, -bDx);
            const bDiff = angleDiff(bAngle, toMe);
            if (Math.abs(bDiff) < 0.5) {
              wantBody = bAngle + (Math.PI / 2) * (bDiff > 0 ? 1 : -1);
              moveDir = 1;
              tank.thought = 'Phasing — dodging incoming!';
              break;
            }
          }
        }
        break;
      }
      case 'Railgun': {
        // Strong lead targeting (75% prediction)
        const rSpd = toSpd(foe.config.speed);
        const rVx = Math.cos(foe.bodyAngle) * rSpd;
        const rVy = Math.sin(foe.bodyAngle) * rSpd;
        const rFrames = dist / BULLET_SPD;
        aimAt = Math.atan2(
          foe.y + rVy * rFrames * 0.75 - tank.y,
          foe.x + rVx * rFrames * 0.75 - tank.x
        );
        tTurnBoost = 0.008;

        // Very precise aim — only fires when dialed in
        aimTh = 0.08;

        // Post-shot repositioning: sidestep after firing
        if (tank.cooldown > toCd(tank.config.rate) * 0.7) {
          const stepDir = game.frame % 300 < 150 ? 1 : -1;
          wantBody = toFoe + (Math.PI / 2) * stepDir;
          moveDir = 1;
          tank.thought = 'Repositioning after shot...';
        }

        // Bullet dodge (wider detection range)
        for (const b of game.bullets) {
          if (b.owner === 'enemy') continue;
          const bDx = b.x - tank.x, bDy = b.y - tank.y;
          const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
          if (bDist < 85) {
            const bAngle = Math.atan2(b.dy, b.dx);
            const toMe = Math.atan2(-bDy, -bDx);
            const bDiff = angleDiff(bAngle, toMe);
            if (Math.abs(bDiff) < 0.4) {
              wantBody = bAngle + (Math.PI / 2) * (bDiff > 0 ? 1 : -1);
              moveDir = 1;
              tank.thought = 'Incoming — sidestepping!';
              break;
            }
          }
        }
        break;
      }
    }
  }

  // Stuck detection
  if (game.frame % 25 === 0) {
    const moved = Math.sqrt((tank.x - tank.prevX) ** 2 + (tank.y - tank.prevY) ** 2);
    if (moved < 2 && moveDir !== 0) {
      tank.stuckAngle = wantBody + (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.4 + Math.random() * Math.PI * 0.6);
      tank.stuckFrames = 35;
    }
    tank.prevX = tank.x; tank.prevY = tank.y;
  }
  if (tank.stuckFrames > 0) { wantBody = tank.stuckAngle; moveDir = 1; tank.stuckFrames--;
    tank.thought = 'Path blocked — rerouting...';
  }

  // Rotate body
  const bTurn = 0.04 + toSpd(tank.config.speed) * 0.009;
  const bd = angleDiff(tank.bodyAngle, wantBody);
  tank.bodyAngle += Math.abs(bd) > bTurn ? Math.sign(bd) * bTurn : bd;

  // Rotate turret toward target (lead position for smart enemies)
  const tTurn = 0.065 + tTurnBoost;
  const td = angleDiff(tank.turretAngle, aimAt);
  tank.turretAngle += Math.abs(td) > tTurn ? Math.sign(td) * tTurn : td;

  // Move
  if (moveDir !== 0) {
    const nx = tank.x + Math.cos(tank.bodyAngle) * mySpd * moveDir;
    const ny = tank.y + Math.sin(tank.bodyAngle) * mySpd * moveDir;
    if (inBounds(nx, ny, TANK_R) && !hitsAny(nx, ny, TANK_R + 4, game.obstacles)) {
      tank.treadOffset += mySpd * moveDir;
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
    color: tank.isPlayer ? '#7DD3FC' : (ENEMY_STYLES[tank.config.name]?.flash || '#FCA5A5'), size: 5 });
}

function stepGame(g: GameState) {
  g.frame++;
  const pairs: [TankState, TankState][] = [[g.player, g.enemy], [g.enemy, g.player]];
  for (const [t, f] of pairs) {
    if (runAI(t, f, g)) spawnBullet(t, g);
    t.hitFlash = Math.max(0, t.hitFlash - 1);
  }

  // Tank-to-tank separation — prevent overlapping
  if (g.player.alive && g.enemy.alive) {
    const sx = g.player.x - g.enemy.x, sy = g.player.y - g.enemy.y;
    const sd = Math.sqrt(sx * sx + sy * sy);
    const minSep = TANK_R * 2.5;
    if (sd < minSep && sd > 0.1) {
      const push = (minSep - sd) * 0.35;
      const nx = (sx / sd) * push, ny = (sy / sd) * push;
      g.player.x += nx; g.player.y += ny;
      g.enemy.x -= nx; g.enemy.y -= ny;
    }
  }

  // Hard-clamp both tanks inside arena and outside obstacles
  if (g.player.alive) clampTank(g.player, g.obstacles);
  if (g.enemy.alive) clampTank(g.enemy, g.obstacles);

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
            color: tgt.isPlayer ? P_COLOR : getEnemyColor(tgt.config.name), size: 2.5 + Math.random() * 4 });
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

  // Grid (aligned to obstacle grid)
  ctx.strokeStyle = 'rgba(26,26,46,0.018)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += G) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += G) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Border
  ctx.strokeStyle = 'rgba(26,26,46,0.07)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(1, 1, W - 2, H - 2, 10); ctx.stroke();

  // Obstacles (LEGO bricks)
  for (const o of g.obstacles) {
    // Drop shadow
    ctx.fillStyle = 'rgba(26,26,46,0.05)';
    ctx.beginPath(); ctx.roundRect(o.x + 1.5, o.y + 1.5, o.w, o.h, 3); ctx.fill();

    // Brick body
    ctx.fillStyle = '#D4CFC7';
    ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 3); ctx.fill();

    // Top highlight edge
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.roundRect(o.x + 1, o.y + 0.5, o.w - 2, 2, 1); ctx.fill();

    // Bottom shadow edge
    ctx.fillStyle = 'rgba(26,26,46,0.06)';
    ctx.fillRect(o.x + 2, o.y + o.h - 1.5, o.w - 4, 1);

    // Studs (one per grid cell)
    const cols = Math.round(o.w / G);
    const rows = Math.round(o.h / G);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = o.x + c * G + G / 2;
        const cy = o.y + r * G + G / 2;
        // Stud shadow
        ctx.fillStyle = 'rgba(26,26,46,0.04)';
        ctx.beginPath(); ctx.arc(cx + 0.5, cy + 0.5, 3.5, 0, Math.PI * 2); ctx.fill();
        // Stud face
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
        // Stud highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(cx - 0.7, cy - 0.7, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // Bullets
  const eBulletColor = getEnemyColor(g.enemy.config.name);
  for (const b of g.bullets) {
    const c = b.owner === 'player' ? P_COLOR : eBulletColor;
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

    const es = ENEMY_STYLES[t.config.name];
    const col = t.isPlayer ? P_COLOR : (es?.body || E_COLOR);
    const baseAlpha = t.alive ? 1 : Math.max(0, (g.endTimer - 20) / 60);

    // Ghost: flickering transparency
    const isGhost = !t.isPlayer && t.config.name === 'Ghost';
    const ghostMul = isGhost ? (0.62 + Math.sin(g.frame * 0.15) * 0.2 + Math.sin(g.frame * 0.37) * 0.13) : 1;
    ctx.globalAlpha = baseAlpha * ghostMul;

    // Stat-dependent visual sizes (collision still uses TANK_R)
    const vR = TANK_R + (t.config.armor - 2) * 1.2;
    const vTurretLen = TURRET_LEN + (t.config.range - 2) * 1.8;
    const vTurretW = 3.5 + (t.config.power - 2) * 0.5;

    // ── Ghost afterimages ──
    if (isGhost && t.alive) {
      const spd = toSpd(t.config.speed);
      for (let gi = 3; gi >= 1; gi--) {
        const gx = t.x - Math.cos(t.bodyAngle) * spd * gi * 5;
        const gy = t.y - Math.sin(t.bodyAngle) * spd * gi * 5;
        ctx.globalAlpha = (0.13 - gi * 0.03) * (0.5 + Math.sin(g.frame * 0.08 + gi) * 0.5);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(gx, gy, vR, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = baseAlpha * ghostMul;
    }

    // ── Treads ──
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.bodyAngle + Math.PI / 2);
    const treadW = 5 + (t.config.armor - 2) * 0.3;
    const treadH = vR * 2 + 4;
    const treadX = vR - 1.5;
    const treadColor = t.hitFlash > 0 ? '#DDD' : (t.isPlayer ? '#0284C7' : (es?.tread || '#BE123C'));
    const treadShadow = 'rgba(26,26,46,0.12)';
    for (const side of [-1, 1]) {
      const px = side * treadX;
      ctx.fillStyle = treadShadow;
      ctx.beginPath(); ctx.roundRect(px - treadW / 2 + 1, -treadH / 2 + 1, treadW, treadH, 2); ctx.fill();
      ctx.fillStyle = treadColor;
      ctx.beginPath(); ctx.roundRect(px - treadW / 2, -treadH / 2, treadW, treadH, 2); ctx.fill();
    }
    const treadOff = ((t.treadOffset * 1.5) % 6 + 6) % 6;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let ny = -treadH / 2 + 2 + treadOff; ny < treadH / 2 - 1; ny += 6) {
      const nw = treadW - 2, nh = 1.5;
      ctx.fillRect(-treadX - nw / 2, ny, nw, nh);
      ctx.fillRect(treadX - nw / 2, ny, nw, nh);
    }
    ctx.restore();

    // ── Shadow ──
    ctx.fillStyle = 'rgba(26,26,46,0.08)';
    ctx.beginPath(); ctx.arc(t.x + 1.5, t.y + 1.5, vR, 0, Math.PI * 2); ctx.fill();

    // ── Turtle: shield glow ──
    if (!t.isPlayer && t.config.name === 'Turtle' && t.alive) {
      ctx.save();
      ctx.globalAlpha = 0.07 + Math.sin(g.frame * 0.03) * 0.04;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(t.x, t.y, vR + 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = baseAlpha;
    }

    // ── Body ──
    ctx.fillStyle = t.hitFlash > 0 ? '#FFF' : col;
    ctx.beginPath(); ctx.arc(t.x, t.y, vR, 0, Math.PI * 2); ctx.fill();

    // ── Per-enemy body decorations ──
    if (!t.isPlayer && t.alive) {
      switch (t.config.name) {
        case 'Rookie': {
          // Simple target circle
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.arc(t.x, t.y, vR * 0.45, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.beginPath(); ctx.arc(t.x, t.y, 2, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'Scout': {
          // Forward-pointing chevron
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.bodyAngle);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-3, -3.5); ctx.lineTo(4, 0); ctx.lineTo(-3, 3.5);
          ctx.stroke();
          // Second chevron
          ctx.globalAlpha = (baseAlpha * ghostMul) * 0.15;
          ctx.beginPath();
          ctx.moveTo(-6, -3.5); ctx.lineTo(1, 0); ctx.lineTo(-6, 3.5);
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = baseAlpha * ghostMul;
          break;
        }
        case 'Turtle': {
          // Shell segments - hexagonal pattern
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 0.7;
          // Outer shell ring
          ctx.beginPath(); ctx.arc(t.x, t.y, vR - 1.5, 0, Math.PI * 2); ctx.stroke();
          // Inner ring
          ctx.beginPath(); ctx.arc(t.x, t.y, vR - 4.5, 0, Math.PI * 2); ctx.stroke();
          // Hex segment lines
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI * 2 * i) / 6 + t.bodyAngle;
            ctx.beginPath();
            ctx.moveTo(t.x + Math.cos(a) * (vR - 4.5), t.y + Math.sin(a) * (vR - 4.5));
            ctx.lineTo(t.x + Math.cos(a) * (vR - 1.5), t.y + Math.sin(a) * (vR - 1.5));
            ctx.stroke();
          }
          // Center dot
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.beginPath(); ctx.arc(t.x, t.y, 2.5, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'Ghost': {
          // Dashed ethereal ring
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2.5, 3]);
          ctx.lineDashOffset = g.frame * 0.3;
          ctx.beginPath(); ctx.arc(t.x, t.y, vR - 2, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
          // Eerie inner glow
          ctx.save();
          ctx.globalAlpha = 0.08 + Math.sin(g.frame * 0.06) * 0.05;
          ctx.fillStyle = '#DDD6FE';
          ctx.beginPath(); ctx.arc(t.x, t.y, vR * 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          ctx.globalAlpha = baseAlpha * ghostMul;
          break;
        }
        case 'Railgun': {
          // Crosshair targeting reticle
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.lineWidth = 0.6;
          const cr = vR * 0.5;
          ctx.beginPath(); ctx.moveTo(t.x - cr, t.y); ctx.lineTo(t.x - 2, t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x + 2, t.y); ctx.lineTo(t.x + cr, t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x, t.y - cr); ctx.lineTo(t.x, t.y - 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x, t.y + 2); ctx.lineTo(t.x, t.y + cr); ctx.stroke();
          ctx.beginPath(); ctx.arc(t.x, t.y, vR * 0.35, 0, Math.PI * 2); ctx.stroke();
          break;
        }
      }
    }

    // Armor rings (generic, for player)
    if (t.isPlayer && t.config.armor >= 4) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(t.x, t.y, vR - 2, 0, Math.PI * 2); ctx.stroke();
    }

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(t.x, t.y, vR * 0.7, 0, Math.PI * 2); ctx.stroke();

    // ── Railgun: targeting laser (behind turret layer looks better, but after body) ──
    if (!t.isPlayer && t.config.name === 'Railgun' && t.alive) {
      const laserLen = toRng(t.config.range);
      const lx = t.x + Math.cos(t.turretAngle) * (vR + vTurretLen);
      const ly = t.y + Math.sin(t.turretAngle) * (vR + vTurretLen);
      const lx2 = lx + Math.cos(t.turretAngle) * laserLen;
      const ly2 = ly + Math.sin(t.turretAngle) * laserLen;
      ctx.save();
      ctx.globalAlpha = 0.1 + Math.sin(g.frame * 0.1) * 0.05;
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx2, ly2); ctx.stroke();
      ctx.setLineDash([]);
      // Laser dot at end
      ctx.fillStyle = '#EF4444';
      ctx.globalAlpha = 0.2 + Math.sin(g.frame * 0.15) * 0.1;
      ctx.beginPath(); ctx.arc(lx2, ly2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = baseAlpha * ghostMul;
    }

    // ── Turret ──
    ctx.strokeStyle = col; ctx.lineWidth = vTurretW; ctx.lineCap = 'round';
    const tx1 = t.x + Math.cos(t.turretAngle) * 3;
    const ty1 = t.y + Math.sin(t.turretAngle) * 3;
    const tx2 = t.x + Math.cos(t.turretAngle) * (vR + vTurretLen - 3);
    const ty2 = t.y + Math.sin(t.turretAngle) * (vR + vTurretLen - 3);
    ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.stroke();

    // ── Railgun: muzzle brake ──
    if (!t.isPlayer && t.config.name === 'Railgun') {
      const brakeD = vR + vTurretLen - 8;
      const bx = t.x + Math.cos(t.turretAngle) * brakeD;
      const by = t.y + Math.sin(t.turretAngle) * brakeD;
      const pa = t.turretAngle + Math.PI / 2;
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(pa) * 4, by + Math.sin(pa) * 4);
      ctx.lineTo(bx - Math.cos(pa) * 4, by - Math.sin(pa) * 4);
      ctx.stroke();
    }

    // Tip dot
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(tx2, ty2, vTurretW * 0.35 + 0.5, 0, Math.PI * 2); ctx.fill();

    // ── Scout: speed lines behind ──
    if (!t.isPlayer && t.config.name === 'Scout' && t.alive) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 5;
        const perpA = t.bodyAngle + Math.PI / 2;
        const ox = Math.cos(perpA) * spread;
        const oy = Math.sin(perpA) * spread;
        const trail = vR + 4 + i * 3;
        const sx = t.x - Math.cos(t.bodyAngle) * trail + ox;
        const sy = t.y - Math.sin(t.bodyAngle) * trail + oy;
        const len = 8 + (2 - Math.abs(i - 1)) * 5;
        const ex = sx - Math.cos(t.bodyAngle) * len;
        const ey = sy - Math.sin(t.bodyAngle) * len;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    // ── HP bar ──
    if (t.alive) {
      const bw = 26, bh = 2.5, bx = t.x - bw / 2, by = t.y - vR - 9;
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

  // Player agent thought
  if (g.player.alive && g.player.thought && g.countdown <= 0) {
    const th = g.player.thought;
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const tm = ctx.measureText(th);
    const px = 10, py = 10;
    const pw = tm.width + 22, ph = 16;

    ctx.fillStyle = 'rgba(26,26,46,0.55)';
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 5); ctx.fill();

    ctx.fillStyle = P_COLOR;
    ctx.globalAlpha = 0.9;
    ctx.fillText('\u25b8', px + 5, py + 3.5);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(th, px + 15, py + 3.5);
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

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
    ctx.fillStyle = g.winner === 'player' ? '#16C79A' : getEnemyColor(g.enemy.config.name);
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
  const t = useTranslation('ch6');
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
  const previewRef = useRef<HTMLCanvasElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const prevThoughtsRef = useRef({ player: '', enemy: '' });
  const isMobile = useIsMobile();
  const previewAnimRef = useRef(0);
  const statsRef = useRef(stats);
  const strategyRef = useRef(strategy);
  statsRef.current = stats;
  strategyRef.current = strategy;

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

  const exitBattle = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    gameRef.current = null;
    setResult(null);
    setPhase('design');
  }, []);

  // Lock body scroll during fullscreen battle on mobile
  useEffect(() => {
    if (phase === 'battle' && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [phase, isMobile]);

  // Battle loop
  useEffect(() => {
    if (phase !== 'battle') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Reset brain log
    prevThoughtsRef.current = { player: '', enemy: '' };
    if (logRef.current) logRef.current.innerHTML = '';

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
        // Track thoughts for brain log
        const logEl = logRef.current;
        if (logEl) {
          const prev = prevThoughtsRef.current;
          const eName = g.enemy.config.name;
          const eCol = getEnemyColor(eName);
          if (g.player.thought && g.player.thought !== prev.player) {
            prev.player = g.player.thought;
            const d = document.createElement('div');
            d.style.cssText = `padding:2px 0;display:flex;align-items:baseline;gap:6px;`;
            d.innerHTML = `<span style="color:${P_COLOR};opacity:0.5;font-size:0.55rem;flex-shrink:0;">▸ ${(tankName || 'AGENT').toUpperCase()}</span><span style="color:${P_COLOR};opacity:0.85;">${g.player.thought}</span>`;
            logEl.appendChild(d);
          }
          if (g.enemy.thought && g.enemy.thought !== prev.enemy) {
            prev.enemy = g.enemy.thought;
            const d = document.createElement('div');
            d.style.cssText = `padding:2px 0;display:flex;align-items:baseline;gap:6px;`;
            d.innerHTML = `<span style="color:${eCol};opacity:0.5;font-size:0.55rem;flex-shrink:0;">◂ ${eName.toUpperCase()}</span><span style="color:${eCol};opacity:0.65;">${g.enemy.thought}</span>`;
            logEl.appendChild(d);
          }
          while (logEl.childElementCount > 80) logEl.removeChild(logEl.firstChild!);
          if (g.frame % 4 === 0) logEl.scrollTop = logEl.scrollHeight;
        }
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

  // Preview tank animation
  useEffect(() => {
    if (phase !== 'design') return;
    const canvas = previewRef.current;
    if (!canvas) return;

    const SIZE = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';

    let frame = 0;
    let running = true;
    let muzzleFlash = 0;

    const loop = () => {
      if (!running) return;
      frame++;
      const ctx = canvas.getContext('2d')!;
      const s = statsRef.current;
      const strat = strategyRef.current;
      const stratColor = STRATEGIES.find(st => st.key === strat)?.color || P_COLOR;

      ctx.clearRect(0, 0, SIZE * dpr, SIZE * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = SIZE / 2;
      const cy = SIZE / 2 + 4;

      // Stat-dependent sizes
      const bodyR = 16 + s.armor * 2.5;
      const turretLen = 14 + s.range * 4;
      const turretW = 3 + s.power * 0.7;
      const treadSpd = 0.2 + s.speed * 0.12;

      // Idle animation
      const bodyRock = Math.sin(frame * 0.025) * 0.08;
      const turretSway = Math.sin(frame * 0.018) * 0.35;
      const treadOff = (frame * treadSpd) % 7;
      const breathe = Math.sin(frame * 0.03) * 0.8;

      // Fire flash based on rate
      const fireInterval = Math.max(30, 120 - s.rate * 18);
      if (frame % fireInterval === 0) muzzleFlash = 8;
      if (muzzleFlash > 0) muzzleFlash--;

      const bodyAngle = -Math.PI / 2 + bodyRock;
      const turretAngle = bodyAngle + turretSway;

      // Ground shadow
      ctx.fillStyle = 'rgba(26,26,46,0.04)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + bodyR + 6, bodyR + 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Treads
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(bodyAngle + Math.PI / 2);
      const tW = 5 + s.armor * 0.4;
      const tH = bodyR * 2 + 6;
      const tX = bodyR - 1;
      const treadCol = '#0284C7';
      const treadShadow = 'rgba(26,26,46,0.1)';
      for (const side of [-1, 1]) {
        const px = side * tX;
        ctx.fillStyle = treadShadow;
        ctx.beginPath(); ctx.roundRect(px - tW / 2 + 1, -tH / 2 + 1, tW, tH, 2); ctx.fill();
        ctx.fillStyle = treadCol;
        ctx.beginPath(); ctx.roundRect(px - tW / 2, -tH / 2, tW, tH, 2); ctx.fill();
        // Tread notches
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let ny = -tH / 2 + 2 + treadOff; ny < tH / 2 - 1; ny += 7) {
          ctx.fillRect(px - (tW - 2) / 2, ny, tW - 2, 1.5);
        }
      }
      ctx.restore();

      // Body shadow
      ctx.fillStyle = 'rgba(26,26,46,0.08)';
      ctx.beginPath(); ctx.arc(cx + 1.5, cy + 1.5, bodyR, 0, Math.PI * 2); ctx.fill();

      // Body
      ctx.fillStyle = P_COLOR;
      ctx.beginPath(); ctx.arc(cx, cy, bodyR + breathe * 0.3, 0, Math.PI * 2); ctx.fill();

      // Armor rings
      if (s.armor >= 3) {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, bodyR - 3, 0, Math.PI * 2); ctx.stroke();
      }
      if (s.armor >= 5) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, bodyR - 6, 0, Math.PI * 2); ctx.stroke();
      }

      // Inner ring
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, bodyR * 0.55, 0, Math.PI * 2); ctx.stroke();

      // Turret barrel
      const tipX = cx + Math.cos(turretAngle) * (bodyR + turretLen - 2);
      const tipY = cy + Math.sin(turretAngle) * (bodyR + turretLen - 2);
      const baseX = cx + Math.cos(turretAngle) * (bodyR * 0.3);
      const baseY = cy + Math.sin(turretAngle) * (bodyR * 0.3);

      // Barrel shadow
      ctx.strokeStyle = 'rgba(26,26,46,0.08)';
      ctx.lineWidth = turretW + 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(baseX + 1, baseY + 1); ctx.lineTo(tipX + 1, tipY + 1); ctx.stroke();

      // Barrel
      ctx.strokeStyle = P_COLOR;
      ctx.lineWidth = turretW;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(tipX, tipY); ctx.stroke();

      // Barrel highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baseX + Math.cos(turretAngle + 0.3) * 1, baseY + Math.sin(turretAngle + 0.3) * 1);
      ctx.lineTo(tipX + Math.cos(turretAngle + 0.3) * 1, tipY + Math.sin(turretAngle + 0.3) * 1);
      ctx.stroke();

      // Tip dot
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.arc(tipX, tipY, turretW * 0.35, 0, Math.PI * 2); ctx.fill();

      // Muzzle flash
      if (muzzleFlash > 0) {
        const flashR = (turretW + 4) * (muzzleFlash / 8);
        const flashX = tipX + Math.cos(turretAngle) * 4;
        const flashY = tipY + Math.sin(turretAngle) * 4;
        ctx.globalAlpha = muzzleFlash / 8 * 0.6;
        ctx.fillStyle = '#7DD3FC';
        ctx.beginPath(); ctx.arc(flashX, flashY, flashR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(flashX, flashY, flashR * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Strategy indicator glow
      ctx.globalAlpha = 0.08 + Math.sin(frame * 0.04) * 0.04;
      ctx.fillStyle = stratColor;
      ctx.beginPath(); ctx.arc(cx, cy, bodyR + 10, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Speed lines (when speed is high)
      if (s.speed >= 3) {
        ctx.globalAlpha = 0.06 + s.speed * 0.02;
        ctx.strokeStyle = P_COLOR;
        ctx.lineWidth = 1;
        const linesCount = s.speed - 1;
        for (let i = 0; i < linesCount; i++) {
          const ly = cy + bodyR + 10 + i * 4;
          const lx = cx - bodyR * 0.6 + Math.sin(frame * 0.05 + i) * 3;
          ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 12 + s.speed * 3, ly); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      previewAnimRef.current = requestAnimationFrame(loop);
    };

    previewAnimRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(previewAnimRef.current); };
  }, [phase]);

  // ─── Container shell ───
  const oppColor = getEnemyColor(OPPONENTS[oppIdx].name);

  const shell = (body: ReactNode, headerCenter?: ReactNode) => (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(26,26,46,0.08)',
      boxShadow: '0 4px 40px rgba(26,26,46,0.09), 0 1px 3px rgba(26,26,46,0.05)',
    }}>
      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E, #1F2041)',
        padding: '11px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 7, height: 7, background: P_COLOR, borderRadius: 2,
            transform: 'rotate(45deg)', boxShadow: `0 0 6px ${P_COLOR}60`,
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.45)' }}>
            {t('agentArenaLabel', 'Agent Arena')}
          </span>
        </div>
        {headerCenter && <div style={{ flex: 1, textAlign: 'center' as const }}>{headerCenter}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {OPPONENTS.map((opp, i) => {
            const dotColor = ENEMY_STYLES[opp.name]?.body || E_COLOR;
            return (
              <div key={i} title={opp.name} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: wins[i] ? dotColor : 'rgba(255,255,255,0.1)',
                boxShadow: wins[i] ? `0 0 4px ${dotColor}50` : 'none',
                transition: 'all 0.3s',
              }} />
            );
          })}
        </div>
      </div>
      {/* Body */}
      <div style={{
        background: '#FEFDFB',
        padding: isMobile ? '16px 14px 20px' : '24px 28px 28px',
        backgroundImage: 'radial-gradient(circle, rgba(26,26,46,0.018) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {body}
      </div>
    </div>
  );

  // ─── DESIGN PHASE ───
  if (phase === 'design') return shell(
    <div>
      {/* Name */}
      <div style={{ maxWidth: 420, margin: '0 auto 1.25rem' }}>
        <input type="text" value={tankName} onChange={e => setTankName(e.target.value)}
          placeholder={t('nameYourAgent', 'Name your agent...')} maxLength={12}
          style={{ width: '100%', padding: '8px 14px', borderRadius: 8,
            border: '1px solid rgba(26,26,46,0.08)', background: '#FEFDFB',
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1A1A2E', outline: 'none',
            boxSizing: 'border-box' as const }}
          onFocus={e => e.currentTarget.style.borderColor = '#E9456030'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'}
        />
      </div>

      {/* Tank Preview (left) + Stats (right) — centered together, stacked on mobile */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const,
        gap: isMobile ? '0.75rem' : '1.5rem', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem' }}>
        {/* Tank Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <canvas ref={previewRef} style={{ borderRadius: 12, background: 'rgba(26,26,46,0.03)',
            border: '1px solid rgba(26,26,46,0.04)' }} />
        </div>

        {/* Stats */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            margin: '0 0 0.5rem', gap: 10 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: 0 }}>
              {t('capabilities', 'Capabilities')}
            </p>
            <div style={{ padding: '3px 10px', borderRadius: 100,
              background: remaining > 0 ? 'rgba(22,199,154,0.08)' : remaining === 0 ? 'rgba(26,26,46,0.04)' : 'rgba(233,69,96,0.08)',
              border: `1px solid ${remaining > 0 ? 'rgba(22,199,154,0.2)' : remaining === 0 ? 'rgba(26,26,46,0.08)' : 'rgba(233,69,96,0.15)'}`,
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
              color: remaining > 0 ? '#16C79A' : remaining === 0 ? '#6B7280' : '#E94560',
              whiteSpace: 'nowrap' as const }}>
              {remaining} {t('ptsLeft', 'pts left')}
            </div>
          </div>
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
      </div>

      {/* Strategy + Opponents + Deploy — centered column */}
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Strategy */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
            {t('strategyLabel', 'Strategy')} <span style={{ opacity: 0.5, fontWeight: 400, letterSpacing: 0, textTransform: 'none' as const }}>{t('systemPromptLabel', '(system prompt)')}</span>
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
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: 'var(--color-deep)', opacity: 0.45, margin: 0, lineHeight: 1.5 }}>
              {stratDef.prompt}
            </p>
          </div>
        </div>

        {/* Opponents */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
            {t('opponentLabel', 'Opponent')}
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            {OPPONENTS.map((opp, i) => {
              const ec = ENEMY_STYLES[opp.name]?.body || E_COLOR;
              return (
                <button key={i} onClick={() => setOppIdx(i)}
                  style={{ flex: 1, padding: '6px 6px', borderRadius: 8, textAlign: 'center' as const,
                    border: `1.5px solid ${oppIdx === i ? ec : 'rgba(26,26,46,0.06)'}`,
                    background: oppIdx === i ? `${ec}08` : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative' as const }}>
                  {wins[i] && (
                    <span style={{ position: 'absolute' as const, top: -3, right: -3, width: 13, height: 13,
                      borderRadius: '50%', background: '#16C79A', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>✓</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '0 0 1px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: ec, flexShrink: 0,
                      opacity: oppIdx === i ? 1 : 0.5 }} />
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700,
                      color: oppIdx === i ? ec : '#1A1A2E', margin: 0 }}>{opp.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deploy */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={startBattle}
            style={{ padding: '11px 32px', borderRadius: 100, border: 'none',
              background: '#1A1A2E', color: 'white',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s' }}>
            {t('deployToArena', 'Deploy to Arena')}
          </button>
        </div>
      </div>

      {/* Defeated count — full width centered */}
      {wins.some(Boolean) && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-subtle)',
          margin: '0.75rem 0 0', opacity: 0.5, textAlign: 'center' as const }}>
          {wins.filter(Boolean).length}/{OPPONENTS.length} {t('defeated', 'defeated')}
        </p>
      )}
    </div>,
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      color: 'rgba(255,255,255,0.25)' }}>Configure</span>
  );

  // ─── BATTLE PHASE ───
  if (phase === 'battle') {
    if (isMobile) {
      return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#1A1A2E',
          display: 'flex', flexDirection: 'column' as const,
          touchAction: 'none',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, background: P_COLOR, borderRadius: 2,
                transform: 'rotate(45deg)', boxShadow: `0 0 6px ${P_COLOR}60` }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.4)' }}>Arena</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: P_COLOR }}>
                {tankName || 'Agent'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                VS
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: oppColor }}>
                {OPPONENTS[oppIdx].name}
              </span>
            </div>
            <button onClick={exitBattle} aria-label="Exit battle"
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
              ✕
            </button>
          </div>
          {/* Canvas */}
          <div ref={containerRef} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', maxWidth: W, borderRadius: 6 }} />
          </div>
          {/* Brain Log */}
          <div style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' as const,
            padding: '10px 14px 16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexShrink: 0,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.2)' }}>
                {t('battleLog', 'Battle Log')}
              </span>
            </div>
            <div ref={logRef} style={{
              flex: 1, minHeight: 0, overflowY: 'auto' as const,
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.7,
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
              padding: '4px 0',
            }} />
          </div>
        </div>
      );
    }

    return shell(
      <div ref={containerRef} style={{ maxWidth: W, margin: '0 auto' }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8, width: '100%' }} />
      </div>,
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: P_COLOR }}>
          {tankName || 'Agent'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
          VS
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: oppColor }}>
          {OPPONENTS[oppIdx].name}
        </span>
      </div>
    );
  }

  // ─── RESULT PHASE ───
  // Find next unbeaten opponent (or a different one to suggest)
  const nextOpp = result?.won
    ? OPPONENTS.findIndex((_, i) => i !== oppIdx && !wins[i])
    : -1;

  const trySuggestion = result?.won && nextOpp === -1
    ? OPPONENTS.findIndex((_, i) => i !== oppIdx)
    : nextOpp;

  return shell(
    <div style={{ textAlign: 'center', padding: '1rem 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 0.75rem',
        background: result?.won ? 'rgba(22,199,154,0.08)' : 'rgba(233,69,96,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: result?.won ? '#16C79A' : '#E94560',
        fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
        {result?.won ? '✓' : '✗'}
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800,
        color: result?.won ? '#16C79A' : '#E94560', margin: '0 0 0.35rem' }}>
        {result?.won ? t('victoryLabel', 'Victory') : t('defeatedLabel', 'Defeated')}
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
          {t('agentInsight', 'Agent Insight')}
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
          {t('retryButton', 'Retry')}
        </button>
        {result?.won && trySuggestion !== -1 && (
          <button onClick={() => { setOppIdx(trySuggestion); setPhase('design'); }}
            style={{ padding: '9px 22px', borderRadius: 100, border: 'none',
              background: '#E94560', color: 'white',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
              cursor: 'pointer' }}>
            Try {OPPONENTS[trySuggestion].name} {!wins[trySuggestion] ? 'next' : ''}
          </button>
        )}
        <button onClick={() => setPhase('design')}
          style={{ padding: '9px 22px', borderRadius: 100, border: 'none',
            background: '#1A1A2E', color: 'white',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer' }}>
          {t('redesignButton', 'Redesign')}
        </button>
      </div>

      {/* Progress indicator when won */}
      {result?.won && (
        <div style={{ marginTop: '1.25rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-subtle)',
            margin: '0 0 0.5rem', opacity: 0.5 }}>
            {wins.filter(Boolean).length}/{OPPONENTS.length} {t('opponentsDefeated', 'opponents defeated')}
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {OPPONENTS.map((opp, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%',
                  background: wins[i] ? '#16C79A' : i === oppIdx ? 'rgba(233,69,96,0.15)' : 'rgba(26,26,46,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: wins[i] ? 'white' : 'var(--color-subtle)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.45rem', fontWeight: 800,
                  border: i === oppIdx && !wins[i] ? '1.5px solid #E94560' : 'none',
                  cursor: !wins[i] ? 'pointer' : 'default',
                  transition: 'all 0.15s' }}
                  onClick={() => { if (!wins[i]) { setOppIdx(i); setPhase('design'); } }}>
                  {wins[i] ? '✓' : ''}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--color-subtle)',
                  opacity: wins[i] ? 0.8 : 0.4 }}>
                  {opp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>,
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      color: result?.won ? '#16C79A' : 'rgba(255,255,255,0.3)' }}>
      {result?.won ? t('victoryLabel', 'Victory') : t('defeatedLabel', 'Defeated')}
    </span>
  );
}
