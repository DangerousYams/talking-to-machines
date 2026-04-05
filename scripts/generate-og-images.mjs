/**
 * Generates OG images (1200x630) for social sharing.
 * - default.png: site logo + tagline
 * - ch1.png through ch11.png: chapter number + title with accent color
 *
 * Run: node scripts/generate-og-images.mjs
 */
import { createCanvas, loadImage, registerFont } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og');
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 630;
const CREAM = '#F8F6F3';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';

const chapters = [
  { num: 1,  title: 'You Already Speak AI', accent: '#E94560' },
  { num: 2,  title: 'The Art of Asking', accent: '#0F3460' },
  { num: 3,  title: 'Context Engineering', accent: '#7B61FF' },
  { num: 4,  title: 'The AI Landscape', accent: '#0EA5E9' },
  { num: 5,  title: 'Give It Tools', accent: '#F5A623' },
  { num: 6,  title: 'Building Agents', accent: '#E94560' },
  { num: 7,  title: 'Anyone Can Build This', accent: '#7B61FF' },
  { num: 8,  title: 'Speaking the Language', accent: '#0F3460' },
  { num: 9,  title: 'The Build Loop', accent: '#E94560' },
  { num: 10, title: 'Taste is the Product', accent: '#16C79A' },
  { num: 11, title: 'Build Something Real', accent: '#16C79A' },
];

// Draw the connected nodes graphic
function drawNodes(ctx, cx, cy, scale) {
  const nodes = [
    { x: -45, y: -55, r: 12, color: '#E94560' },  // red (small, top-left)
    { x: -80, y: -10, r: 22, color: '#7B61FF' },   // purple
    { x: 20,  y: -40, r: 28, color: '#16C79A' },   // teal (large)
    { x: -30, y: 40,  r: 14, color: '#00D4E8' },   // cyan
    { x: 30,  y: 50,  r: 24, color: '#E94560' },    // pink
    { x: -10, y: 0,   r: 20, color: '#F5A623' },    // orange
    { x: 60,  y: -5,  r: 12, color: '#00D4E8' },    // cyan (small)
  ];

  // Draw edges
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5 * scale;
  const edges = [[0,1],[0,2],[0,5],[1,3],[1,5],[2,5],[2,6],[3,4],[3,5],[4,5],[4,6],[5,6]];
  for (const [a, b] of edges) {
    ctx.beginPath();
    ctx.moveTo(cx + nodes[a].x * scale, cy + nodes[a].y * scale);
    ctx.lineTo(cx + nodes[b].x * scale, cy + nodes[b].y * scale);
    ctx.stroke();
  }

  // Draw nodes
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(cx + n.x * scale, cy + n.y * scale, n.r * scale, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.fill();
  }
}

// --- Default OG image ---
function generateDefault() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Subtle accent gradient at top
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, 'rgba(233,69,96,0.06)');
  grad.addColorStop(0.5, 'rgba(123,97,255,0.04)');
  grad.addColorStop(1, 'rgba(22,199,154,0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 8);

  // Node graphic
  drawNodes(ctx, 280, 300, 2.2);

  // Title
  ctx.fillStyle = DEEP;
  ctx.font = 'bold 72px serif';
  ctx.fillText('Talking to', 520, 260);
  ctx.fillStyle = '#E94560';
  ctx.font = 'bold 72px serif';
  ctx.fillText('Machines', 520, 340);

  // Tagline
  ctx.fillStyle = SUBTLE;
  ctx.font = '24px serif';
  ctx.fillText('A hands-on guide to AI', 520, 400);

  // URL
  ctx.fillStyle = '#B0B0B0';
  ctx.font = '16px monospace';
  ctx.fillText('talkingtomachines.xyz', 520, 560);

  writeFileSync(join(OUT, 'default.png'), canvas.toBuffer('image/png'));
  console.log('  default.png');
}

// --- Chapter OG images ---
function generateChapter(ch) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Accent bar at top
  ctx.fillStyle = ch.accent;
  ctx.fillRect(0, 0, W, 6);

  // Small nodes in top-right corner (decorative)
  drawNodes(ctx, 1050, 130, 1.0);

  // Chapter number (large, faded)
  ctx.fillStyle = ch.accent + '15';
  ctx.font = 'bold 280px serif';
  ctx.fillText(String(ch.num).padStart(2, '0'), 60, 350);

  // "Chapter X" label
  ctx.fillStyle = ch.accent;
  ctx.font = '18px monospace';
  ctx.fillText(`CHAPTER ${ch.num}`, 80, 400);

  // Chapter title
  ctx.fillStyle = DEEP;
  ctx.font = 'bold 56px serif';

  // Word wrap for long titles
  const words = ch.title.split(' ');
  let lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > 700) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);

  let y = 460;
  for (const l of lines) {
    ctx.fillText(l, 80, y);
    y += 68;
  }

  // Site name
  ctx.fillStyle = '#B0B0B0';
  ctx.font = '16px monospace';
  ctx.fillText('talkingtomachines.xyz', 80, 590);

  writeFileSync(join(OUT, `ch${ch.num}.png`), canvas.toBuffer('image/png'));
  console.log(`  ch${ch.num}.png`);
}

console.log('Generating OG images...');
generateDefault();
for (const ch of chapters) {
  generateChapter(ch);
}
console.log('Done!');
