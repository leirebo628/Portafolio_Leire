/* =========================================================
   PORTFOLIO PERSONAL · script.js
   Índice:
   0. Utilidades
   1. Año del pie de página
   2. Tema claro / oscuro
   3. Menú móvil
   4. Scroll: cabecera, progreso, botón subir y enlace activo
   5. Animaciones de aparición (reveal)
   6. Efecto de escritura (inicio)
   7. Contadores y barras de habilidades
   8. Partículas del inicio
   9. Efecto tilt 3D en tarjetas
   10. Luz que sigue al cursor
   11. Filtros de proyectos
   12. Ventana modal de proyectos
   13. Formulario de contacto
   14. Copiar correo
   ========================================================= */

(() => {
  'use strict';

  /* ---------- 0. UTILIDADES ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mensaje emergente (toast)
  const toastEl = $('#toast');
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  // localStorage protegido por si el navegador lo bloquea
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
  };


  /* ---------- 1. AÑO DEL PIE ---------- */
  $('#year').textContent = new Date().getFullYear();


  /* ---------- 2. TEMA CLARO / OSCURO ---------- */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const themeIcon = $('.theme-icon', themeBtn);

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    $('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#0b1020' : '#f6f7ff');
  }

  // Tema guardado o, si no hay, la preferencia del sistema
  const savedTheme = store.get('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
    showToast(next === 'dark' ? '🌙 Tema oscuro activado' : '☀️ Tema claro activado');
  });


  /* ---------- 3. MENÚ MÓVIL ---------- */
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');

  function toggleMenu(open) {
    const isOpen = open ?? !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Cerrar el menú' : 'Abrir el menú');
  }
  menuBtn.addEventListener('click', () => toggleMenu());
  // Se cierra al elegir un enlace o al pulsar Escape
  $$('.nav-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });


  /* ---------- 4. SCROLL ---------- */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 20);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  // Enlace activo según la sección visible
  const sections = $$('main section[id]');
  const links = $$('.nav-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => sectionObserver.observe(s));


  /* ---------- 5. REVEAL ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Retraso escalonado entre elementos hermanos (efecto cascada)
  $$('.reveal').forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 90 + 'ms';
    revealObserver.observe(el);
  });


  /* ---------- 6. EFECTO DE ESCRITURA ---------- */
  const typingEl = $('#typing');
  // Cambia estas frases por las que quieras
  const phrases = [
    'estudiante de SMR',
    'apasionada de la informática',
    'futura técnica de sistemas',
    'amante de las redes y el hardware',
    'siempre aprendiendo cosas nuevas'
  ];

  if (reduceMotion) {
    typingEl.textContent = phrases[0];
  } else {
    let p = 0, c = 0, deleting = false;
    (function type() {
      const word = phrases[p];
      typingEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 80;

      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0)       { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
      else                                { c += deleting ? -1 : 1; }

      setTimeout(type, delay);
    })();
  }


  /* ---------- 7. CONTADORES Y BARRAS ---------- */
  function animateCount(el) {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1600;
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);          // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  function animateSkill(skill) {
    const bar = $('.bar span', skill);
    const pct = $('.skill-pct', skill);
    const level = +bar.dataset.level;
    bar.style.width = level + '%';
    // El porcentaje numérico sube a la vez que la barra
    const start = performance.now();
    (function step(now) {
      const t = reduceMotion ? 1 : Math.min((now - start) / 1400, 1);
      pct.textContent = Math.round(level * (1 - Math.pow(1 - t, 3))) + '%';
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  const dataObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.matches('[data-count]')) animateCount(el);
      if (el.matches('.skill')) animateSkill(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });

  $$('[data-count], .skill').forEach(el => dataObserver.observe(el));


  /* ---------- 8. PARTÍCULAS ---------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: null, y: null };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(Math.floor((W * H) / 14000), 90);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
      r: Math.random() * 1.8 + .8
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const color = root.getAttribute('data-theme') === 'dark' ? '160,150,255' : '91,61,245';

    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},.8)`;
      ctx.fill();

      // Líneas entre partículas cercanas
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(${color},${(1 - d / 120) * .25})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      // Las partículas se unen al cursor
      if (mouse.x !== null) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 150) {
          ctx.strokeStyle = `rgba(25,211,218,${(1 - d / 150) * .5})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    });
    requestAnimationFrame(drawParticles);
  }

  if (!reduceMotion) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    $('#inicio').addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    $('#inicio').addEventListener('pointerleave', () => { mouse.x = mouse.y = null; });
    drawParticles();
  }


  /* ---------- 9. EFECTO TILT 3D ---------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && !reduceMotion) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }


  /* ---------- 10. LUZ DEL CURSOR ---------- */
  const glow = $('#cursorGlow');
  if (canHover && !reduceMotion) {
    window.addEventListener('pointermove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
  }


  /* ---------- 11. FILTROS DE PROYECTOS ---------- */
  const filterBtns = $$('.filter');
  const cards = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.category.split(' ').includes(f);
        card.classList.toggle('hide', !show);
        if (show) {
          card.classList.add('visible');        // evita que quede oculta por el reveal
          card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
        }
      });
    });
  });


  /* ---------- 12. MODAL DE PROYECTOS ---------- */
  const modal = $('#projectModal');
  const modalThumb = $('#modalThumb');
  const modalTitle = $('#modalTitle');
  const modalTags = $('#modalTags');
  const modalContent = $('#modalContent');
  const modalActions = $('#modalActions');
  let lastTrigger = null;

  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      const thumb = $('.project-thumb', card);

      // Copia los datos de la tarjeta dentro de la modal
      modalThumb.className = 'modal-thumb ' + [...thumb.classList].find(c => c.startsWith('thumb-'));
      modalThumb.textContent = $('span', thumb).textContent;
      modalTitle.textContent = $('h3', card).textContent;
      modalTags.innerHTML = $('.tags', card).innerHTML;
      modalContent.innerHTML = $('.project-extra', card).innerHTML;
      modalActions.innerHTML = $('.project-actions', card).innerHTML;
      $('[data-open-modal]', modalActions)?.remove();   // no hace falta el botón "Detalles" dentro de la modal
      modalActions.hidden = !modalActions.children.length;

      lastTrigger = btn;
      modal.showModal();
    });
  });

  function closeModal() { modal.close(); }
  $('#modalClose').addEventListener('click', closeModal);
  // Se cierra al hacer clic fuera de la caja
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  // Devuelve el foco al botón que abrió la modal
  modal.addEventListener('close', () => lastTrigger?.focus());


  /* ---------- 13. FORMULARIO DE CONTACTO ---------- */
  const form = $('#contactForm');
  const fields = {
    name:    { el: $('#name'),    err: $('#nameError') },
    email:   { el: $('#email'),   err: $('#emailError') },
    message: { el: $('#message'), err: $('#messageError') }
  };
  const status = $('#formStatus');
  const submitBtn = $('#submitBtn');
  const counter = $('#counter');

  const validators = {
    name: v => v.trim().length < 2 ? 'Escribe tu nombre (mínimo 2 caracteres).' : '',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Introduce un correo electrónico válido.',
    message: v => v.trim().length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : ''
  };

  function validateField(key) {
    const { el, err } = fields[key];
    const msg = validators[key](el.value);
    err.textContent = msg;
    el.parentElement.classList.toggle('invalid', !!msg);
    el.parentElement.classList.toggle('valid', !msg && el.value !== '');
    el.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }

  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.parentElement.classList.contains('invalid')) validateField(key);
    });
  });

  fields.message.el.addEventListener('input', () => {
    counter.textContent = `${fields.message.el.value.length} / 500`;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    status.textContent = ''; status.className = 'form-status';

    const allValid = Object.keys(fields).map(validateField).every(Boolean);
    if (!allValid) {
      status.textContent = 'Revisa los campos marcados.';
      $('.invalid input, .invalid textarea', form)?.focus();
      return;
    }

    // Esta web no tiene servidor: se abre la aplicación de correo del visitante
    // con el mensaje ya redactado y dirigido a tu dirección.
    const to = $('#emailText').textContent.trim();
    const name = fields.name.el.value.trim();
    const subject = `Mensaje desde tu portfolio - ${name}`;
    const body = `${fields.message.el.value.trim()}\n\n—\n${name}\n${fields.email.el.value.trim()}`;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    submitBtn.classList.add('loading');
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      window.location.href = mailto;
      status.textContent = `✅ Gracias, ${name.split(' ')[0]}. Se abrirá tu aplicación de correo para enviar el mensaje.`;
      status.classList.add('ok');
      showToast('📨 Abriendo tu aplicación de correo');
    }, 700);
  });


  /* ---------- 14. COPIAR CORREO ---------- */
  $('#copyEmail').addEventListener('click', async () => {
    const email = $('#emailText').textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      showToast('📋 Correo copiado al portapapeles');
    } catch {
      showToast('No se ha podido copiar. Hazlo manualmente 🙂');
    }
  });

})();
