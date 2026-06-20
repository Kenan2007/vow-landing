/* ============================================================
   VOW — motion & interaction
   ============================================================ */
(function(){
  'use strict';
  document.documentElement.dataset.vow = 'ran';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function inView(el, margin){
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var m = margin == null ? vh * 0.12 : margin;
    return r.top < vh - m && r.bottom > 0;
  }
  var watchers = [];
  function watch(el, cb, margin){ watchers.push({ el: el, cb: cb, margin: margin, done: false }); }
  function pump(){
    var allDone = true;
    for (var wi = 0; wi < watchers.length; wi++){
      var w = watchers[wi];
      if (w.done) continue;
      if (inView(w.el, w.margin)) { w.done = true; w.cb(); } else { allDone = false; }
    }
    return allDone;
  }

  var revs = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce) {
    revs.forEach(function(r) { r.classList.add('show'); });
  } else {
    revs.forEach(function(r) { watch(r, function() { r.classList.add('show'); }); });
    setTimeout(function() { revs.forEach(function(r) { r.classList.add('show'); }); }, 2600);
  }

  var plx = Array.prototype.slice.call(document.querySelectorAll('[data-plx]'));
  if (!reduce && plx.length) {
    var ticking = false;
    var onScroll = function() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var vh = window.innerHeight;
        plx.forEach(function(el) {
          var speed = parseFloat(el.dataset.plx) || 0.06;
          var r = el.getBoundingClientRect();
          var center = r.top + r.height / 2;
          var off = (center - vh / 2) * speed;
          el.style.transform = 'translate3d(0, ' + (-off).toFixed(1) + 'px, 0)';
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.glass-tilt').forEach(function(card) {
      var spec = card.querySelector('.spec');
      if (!spec) { spec = document.createElement('span'); spec.className = 'spec'; card.appendChild(spec); }
      var max = parseFloat(card.dataset.tilt) || 6;
      card.addEventListener('pointermove', function(e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', ((px - 0.5) * max).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (-(py - 0.5) * max).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function() {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  var navInner = document.querySelector('.nav-inner');
  if (navInner) {
    var setNav = function() {
      var s = window.scrollY > 24;
      navInner.classList.toggle('glass', s);
      navInner.style.transition = 'background .3s, box-shadow .3s, padding .3s';
    };
    setNav();
    window.addEventListener('scroll', setNav, { passive: true });
  }

  var navEl = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav-toggle');
  if (navEl && navToggle) {
    var setOpen = function(open) {
      navEl.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', function() { setOpen(!navEl.classList.contains('open')); });
    navEl.querySelectorAll('.nav-mobile a').forEach(function(a) {
      a.addEventListener('click', function() { setOpen(false); });
    });
    window.addEventListener('resize', function() { if (window.innerWidth > 640) setOpen(false); }, { passive: true });
  }

  var chart = document.querySelector('.chart');
  if (chart) {
    var grow = function() {
      chart.querySelectorAll('.col').forEach(function(c) {
        c.style.height = (c.dataset.h || '50') + '%';
      });
    };
    if (reduce) { grow(); }
    else { watch(chart, grow, 40); }
  }

  var thread = document.getElementById('demoThread');
  if (thread) {
    var demoScript = [
      { type: 'typing', delay: 600, dur: 1100 },
      { type: 'coach', delay: 0, html: "Good morning. Yesterday you said you'd <b>run</b>. Talk to me." },
      { type: 'actions', delay: 700 },
      { type: 'user', delay: 1600, html: "I didn't. Work ran late and I was wiped." },
      { type: 'typing', delay: 400, dur: 1300 },
      { type: 'coach', delay: 0, html: "Last Tuesday you told me <b>nothing could stop you this week</b>. It's Thursday. One data point — not a relapse. Morning or evening tomorrow? Yes or no." },
      { type: 'recorded', delay: 800 }
    ];

    function bubble(cls, html){
      var d = document.createElement('div');
      d.className = 'msg ' + cls;
      d.innerHTML = html;
      thread.appendChild(d);
      requestAnimationFrame(function() { requestAnimationFrame(function() { d.classList.add('in'); }); });
      return d;
    }
    function showTyping(){
      var t = document.createElement('div');
      t.className = 'typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      thread.appendChild(t);
      return t;
    }
    function showActions(){
      var a = document.createElement('div');
      a.className = 'demo-actions reveal';
      a.innerHTML = "<div class=\"a did\">✓ I did it</div><div class=\"a didnt\">✕ I didn't</div>";
      thread.appendChild(a);
      requestAnimationFrame(function() { a.classList.add('show'); });
      return a;
    }
    function showRecorded(){
      var r = document.createElement('div');
      r.className = 'msg coach in';
      r.style.cssText = 'background:none;border:none;box-shadow:none;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);padding:6px 4px;';
      r.innerHTML = '● Recorded to commitment memory';
      thread.appendChild(r);
    }

    var demoIdx = 0;
    function step(){
      if (demoIdx >= demoScript.length) { setTimeout(reset, 4200); return; }
      var s = demoScript[demoIdx++];
      setTimeout(function() {
        if (s.type === 'typing') {
          var t = showTyping();
          setTimeout(function() { t.remove(); step(); }, s.dur);
        } else if (s.type === 'coach') { bubble('coach', s.html); step(); }
        else if (s.type === 'user') { bubble('user', s.html); step(); }
        else if (s.type === 'actions') { showActions(); step(); }
        else if (s.type === 'recorded') { showRecorded(); step(); }
      }, s.delay);
    }
    function reset(){ thread.innerHTML = ''; demoIdx = 0; step(); }

    if (reduce) {
      bubble('coach', "Good morning. Yesterday you said you'd <b>run</b>. Talk to me.");
      bubble('user', "I didn't. Work ran late and I was wiped.");
      bubble('coach', "Last Tuesday you told me <b>nothing could stop you this week</b>. It's Thursday. One data point — not a relapse. Morning or evening tomorrow? Yes or no.");
      thread.querySelectorAll('.msg').forEach(function(m) { m.classList.add('in'); });
    } else {
      watch(thread, step, 60);
    }
  }

  if (!reduce) {
    var raf = false;
    var drive = function() {
      if (raf) return; raf = true;
      requestAnimationFrame(function() { raf = false; pump(); });
    };
    window.addEventListener('scroll', drive, { passive: true });
    window.addEventListener('resize', drive, { passive: true });
    pump();
    [120, 400, 900].forEach(function(t) { setTimeout(pump, t); });
  }

  /* ---------- Founding-member waitlist ---------- */
  (function(){
    var forms = Array.prototype.slice.call(document.querySelectorAll('.waitlist'));
    if (!forms.length) return;
    var SEED     = 2381;
    var LS_MINE  = 'vow_founding_member_no';
    var LS_EMAIL = 'vow_founding_email';
    var SB_URL   = 'https://mnzbancinfqkgxqfdrop.supabase.co';
    var SB_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uemJhbmNpbmZxa2d4cWZkcm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mzk2NjUsImV4cCI6MjA5NzAxNTY2NX0.4GJTPavjmDDbq7AHd5hN3E0u9uIdmw_88o0fDoO-4Wc';

    var dbCount = 0;
    var total = function() { return SEED + dbCount; };
    var myNo = function() { var v = localStorage.getItem(LS_MINE); return v ? parseInt(v, 10) : null; };
    var myEmail = function() { return localStorage.getItem(LS_EMAIL) || null; };

    function clearJoined() {
      localStorage.removeItem(LS_MINE);
      localStorage.removeItem(LS_EMAIL);
      forms.forEach(function(f) { f.classList.remove('done'); });
    }

    function renderCount(v){ Array.prototype.slice.call(document.querySelectorAll('[data-count]')).forEach(function(el) { el.textContent = v.toLocaleString('de-CH'); }); }

    function markJoined(){
      var no = myNo();
      forms.forEach(function(f) {
        f.classList.add('done');
        var ct = f.querySelector('.wl-confirm .ct');
        if (ct && no) ct.innerHTML = 'You\'re in. You\'re founding member <b>#' + no.toLocaleString('de-CH') + '</b>.';
      });
    }

    var counted = false;
    function countUp(target){
      if (reduce) { renderCount(target); return; }
      var start = Math.max(0, target - 38), t0 = performance.now(), dur = 950;
      (function tick(now){
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        renderCount(Math.round(start + (target - start) * e));
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    }

    var _sbClient = null;
    function getSupabaseClient() {
      if (_sbClient) return Promise.resolve(_sbClient);
      if (typeof supabase !== 'undefined') {
        _sbClient = supabase.createClient(SB_URL, SB_KEY);
        return Promise.resolve(_sbClient);
      }
      return new Promise(function(resolve) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
        s.onload = function() { _sbClient = supabase.createClient(SB_URL, SB_KEY); resolve(_sbClient); };
        s.onerror = function() { resolve(null); };
        document.head.appendChild(s);
      });
    }

    function onSubmit(e){
      e.preventDefault();
      var f = e.currentTarget;
      var input = f.querySelector('.wl-input');
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      var email = input ? input.value.trim() : '';
      var goalInput = f.querySelector('.wl-goal');
      var goalText = goalInput ? goalInput.value.trim() : '';

      if (email) {
        getSupabaseClient().then(function(client) {
          if (!client) return;
          var row = { email: email };
          if (goalText) row.goal_text = goalText;
          client.from('waitlist').insert(row).then(function(res) {
            if (res.error && res.error.code !== '23505') {
              console.warn('Waitlist insert error:', res.error.message);
            }
          });
        });
      }

      if (myNo() === null) {
        dbCount += 1;
        localStorage.setItem(LS_MINE, String(SEED + dbCount));
        if (email) localStorage.setItem(LS_EMAIL, email);
      }
      renderCount(total());
      markJoined();
    }
    forms.forEach(function(f) { f.addEventListener('submit', onSubmit); });

    renderCount(total());
    var anchor = forms[0];
    var fetchDone = false;

    // fire() no longer animates — it just marks "form is visible, animate when ready"
    var fire = function() {
      if (counted) return;
      var r = anchor.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
        counted = true;
        window.removeEventListener('scroll', fire);
        if (fetchDone) { countUp(total()); }
        // if fetch not done yet, the fetch handler will call countUp
      }
    };

    if (myNo() !== null) {
      var storedEmail = myEmail();
      if (!storedEmail) {
        clearJoined();
      } else {
        markJoined();
        fetch(SB_URL + '/rest/v1/rpc/check_waitlist_email', {
          method: 'POST',
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_email: storedEmail })
        }).then(function(r) { return r.ok ? r.json() : true; }).then(function(exists) {
          if (!exists) clearJoined();
        }).catch(function() {});
      }
    }

    fetch(SB_URL + '/rest/v1/rpc/get_waitlist_count', {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: '{}'
    }).then(function(r) { return r.ok ? r.json() : null; }).then(function(n) {
      if (typeof n === 'number') {
        dbCount = n;
        fetchDone = true;
        // animate with real count if form is visible, otherwise just update quietly
        if (counted) { countUp(total()); } else { renderCount(total()); }
        window.removeEventListener('scroll', fire);
      }
    }).catch(function() { fetchDone = true; });

    fire();
    window.addEventListener('scroll', fire, { passive: true });
    setTimeout(fire, 500);
  })();

  /* ---------- CTA buttons → nearest waitlist form ---------- */
  (function(){
    var heroForm   = document.getElementById('join');
    var bottomForm = document.querySelector('.waitlist-center');
    if (!heroForm || !bottomForm) return;
    Array.prototype.slice.call(document.querySelectorAll('a[href="#join"]')).forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = heroForm.getBoundingClientRect().bottom > 120 ? heroForm : bottomForm;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var input = target.querySelector('.wl-input');
        if (input) setTimeout(function() { input.focus(); }, 520);
      });
    });
  })();

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
