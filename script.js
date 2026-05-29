/* ============================================================
   ЭкоПотолкиСПБ — script.js
   ============================================================ */

'use strict';

/* ===== PRELOADER ===== */
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.body.style.overflow = 'hidden';

  // Скрываем после DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(hide, 400));
  } else {
    setTimeout(hide, 200);
  }

  // Принудительный таймаут — скрываем через 2 секунды в любом случае
  setTimeout(hide, 2000);
})();


/* ===== HEADER: sticky + burger ===== */
(function () {
  const header  = document.getElementById('header');
  const burger  = document.getElementById('burger');
  const nav     = document.getElementById('nav');
  if (!header) return;

  // Scroll → add/remove 'scrolled' class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger toggle
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('active');
      nav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close nav when link clicked
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && nav.classList.contains('open')) {
        burger.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();


/* ===== SMOOTH SCROLL ===== */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ===== SCROLL BUTTONS ===== */
(function () {
  const btnTop    = document.getElementById('scrollTop');
  const btnBottom = document.getElementById('scrollBottom');
  if (!btnTop || !btnBottom) return;

  const update = () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    btnTop.classList.toggle('visible', scrolled > 300);
    btnBottom.classList.toggle('visible', scrolled < maxScroll - 200);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

window.scrollToTop = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.scrollToBottom = function () {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

/* ===== FLOAT BUTTONS ===== */
(function () {
  const btns = document.getElementById('floatBtns');
  if (!btns) return;
  const show = () => btns.classList.toggle('visible', window.scrollY > 300);
  window.addEventListener('scroll', show, { passive: true });
  show();
})();


/* ===== AOS — scroll animations ===== */
(function () {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const delay = parseInt(el.dataset.aosDelay) || 0;
      setTimeout(() => el.classList.add('aos-animate'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ===== COUNTERS ===== */
(function () {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const easeOutQuad = t => 1 - (1 - t) * (1 - t);

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target);
    const duration = 1800;
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.textContent  = Math.round(easeOutQuad(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ===== PROMO TIMER ===== */
(function () {
  const daysEl  = document.getElementById('tDays');
  const hoursEl = document.getElementById('tHours');
  const minsEl  = document.getElementById('tMins');
  if (!daysEl) return;

  const pad = n => String(n).padStart(2, '0');

  const tick = () => {
    const now  = new Date();
    const end  = new Date(now.getFullYear(), now.getMonth() + 1, 1); // начало следующего месяца
    const diff = Math.max(0, end - now);
    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    daysEl.textContent  = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
  };

  tick();
  setInterval(tick, 60000);
})();


/* ===== CALCULATOR ===== */
(function () {
  const lenInput   = document.getElementById('calcLen');
  const widInput   = document.getElementById('calcWid');
  const areaInput  = document.getElementById('calcArea');
  const lightsInput = document.getElementById('calcLights');
  if (!areaInput) return;

  const crArea     = document.getElementById('crArea');
  const crRate     = document.getElementById('crRate');
  const crCeil     = document.getElementById('crCeil');
  const crLightsRow = document.getElementById('crLightsRow');
  const crLightsQty = document.getElementById('crLightsQty');
  const crLights   = document.getElementById('crLights');
  const crTotal    = document.getElementById('crTotal');

  const fmt = n => n.toLocaleString('ru-RU');

  const getRate = () => {
    const checked = document.querySelector('input[name="ctype"]:checked');
    return checked ? parseInt(checked.value) : 1000;
  };

  const recalc = () => {
    const area   = parseFloat(areaInput.value) || 0;
    const rate   = getRate();
    const lights = parseInt(lightsInput?.value) || 0;
    const ceilCost   = Math.round(area * rate);
    const lightsCost = lights * 1000;
    const total      = ceilCost + lightsCost;

    if (crArea)      crArea.textContent  = area;
    if (crRate)      crRate.textContent  = fmt(rate);
    if (crCeil)      crCeil.textContent  = fmt(ceilCost) + ' ₽';
    if (crLightsRow) crLightsRow.style.display = lights > 0 ? '' : 'none';
    if (crLightsQty) crLightsQty.textContent   = lights;
    if (crLights)    crLights.textContent = fmt(lightsCost) + ' ₽';
    if (crTotal)     crTotal.textContent  = fmt(total);
  };

  // Len × Wid → Area
  const updateAreaFromDims = () => {
    const l = parseFloat(lenInput?.value) || 0;
    const w = parseFloat(widInput?.value) || 0;
    if (l > 0 && w > 0) {
      areaInput.value = (Math.round(l * w * 10) / 10).toFixed(1);
    }
    recalc();
  };

  lenInput?.addEventListener('input', updateAreaFromDims);
  widInput?.addEventListener('input', updateAreaFromDims);
  areaInput?.addEventListener('input', recalc);
  lightsInput?.addEventListener('input', recalc);
  document.querySelectorAll('input[name="ctype"]').forEach(r => r.addEventListener('change', recalc));

  recalc();
})();

/* Quantity buttons */
function adjustQty(delta) {
  const input = document.getElementById('calcLights');
  if (!input) return;
  const val = parseInt(input.value) || 0;
  input.value = Math.max(0, Math.min(100, val + delta));
  input.dispatchEvent(new Event('input'));
}


/* ===== FAQ ACCORDION ===== */
(function () {
  document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq__item.open').forEach(o => o.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* ===== PHONE MASK ===== */
(function () {
  const inputs = document.querySelectorAll('input[type="tel"]');

  inputs.forEach(input => {
    input.addEventListener('input', function (e) {
      let val = this.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7')) val = '7' + val;
      val = val.slice(0, 11);

      let formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.slice(1, 4);
      if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
      if (val.length >= 7) formatted += '-' + val.slice(7, 9);
      if (val.length >= 9) formatted += '-' + val.slice(9, 11);

      this.value = formatted;
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && this.value.length <= 2) {
        this.value = '';
      }
    });

    input.addEventListener('focus', function () {
      if (!this.value) this.value = '+7 ';
    });

    input.addEventListener('blur', function () {
      if (this.value === '+7 ' || this.value === '+7') this.value = '';
    });
  });
})();


/* ===== FORM SUBMIT ===== */
function submitForm(e) {
  e.preventDefault();
  const form  = e.target;
  const btn   = form.querySelector('.cform__submit');
  if (!btn) return;

  // Loading state
  const origText = btn.innerHTML;
  btn.innerHTML   = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0" stroke-dasharray="56" stroke-dashoffset="14" stroke-linecap="round"/></svg> Отправляем...';
  btn.disabled    = true;

  // Simulate sending (replace with real fetch/FormData when backend is ready)
  setTimeout(() => {
    btn.innerHTML = origText;
    btn.disabled  = false;
    form.reset();
    openModal();
  }, 1200);
}

function openModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


/* ===== HEADER ACTIVE LINK on scroll ===== */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  const headerH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 76;

  const onScroll = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - headerH() - 60) {
        current = sec.id;
      }
    });
    links.forEach(link => {
      const href = link.getAttribute('href');
      link.style.color = href === '#' + current
        ? 'var(--clr-accent-light)'
        : '';
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ===== PREMIER — password modal ===== */
(function () {
  const PREMIER_KEY  = 'premier_access';
  const PREMIER_PASS = '3852';

  window.openPremierModal = function () {
    // Уже авторизован в этой сессии — сразу переходим
    if (sessionStorage.getItem(PREMIER_KEY) === '1') {
      window.location.href = 'premier.html';
      return;
    }
    const modal = document.getElementById('premierModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const inp = document.getElementById('premierPasswordInput');
      if (inp) inp.focus();
    }, 200);
  };

  window.closePremierModal = function () {
    const modal = document.getElementById('premierModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    const inp = document.getElementById('premierPasswordInput');
    const err = document.getElementById('premierError');
    if (inp) { inp.value = ''; inp.classList.remove('error'); }
    if (err) err.classList.remove('visible');
  };

  window.checkPremierPassword = function () {
    const inp = document.getElementById('premierPasswordInput');
    const err = document.getElementById('premierError');
    if (!inp) return;
    if (inp.value.trim() === PREMIER_PASS) {
      sessionStorage.setItem(PREMIER_KEY, '1');
      closePremierModal();
      window.location.href = 'premier.html';
    } else {
      inp.classList.add('error');
      if (err) err.classList.add('visible');
      inp.value = '';
      setTimeout(() => inp.classList.remove('error'), 700);
      inp.focus();
    }
  };
})();

/* ===== SPIN KEYFRAMES (inline) ===== */
(function () {
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
})();
