// ===== ANIMATED BACKGROUND (Matrix Rain + Particles) =====
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], matrixCols = [], animId;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  initMatrix();
}

// Particles
function mkParticle() {
  return {
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: Math.random() * 1.2 + .3,
    a: Math.random() * .35 + .08,
    c: Math.random() > .5 ? '0,212,255' : '0,255,136'
  };
}

// Matrix columns
function initMatrix() {
  matrixCols = [];
  const cols = Math.floor(W / 20);
  for (let i = 0; i < cols; i++) {
    matrixCols.push({
      x: i * 20, y: Math.random() * H * -1,
      speed: Math.random() * 1 + .4,
      char: () => String.fromCharCode(0x30A0 + Math.random() * 96),
      alpha: Math.random() * .06 + .02
    });
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 45; i++) particles.push(mkParticle());
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Matrix rain (very subtle)
  matrixCols.forEach(col => {
    ctx.font = '11px Share Tech Mono';
    ctx.fillStyle = `rgba(0,212,255,${col.alpha})`;
    ctx.fillText(col.char(), col.x, col.y);
    col.y += col.speed;
    if (col.y > H) col.y = -20;
  });

  // Particle connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${(1 - d / 110) * .08})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }
  }

  // Particles
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.c},${p.a})`;
    ctx.fill();
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  });

  animId = requestAnimationFrame(draw);
}

resize();
initParticles();
draw();
window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });
document.addEventListener('visibilitychange', () => {
  document.hidden ? cancelAnimationFrame(animId) : draw();
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightNav();
}, { passive: true });

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = Array.from(document.querySelectorAll('section[id]'));
const navAs = document.querySelectorAll('.nav-links a');
function highlightNav() {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  navAs.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}

// ===== TYPING ANIMATION =====
const roles = ['Web Developer','ECE Engineer','Problem Solver','Python Enthusiast','Frontend Creator'];
let ri = 0, ci = 0, del = false;
const typed = document.getElementById('typed-role');
function typeRole() {
  const cur = roles[ri];
  typed.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
  del ? ci-- : ci++;
  if (!del && ci === cur.length) { del = true; return setTimeout(typeRole, 1800); }
  if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  setTimeout(typeRole, del ? 55 : 95);
}
typeRole();

// Hero tag
const tagEl = document.getElementById('typing-tag');
const tagTxt = 'Initializing profile...';
let ti = 0;
function typeTag() { if (ti < tagTxt.length) { tagEl.textContent += tagTxt[ti++]; setTimeout(typeTag, 55); } }
setTimeout(typeTag, 400);

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const isFloat = String(target).includes('.');
  const dur = 1500, step = 16;
  let cur = 0, start = null;
  function tick(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    cur = target * p;
    el.textContent = isFloat ? cur.toFixed(2) : Math.floor(cur) + '+';
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = isFloat ? target.toFixed(2) : target + '+';
  }
  requestAnimationFrame(tick);
}

// ===== AOS (Animate on Scroll) =====
const aosEls = document.querySelectorAll('[data-aos]');
const aosObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // animate counters
      e.target.querySelectorAll('[data-count]').forEach(animateCounter);
      // animate score bars
      e.target.querySelectorAll('.score-fill[data-width],.skill-fill[data-width]').forEach(b => {
        b.style.width = b.dataset.width;
      });
      // animate info rows
      e.target.querySelectorAll('.info-row').forEach((row, i) => {
        setTimeout(() => row.classList.add('visible'), i * 80);
      });
    }
  });
}, { threshold: 0.12 });
aosEls.forEach(el => aosObs.observe(el));

// Also trigger bars on scroll since they're not inside [data-aos] wrappers
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.score-fill[data-width],.skill-fill[data-width]').forEach(b => {
        b.style.width = b.dataset.width;
      });
      e.target.querySelectorAll('[data-count]').forEach(animateCounter);
      e.target.querySelectorAll('.info-row').forEach((r, i) => {
        setTimeout(() => r.classList.add('visible'), i * 80);
      });
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.timeline-card,.skill-card,.info-card').forEach(el => barObs.observe(el));

// ===== CERTIFICATE LIGHTBOX (static - reads from certs/ folder) =====
function openCert(imgSrc, title) {
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lb-img');
  const ttl  = document.getElementById('lb-title');
  const noC  = document.getElementById('lb-no-cert');

  ttl.textContent = title;
  img.style.display = 'none';
  noC.style.display = 'none';

  // Try loading the static image
  const testImg = new Image();
  testImg.onload = () => {
    img.src = imgSrc;
    img.style.display = 'block';
    noC.style.display = 'none';
  };
  testImg.onerror = () => {
    img.style.display = 'none';
    noC.style.display = 'block';
  };
  testImg.src = imgSrc;

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== PARTICIPATION SUMMARY TOGGLE =====
function toggleSummary(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
}

// ===== CONTACT FORM — EmailJS integration =====
// To make form actually send emails:
// 1. Sign up at https://www.emailjs.com (free)
// 2. Create a service + template
// 3. Replace the values below with yours
// 4. Uncomment the emailjs lines

const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const status = document.getElementById('form-status');
  const orig = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  const data = {
    from_name: this.name.value,
    reply_to: this.email.value,
    subject: this.subject.value,
    message: this.message.value,
    to_name: 'Rajesh Kumar'
  };

  // --- Option A: EmailJS (recommended) ---
  // emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data, EMAILJS_PUBLIC_KEY)
  //   .then(() => {
  //     status.textContent = '✓ Message sent successfully! I will reply soon.';
  //     status.className = 'form-status success';
  //     this.reset();
  //   })
  //   .catch(() => {
  //     status.textContent = '✗ Failed to send. Please email me directly.';
  //     status.className = 'form-status error';
  //   })
  //   .finally(() => { btn.innerHTML = orig; btn.disabled = false; });

  // --- Option B: mailto fallback (works offline, opens email client) ---
  const mailtoLink = `mailto:bomalleenirajeshkumar@gmail.com?subject=${encodeURIComponent(data.subject || 'Portfolio Contact')}&body=${encodeURIComponent('Name: ' + data.from_name + '\nEmail: ' + data.reply_to + '\n\n' + data.message)}`;
  window.location.href = mailtoLink;
  setTimeout(() => {
    status.textContent = '✓ Opening your email client... Alternatively email me directly!';
    status.className = 'form-status success';
    btn.innerHTML = orig;
    btn.disabled = false;
    this.reset();
  }, 800);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
