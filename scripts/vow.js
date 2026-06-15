/* ============================================================
   VOW — motion & interaction
   ============================================================ */
(function(){
  'use strict';
  document.documentElement.dataset.vow = 'ran';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function inView(el, margin){
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const m = margin == null ? vh * 0.12 : margin;
    return r.top < vh - m && r.bottom > 0;
  }
  const watchers = [];
  function watch(el, cb, margin){ watchers.push({ el, cb, margin, done:false }); }
  function pump(){
    let allDone = true;
    for (const w of watchers){
      if (w.done) continue;
      if (inView(w.el, w.margin)) { w.done = true; w.cb(); } else { allDone = false; }
    }
    return allDone;
  }

  const revs = [...document.querySelectorAll('.reveal')];
  if (reduce) {
    revs.forEach(r => r.classList.add('show'));
  } else {
    revs.forEach(r => watch(r, () => r.classList.add('show')));
    setTimeout(() => revs.forEach(r => r.classList.add('show')), 2600);
  }

  const plx = [...document.querySelectorAll('[data-plx]')];
  if (!reduce && plx.length) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        plx.forEach(el => {
          const speed = parseFloat(el.dataset.plx) || 0.06;
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const off = (center - vh / 2) * speed;
          el.style.transform = `translate3d(0, ${(-off).toFixed(1)}px, 0)`;
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.glass-tilt').forEach(card => {
      let spec = card.querySelector('.spec');
      if (!spec) { spec = document.createElement('span'); spec.className = 'spec'; card.appendChild(spec); }
      const max = parseFloat(card.dataset.tilt) || 6;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', ((px - 0.5) * max).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (-(py - 0.5) * max).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  const navInner = document.querySelector('.nav-inner');
  if (navInner) {
    const setNav = () => {
      const s = window.scrollY > 24;
      navInner.classList.toggle('glass', s);
      navInner.style.transition = 'background .3s, box-shadow .3s, padding .3s';
    };
    setNav();
    window.addEventListener('scroll', setNav, { passive: true });
  }

  const navEl = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (navEl && navToggle) {
    const setOpen = (open) => {
      navEl.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setOpen(!navEl.classList.contains('open')));
    navEl.querySelectorAll('.nav-mobile a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 640) setOpen(false); }, { passive: true });
  }

  const chart = document.querySelector('.chart');
  if (chart) {
    const grow = () => chart.querySelectorAll('.col').forEach(c => {
      c.style.height = (c.dataset.h || '50') + '%';
    });
    if (reduce) { grow(); }
    else { watch(chart, grow, 40); }
  }

  const thread = document.getElementById('demoThread');
  if (thread) {
    const script = [
      { type: 'typing', delay: 600, dur: 1100 },
      { type: 'coach', delay: 0, html: 'Good morning. Yesterday you said you’d <b>run</b>. Talk to me.' },
      { type: 'actions', delay: 700 },
      { type: 'user', delay: 1600, html: 'I didn’t. Work ran late and I was wiped.' },
      { type: 'typing', delay: 400, dur: 1300 },
      { type: 'coach', delay: 0, html: 'Last Tuesday you told me <b>nothing could stop you this week</b>. It’s Thursday. One data point — not a relapse. Morning or evening tomorrow? Yes or no.' },
      { type: 'recorded', delay: 800 }
    ];

    function bubble(cls, html){
      const d = document.createElement('div');
      d.className = 'msg ' + cls;
      d.innerHTML = html;
      thread.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('in')));
      return d;
    }
    function typing(){
      const t = document.createElement('div');
      t.className = 'typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      thread.appendChild(t);
      return t;
    }
    function actions(){
      const a = document.createElement('div');
      a.className = 'demo-actions reveal';
      a.innerHTML = '<div class="a did">✓ I did it</div><div class="a didnt">✕ I didn’t</div>';
      thread.appendChild(a);
      requestAnimationFrame(() => a.classList.add('show'));
      return a;
    }
    function recorded(){
      const r = document.createElement('div');
      r.className = 'msg coach in';
      r.style.cssText = 'background:none;border:none;box-shadow:none;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);padding:6px 4px;';
      r.innerHTML = '● Recorded to commitment memory';
      thread.appendChild(r);
    }

    let i = 0;
    function step(){
      if (i >= script.length) { setTimeout(reset, 4200); return; }
      const s = script[i++];
      setTimeout(() => {
        if (s.type === 'typing') {
          const t = typing();
          setTimeout(() => { t.remove(); step(); }, s.dur);
        } else if (s.type === 'coach') { bubble('coach', s.html); step(); }
        else if (s.type === 'user') { bubble('user', s.html); step(); }
        else if (s.type === 'actions') { actions(); step(); }
        else if (s.type === 'recorded') { recorded(); step(); }
      }, s.delay);
    }
    function reset(){ thread.innerHTML = ''; i = 0; step(); }

    if (reduce) {
      bubble('coach', 'Good morning. Yesterday you said you’d <b>run</b>. Talk to me.');
      bubble('user', 'I didn’t. Work ran late and I was wiped.');
      bubble('coach', 'Last Tuesday you told me <b>nothing could stop you this week</b>. It’s Thursday. One data point — not a relapse. Morning or evening tomorrow? Yes or no.');
      thread.querySelectorAll('.msg').forEach(m => m.classList.add('in'));
    } else {
      watch(thread, step, 60);
    }
  }

  if (!reduce) {
    let raf = false;
    const drive = () => {
      if (raf) return; raf = true;
      requestAnimationFrame(() => { raf = false; pump(); });
    };
    window.addEventListener('scroll', drive, { passive: true });
    window.addEventListener('resize', drive, { passive: true });
    pump();
    [120, 400, 900].forEach(t => setTimeout(pump, t));
  }

  /* ---------- Founding-member waitlist (real, persisted count) ---------- */
  (function(){
    const forms = [...document.querySelectorAll(‘.waitlist’)];
    if (!forms.length) return;
    const SEED = 312;
    const LS_COUNT = ‘vow_founding_signups’;
    const LS_MINE  = ‘vow_founding_member_no’;

    const supabaseClient = (typeof supabase !== ‘undefined’)
      ? supabase.createClient(
          ‘https://mnzbancinfqkgxqfdrop.supabase.co’,
          ‘eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uemJhbmNpbmZxa2d4cWZkcm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mzk2NjUsImV4cCI6MjA5NzAxNTY2NX0.4GJTPavjmDDbq7AHd5hN3E0u9uIdmw_88o0fDoO-4Wc’
        )
      : null;

    const getSignups = () => parseInt(localStorage.getItem(LS_COUNT) || ‘0’, 10) || 0;
    const total = () => SEED + getSignups();
    const myNo = () => { const v = localStorage.getItem(LS_MINE); return v ? parseInt(v, 10) : null; };

    const countEls = () => [...document.querySelectorAll(‘[data-count]’)];
    function renderCount(v){ countEls().forEach(el => el.textContent = (v).toLocaleString()); }

    function markJoined(){
      const no = myNo();
      forms.forEach(f => {
        f.classList.add(‘done’);
        const ct = f.querySelector(‘.wl-confirm .ct’);
        if (ct && no) ct.innerHTML = "You’re in. You’re founding member <b>#" + no.toLocaleString() + "</b>.";
      });
    }

    let counted = false;
    function countUp(target){
      if (reduce) { renderCount(target); return; }
      const start = Math.max(0, target - 38), t0 = performance.now(), dur = 950;
      (function tick(now){
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        renderCount(Math.round(start + (target - start) * e));
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    }

    async function onSubmit(e){
      e.preventDefault();
      const f = e.currentTarget;
      const input = f.querySelector(‘.wl-input’);
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      const email = input ? input.value.trim() : ‘’;

      if (supabaseClient && email) {
        supabaseClient.from(‘waitlist’).insert({ email }).then(({ error }) => {
          if (error && error.code !== ‘23505’) {
            console.warn(‘Waitlist insert error:’, error.message);
          }
        });
      }

      if (myNo() === null) {
        const n = getSignups() + 1;
        localStorage.setItem(LS_COUNT, String(n));
        localStorage.setItem(LS_MINE, String(SEED + n));
      }
      renderCount(total());
      markJoined();
    }
    forms.forEach(f => f.addEventListener(‘submit’, onSubmit));

    if (myNo() !== null) {
      renderCount(total());
      markJoined();
    } else {
      renderCount(total());
      const anchor = forms[0];
      const fire = () => {
        if (counted) return;
        const r = anchor.getBoundingClientRect();
        if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
          counted = true; countUp(total());
          window.removeEventListener('scroll', fire);
        }
      };
      fire();
      window.addEventListener('scroll', fire, { passive: true });
      setTimeout(fire, 500);
    }
  })();

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
