const CLOCK_CONFIG = [
  { idPrefix: 'philippines', timezone: 'Asia/Manila', instances: [''] },
  { idPrefix: 'us', timezone: 'America/New_York', instances: [''] },
  { idPrefix: 'uk', timezone: 'Europe/London', instances: [''] },
  { idPrefix: 'australia', timezone: 'Australia/Sydney', instances: [''] },
  { idPrefix: 'canada', timezone: 'America/Toronto', instances: [''] },
];

function updateDigitalAndDate(idPrefix, suffix, now, timezone) {
  const digitalEl = document.getElementById(`${idPrefix}-digital${suffix}`);
  const dateEl = document.getElementById(`${idPrefix}-date${suffix}`);

  if (digitalEl) {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = timeFormatter.formatToParts(now);
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    const second = parts.find((p) => p.type === 'second')?.value ?? '00';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';

    digitalEl.textContent = `${hour}:${minute}:${second} ${dayPeriod}`.trim();
  }

  if (dateEl) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    dateEl.textContent = dateFormatter.format(now);
  }
}

function drawAnalog(idPrefix, suffix, now, timezone) {
  const canvas = document.getElementById(`${idPrefix}-analog${suffix}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(now);

  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const s = Number(parts.find((p) => p.type === 'second')?.value ?? 0);

  const size = Math.min(canvas.width, canvas.height);
  const r = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(r, r);

  // Face
  ctx.beginPath();
  ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
  const grd = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
  grd.addColorStop(0, '#fefefe');
  grd.addColorStop(1, 'rgba(255,255,255,0.65)');
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Numbers
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `${r * 0.18}px Segoe UI, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  for (let num = 1; num <= 12; num++) {
    const angle = (num * Math.PI) / 6;
    const x = Math.sin(angle) * (r * 0.78);
    const y = -Math.cos(angle) * (r * 0.78);
    ctx.fillText(num.toString(), x, y);
  }

  // Ticks
  for (let i = 0; i < 60; i++) {
    const angle = (i * Math.PI) / 30;
    const outer = r - 10;
    const inner = i % 5 === 0 ? outer - 12 : outer - 6;
    ctx.beginPath();
    ctx.moveTo(Math.sin(angle) * inner, -Math.cos(angle) * inner);
    ctx.lineTo(Math.sin(angle) * outer, -Math.cos(angle) * outer);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = i % 5 === 0 ? 3 : 1.5;
    ctx.stroke();
  }

  const hour = ((h % 12) + m / 60 + s / 3600) * (Math.PI / 6);
  const minute = (m + s / 60) * (Math.PI / 30);
  const second = s * (Math.PI / 30);

  // Hour hand
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(Math.sin(hour) * (r * 0.5), -Math.cos(hour) * (r * 0.5));
  ctx.stroke();

  // Minute hand
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(Math.sin(minute) * (r * 0.72), -Math.cos(minute) * (r * 0.72));
  ctx.stroke();

  // Second hand
  ctx.strokeStyle = '#d84040';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(Math.sin(second) * (r * 0.78), -Math.cos(second) * (r * 0.78));
  ctx.stroke();

  // Center cap
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#d84040';
  ctx.fill();

  ctx.restore();
}

function initWorldClocks() {
  function tick() {
    const now = new Date();

    CLOCK_CONFIG.forEach((cfg) => {
      cfg.instances.forEach((suffix) => {
        updateDigitalAndDate(cfg.idPrefix, suffix, now, cfg.timezone);
        drawAnalog(cfg.idPrefix, suffix, now, cfg.timezone);
      });
    });
  }

  tick();
  setInterval(tick, 1000);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorldClocks);
} else {
  initWorldClocks();
}

