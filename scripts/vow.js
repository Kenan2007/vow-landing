/* ============================================================
   VOW — motion & interaction
   ============================================================ */
(function(){
  'use strict';
  document.documentElement.dataset.vow = 'ran';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Visibility helper (rect-based, robust in preview iframes) ---------- */
  function inView(el, margin){
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const m = margin == null ? vh * 0.12 : margin;
    return r.top < vh - m && r.bottom > 0;
  }
  // registry of one-shot triggers: {el, cb, done}
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

  /* ---------- Reveal on scroll ---------- */
  const revs = [...document.querySelectorAll('.reveal')];
  if (reduce) {
    revs.forEach(r => r.classList.add('show'));
  } else {
    revs.forEach(r => watch(r, () => r.classList.add('show')));
    // hard failsafe: nothing stays hidden, even if scroll never happens
    setTimeout(() => revs.forEach(r => r.classList.add('show')), 2600);
  }

  /* ---------- Parallax drift on glass objects ---------- */
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

  /* ---------- Hover refraction (tilt + specular) ---------- */
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

  /* ---------- Nav scrolled state ---------- */
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

  /* ---------- DNA chart grow ---------- */
  const chart = document.querySelector('.chart');
  if (chart) {
    const grow = () => chart.querySelectorAll('.col').forEach(c => {
      c.style.height = (c.dataset.h || '50') + '%';
    });
    if (reduce) { grow(); }
    else { watch(chart, grow, 40); }
  }

  /* ---------- Animated check-in demo ---------- */
  const thread = document.getElementById('demoThread');
  if (thread) {
    const script = [
      { type: 'typing', delay: 600, dur: 1100 },
      { type: 'coach', delay: 0, html: 'Good morning. Yesterday you said you\u2019d <b>run</b>. Talk to me.' },
      { type: 'actions', delay: 700 },
      { type: 'user', delay: 1600, html: 'I didn\u2019t. Work ran late and I was wiped.' },
      { type: 'typing', delay: 400, dur: 1300 },
      { type: 'coach', delay: 0, html: 'Last Tuesday you told me <b>nothing could stop you this week</b>. It\u2019s Thursday. One data point \u2014 not a relapse. Morning or evening tomorrow? Yes or no.' },
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
      a.innerHTML = '<div class="a did">\u2713 I did it</div><div class="a didnt">\u2715 I didn\u2019t</div>';
      thread.appendChild(a);
      requestAnimationFrame(() => a.classList.add('show'));
      return a;
    }
    function recorded(){
      const r = document.createElement('div');
      r.className = 'msg coach in';
      r.style.cssText = 'background:none;border:none;box-shadow:none;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);padding:6px 4px;';
      r.innerHTML = '\u25CF Recorded to commitment memory';
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
      // static rendering
      bubble('coach', 'Good morning. Yesterday you said you\u2019d <b>run</b>. Talk to me.');
      bubble('user', 'I didn\u2019t. Work ran late and I was wiped.');
      bubble('coach', 'Last Tuesday you told me <b>nothing could stop you this week</b>. It\u2019s Thursday. One data point \u2014 not a relapse. Morning or evening tomorrow? Yes or no.');
      thread.querySelectorAll('.msg').forEach(m => m.classList.add('in'));
    } else {
      watch(thread, step, 60);
    }
  }

  /* ---------- Drive watchers from scroll/load/resize ---------- */
  if (!reduce) {
    let raf = false;
    const drive = () => {
      if (raf) return; raf = true;
      requestAnimationFrame(() => { raf = false; pump(); });
    };
    window.addEventListener('scroll', drive, { passive: true });
    window.addEventListener('resize', drive, { passive: true });
    pump();
    // a few delayed pumps to catch late layout / font load in preview contexts
    [120, 400, 900].forEach(t => setTimeout(pump, t));
  }

  /* ---------- Year ---------- */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
