/* clone-ui: consolidated interaction layer. Reuses the site's own captured CSS animations. */
(function () {
  'use strict';

  /* ---------- 1. videos: play all, pause offscreen ---------- */
  var vids = document.querySelectorAll('video');
  var autoVids = [].filter.call(vids, function (v) { return v.hasAttribute('autoplay'); });
  autoVids.forEach(function (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); });
  if ('IntersectionObserver' in window && autoVids.length) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { rootMargin: '100px' });
    autoVids.forEach(function (v) { vio.observe(v); });
  }
  // project-page videos: real site is click-to-play via overlay button
  document.querySelectorAll('[class*="buttonPlayBlock"],[class*="buttonPlay_"]').forEach(function (ov) {
    var host = ov.closest('div');
    var v = (host && host.querySelector('video')) ||
            (host && host.parentElement && host.parentElement.querySelector('video'));
    if (!v) return;
    v.muted = true;
    ov.style.cursor = 'pointer';
    ov.addEventListener('click', function () {
      if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); ov.style.display = 'none'; }
    });
  });
  document.querySelectorAll('[class*="buttonFullscreen"],[class*="Fullscreen_"]').forEach(function (fb) {
    var host = fb.closest('div');
    var v = (host && host.querySelector('video')) ||
            (host && host.parentElement && host.parentElement.querySelector('video'));
    if (!v) return;
    fb.style.cursor = 'pointer';
    fb.addEventListener('click', function () { if (v.requestFullscreen) v.requestFullscreen(); });
  });

  /* ---------- 2. cookie banner ---------- */
  var CK = 'myCookieConsent';
  var cc = document.querySelector('.CookieConsent');
  if (cc) {
    if (localStorage.getItem(CK)) { cc.style.display = 'none'; }
    var ccBtn = document.getElementById('rcc-confirm-button');
    if (ccBtn) ccBtn.addEventListener('click', function () {
      localStorage.setItem(CK, '1');
      cc.style.opacity = '0'; cc.style.transform = 'translateY(100%)';
      setTimeout(function () { cc.style.display = 'none'; }, 320);
    });
  }

  /* ---------- 3. swipers -> native drag scroll + arrows ---------- */
  document.querySelectorAll('.swiper-wrapper').forEach(function (w) {
    var down = false, sx = 0, sl = 0, moved = false;
    w.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; sx = e.clientX; sl = w.scrollLeft; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; w.classList.add('mg-dragging'); }
      w.scrollLeft = sl - dx;
    });
    var lastX = 0, lastT = 0, vel = 0;
    w.addEventListener('pointermove', function (e) {
      if (!down) return;
      var now = performance.now();
      if (lastT) vel = (lastX - e.clientX) / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false; w.classList.remove('mg-dragging');
      // momentum: continue with release velocity, decay like Swiper freeMode
      var v = vel; vel = 0; lastT = 0;
      (function mom() {
        if (Math.abs(v) < 0.4 || down) return;
        w.scrollLeft += v; v *= 0.94;
        requestAnimationFrame(mom);
      })();
    });
    w.addEventListener('dragstart', function (e) { e.preventDefault(); });
    w.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });
  document.querySelectorAll('[class*="_ArrowsSwiper_"]').forEach(function (box) {
    var host = box.parentElement;
    var w = host && (host.querySelector('.swiper-wrapper') ||
            (host.parentElement && host.parentElement.querySelector('.swiper-wrapper')));
    if (!w) return;
    var b = box.querySelectorAll('button');
    if (b.length < 2) return;
    function step() {
      var s = w.querySelector('.swiper-slide');
      return s ? s.getBoundingClientRect().width + 30 : w.clientWidth;
    }
    b[0].addEventListener('click', function () { w.scrollBy({ left: -step(), behavior: 'smooth' }); });
    b[1].addEventListener('click', function () { w.scrollBy({ left: step(), behavior: 'smooth' }); });
    function upd() {
      var s0 = w.scrollLeft < 10, s1 = w.scrollLeft > w.scrollWidth - w.clientWidth - 10;
      b[0].disabled = s0; b[1].disabled = s1;
      b[0].classList.toggle('swiper-button-disabled', s0);
      b[1].classList.toggle('swiper-button-disabled', s1);
    }
    w.addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* ---------- 4. competencies accordion: the site's own class animation ---------- */
  var ACC_OPEN = 'BlockHeaderMain_contentOpen_blockHeader__KW9SC';
  var ACC_CLOSE = 'BlockHeaderMain_contentClose_blockHeader__lrLjC';
  var ACC_ROT = 'BlockHeaderMain_rotate180__aCjud';

  /* ---------- 5. navbar hide on scroll down / show on scroll up ---------- */
  var nav = document.querySelector('nav[class*="navbar"]');
  var NAV_HIDDEN = 'style_navbar--hidden__ndNLv';
  var lastY = 0;
  if (nav) window.addEventListener('scroll', function () {
    var y = window.scrollY;
    var hiddenCls = (nav.className.match(/[\w-]*navbar--hidden[\w-]*/) || [NAV_HIDDEN])[0];
    if (y > lastY && y > 80) nav.classList.add(NAV_HIDDEN, '_navbar--hidden_pp1il_19');
    else nav.classList.remove(NAV_HIDDEN, '_navbar--hidden_pp1il_19');
    lastY = y;
  }, { passive: true });

  /* ---------- 6. logo intro (site's own keyframes) ---------- */
  var lc = document.querySelector('[class*="logo-circle"]');
  var li = document.querySelector('[class*="logo-image"]');
  if (lc) lc.classList.add('style_logo-circle-animate__sPIk0', 'style_logo-hr-animate__2RxQ8');
  if (li) li.classList.add('style_logo-image-animate__OUPSa');
  // after the intro, settle the dot to its static navy state (keyframes end blue)
  setTimeout(function () {
    if (lc) { lc.classList.remove('style_logo-circle-animate__sPIk0', 'style_logo-hr-animate__2RxQ8'); lc.style.animation = 'none'; }
  }, 2400);

  /* ---------- 7. marquees: correct speed after prune + pause offscreen ---------- */
  var marq = document.querySelectorAll('[class*="SliderHeader__marquee"]');
  function setMarqueeSpeed() {
    var speeds = [73.6, 73.6]; // real: both marquees share the _marquee class (120s, ~73.6 px/s)
    [].forEach.call(marq, function (t, i) {
      var wpx = t.scrollWidth / 2;
      if (wpx > 100) t.style.animationDuration = (wpx / (speeds[Math.min(i, 1)])).toFixed(1) + 's';
    });
  }
  setMarqueeSpeed();
  window.addEventListener('load', setMarqueeSpeed);
  setTimeout(setMarqueeSpeed, 2500);
  if ('IntersectionObserver' in window && marq.length) {
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        en.target.style.animationPlayState = en.isIntersecting ? 'running' : 'paused';
      });
    }, { rootMargin: '50px' });
    marq.forEach(function (t) { mio.observe(t); });
  }

  /* ---------- 8. custom cursor: spring-follow + «Смотреть» over project cards ---------- */
  var cur = document.querySelector('.cursor');
  if (cur && matchMedia('(pointer:fine)').matches) {
    var mx = -100, my = -100, x = -100, y = -100, vx = 0, vy = 0, big = false;
    cur.style.cssText += ';pointer-events:none;transition:width .3s ease,height .3s ease,background .3s ease;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden';
    var lbl = document.createElement('span');
    lbl.textContent = 'Смотреть';
    lbl.style.cssText = 'color:#F6F6F6;font-size:.875rem;font-family:var(--font-raleway,Raleway,sans-serif);opacity:0;transition:opacity .2s';
    cur.appendChild(lbl);
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      vx += (mx - x) * 0.12; vx *= 0.75; x += vx;
      vy += (my - y) * 0.12; vy *= 0.75; y += vy;
      cur.style.transform = 'translateX(' + (x - (big ? 50 : 12)) + 'px) translateY(' + (y - (big ? 50 : 12)) + 'px) translateZ(0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      // the site's own CSS sets cursor:none on media cards — that's exactly where the bubble belongs
      var el = e.target, hideCursor = false;
      for (var i = 0; i < 6 && el && el.nodeType === 1; i++, el = el.parentElement) {
        if (getComputedStyle(el).cursor === 'none') { hideCursor = true; break; }
      }
      big = hideCursor;
      if (big) { cur.style.width = '100px'; cur.style.height = '100px'; cur.style.background = '#1D2E43'; lbl.style.opacity = '1'; }
      else { cur.style.width = '24px'; cur.style.height = '24px'; cur.style.background = 'transparent'; lbl.style.opacity = '0'; }
    });
  }

  /* ---------- 9. footer spotlight mask + pulse ---------- */
  var foot = document.querySelector('footer[class*="FooterCircle"]'); // home: FooterCircle_FooterCircle__…; inner pages: _FooterCircle_1iqf5_1
  var fmain = document.querySelector('[class*="FooterCircle__main"]');
  var flink = document.querySelector('[class*="FooterCircle__link"]');
  if (foot && fmain) {
    // real behavior: hovering the ringed word «проект» reveals the whole light layer (R -> 100vw, ~1s)
    var fr = 0, frT = 0;
    var fcircle = document.querySelector('[class*="FooterCircle__circle"]') || flink;
    if (fcircle) {
      fcircle.addEventListener('mouseenter', function () { frT = 100; });
      fcircle.addEventListener('mouseleave', function () { frT = 0; });
    }
    (function floop() {
      fr += (frT - fr) * 0.07;
      if (Math.abs(fr - frT) > 0.05 || fr > 0.05) {
        var m = 'radial-gradient(circle at 605px 200px, transparent ' + fr.toFixed(2) + 'vw, black 0px)';
        fmain.style.webkitMaskImage = m; fmain.style.maskImage = m;
      }
      requestAnimationFrame(floop);
    })();
    if (flink && 'IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { flink.classList.add('FooterCircle_animate__r16Ub'); fio.disconnect(); } });
      }, { threshold: 0.4 });
      fio.observe(flink);
    }
  }

  /* ---------- 10. page fade-out on internal navigation ---------- */
  var fadeStyle = document.createElement('style');
  fadeStyle.textContent = '@keyframes mg-fade-out{to{opacity:0}}.mg-leaving .page-little-fade,.mg-leaving [class*="page-little-fade"]{animation:mg-fade-out .15s ease-in forwards}';
  document.head.appendChild(fadeStyle);

  /* ---------- 11. contacts city tabs: active styling (map recenter is in clone-map) ---------- */
  var TAB_A = null;
  // the ACTIVE tab is class "_tabActive_…" (no "_tab_"), so scan with the broader "_tab" match
  document.querySelectorAll('button[class*="_tab"]').forEach(function (b) {
    var m = (b.className || '').match(/_tabActive_[A-Za-z0-9_]+/);
    if (m) TAB_A = m[0];
  });

  /* ---------- 11b. projects listing «Выбрать город» slide-in drawer + city filter ---------- */
  var cityBtn = document.querySelector('button[class*="_city_"]');
  var cityPanel = document.querySelector('[class*="_panel_16t5l"]') || document.querySelector('[class*="_panel_"]');
  var cityCards = document.querySelector('section[class*="_list_"]');
  if (cityBtn && cityPanel && cityCards) {
    var cityOpen = false;
    function setCityPanel(open) { cityOpen = open; cityPanel.style.transform = open ? 'translateX(0px)' : 'translateX(600px)'; cityPanel.style.transition = 'transform .35s ease'; }
    setCityPanel(false);
    cityBtn.addEventListener('click', function (e) { e.stopPropagation(); setCityPanel(!cityOpen); });
    document.addEventListener('click', function (e) {
      if (cityOpen && !e.target.closest('[class*="_panel_"]') && !e.target.closest('button[class*="_city_"]')) setCityPanel(false);
    });
    var cityClose = cityPanel.querySelector('[class*="close"],[class*="Close"],[class*="cross"]');
    if (cityClose) cityClose.addEventListener('click', function () { setCityPanel(false); });
    // the real drawer's city list is React-populated (empty in our static capture) — rebuild it
    // from the project cards' own location text, and filter the grid on select.
    var cards = [].slice.call(cityCards.querySelectorAll('a[href*="project_"]'));
    function cardCity(a) { var m = a.querySelector('[class*="_item_meta"]'); var t = (m && (m.getAttribute('title') || m.textContent) || '').trim(); return t.replace(/^Россия,?\s*/i, '').replace(/^г\.\s*/i, '').replace(/^Республика\s+/i, '').trim() || t; }
    var cityMap = {}; cards.forEach(function (a) { var c = cardCity(a); if (c) (cityMap[c] = cityMap[c] || []).push(a); });
    var names = Object.keys(cityMap).sort(function (x, y) { return cityMap[y].length - cityMap[x].length; });
    var listWrap = document.createElement('div'); listWrap.className = 'mg-citylist';
    listWrap.style.cssText = 'display:flex;flex-direction:column;gap:2px;overflow-y:auto;max-height:60vh;padding:8px 0';
    function mkBtn(label, cs) {
      var el = document.createElement('button'); el.type = 'button'; el.textContent = label;
      el.style.cssText = 'text-align:left;background:none;border:0;padding:10px 24px;font:inherit;color:#1D2E43;cursor:pointer;font-family:var(--font-raleway,Raleway,sans-serif)';
      el.addEventListener('mouseenter', function () { el.style.background = '#EBECEE'; });
      el.addEventListener('mouseleave', function () { el.style.background = 'none'; });
      el.addEventListener('click', function () {
        cards.forEach(function (a) { a.style.display = (!cs || cs.indexOf(a) >= 0) ? '' : 'none'; });
        setCityPanel(false);
        var lbl = cityBtn.querySelector('[class*="_buttonLabel"]'); if (lbl) lbl.textContent = label;
      });
      return el;
    }
    listWrap.appendChild(mkBtn('Все города', null));
    names.forEach(function (c) { listWrap.appendChild(mkBtn(c, cityMap[c])); });
    cityPanel.appendChild(listWrap);
    var citySearch = cityPanel.querySelector('#search-input, input[type="search"]');
    if (citySearch) citySearch.addEventListener('input', function () {
      var q = citySearch.value.trim().toLowerCase();
      [].forEach.call(listWrap.children, function (el) { el.style.display = (el.textContent === 'Все города' || el.textContent.toLowerCase().indexOf(q) >= 0) ? '' : 'none'; });
    });
  }

  /* ---------- 12. project-page share buttons ---------- */
  var shareMap = { vk: 'https://vk.com/share.php?url=', wa: 'https://wa.me/?text=', tg: 'https://t.me/share/url?url=' };

  /* ---------- 13. forms: validate + graceful static submit ---------- */
  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.querySelector('input[name="name"]');
      var tel = f.querySelector('input[name="tel"],input[name="phone"]');
      var txt = f.querySelector('textarea');
      var err = f.querySelector('[class*="textError"]');
      var bad = (!name || !name.value.trim()) || (!tel || tel.value.replace(/\D/g, '').length !== 11);
      if (bad) {
        if (err) { err.textContent = 'Заполните имя и корректный телефон.'; err.style.visibility = 'visible'; }
        return;
      }
      var body = encodeURIComponent((txt ? txt.value + '\n\n' : '') + 'Имя: ' + name.value + '\nТелефон: ' + tel.value);
      location.href = 'mailto:mail@marksgroup.ru?subject=' + encodeURIComponent('Заявка с сайта MARKS GROUP') + '&body=' + body;
      var ok = document.createElement('div');
      ok.className = 'mg-form-ok';
      ok.textContent = 'Спасибо! Заявка сформирована — отправьте письмо в открывшемся окне почты, и мы свяжемся с вами.';
      f.replaceChildren(ok);
    });
  });

  /* ---------- delegated clicks: accordion, dropdowns, burger, tabs, share, links fade ---------- */
  var sb = document.querySelector('[class*="navbar-sidebar_"],[class*="navbar-sidebar__"]');
  var sbOpen = false;
  function setSidebar(open) {
    if (!sb) return;
    sbOpen = open;
    sb.style.cssText = open
      ? 'display:block;opacity:1;visibility:visible;transform:none;translate:none;pointer-events:auto;transition:opacity .25s ease,transform .25s ease'
      : '';
    sb.setAttribute('aria-hidden', String(!open));
  }
  // build dropdowns once — REAL items/labels/descriptions, presented as a full-width
  // in-flow header extension that pushes the page down (like the real site)
  var DD_ITEMS = {
    'Публикации': [
      ['Новости', 'Научные достижения, интервью и статьи ведущих профессиональных и публицистических изданий', 'publication.html'],
      ['MARKS jornal', 'Научный журнал', 'journalPage.html']
    ],
    'О компании': [
      ['История MARKS GROUP', 'Люди, которые не боятся вызовов и готовы к новым победам', 'company.html#history'],
      ['Награды и премии', 'Проекты, отмеченные наградами в разных номинациях', 'company.html#awards'],
      ['Сотрудники', 'Наша главная ценность — это команда', 'company.html#staff']
    ]
  };
  var navRoot = document.querySelector('nav[class*="navbar"]');
  var ddPanel = null;
  if (navRoot) {
    ddPanel = document.createElement('div');
    ddPanel.className = 'mg-ddx';
    var inner = document.querySelector('[class*="navbar-top"]');
    var pad = inner ? getComputedStyle(inner).paddingLeft : '48px';
    ddPanel.style.paddingLeft = '291px';
    navRoot.appendChild(ddPanel);
  }
  function openDropdown(btn, key) {
    var items = DD_ITEMS[key];
    var ul = document.createElement('ul');
    items.forEach(function (it) {
      var l = document.createElement('li'); var a = document.createElement('a');
      a.href = it[2]; if (/^https?:/.test(it[2])) a.target = '_blank';
      a.innerHTML = '<div class="t"></div><div class="d"></div>';
      a.querySelector('.t').textContent = it[0];
      a.querySelector('.d').textContent = it[1];
      l.appendChild(a); ul.appendChild(l);
    });
    ddPanel.replaceChildren(ul);
    ddPanel.classList.add('open');
    ddPanel.dataset.owner = key;
    setCaret(btn, true);
  }
  function setCaret(btn, open) {
    if (!btn) return;
    var down = btn.querySelector('[class*="arrow-icon--down"]');
    var up = btn.querySelector('[class*="arrow-icon--up"]');
    [].forEach.call(btn.querySelectorAll('[class*="--hidden"], [class*="arrow-icon"]'), function () {});
    if (down && up) {
      var hidCls = null;
      [up, down].forEach(function (el) {
        (el.className.match(/[\w-]*--hidden[\w-]*/g) || []).forEach(function (c) { hidCls = c; el.classList.remove(c); });
      });
      hidCls = hidCls || 'mg-hide';
      (open ? down : up).classList.add(hidCls);
    }
    btn.setAttribute('aria-expanded', String(open));
  }
  function closeAllDropdowns() {
    if (ddPanel) { ddPanel.classList.remove('open'); delete ddPanel.dataset.owner; }
    document.querySelectorAll('button[class*="navbar-item"]').forEach(function (b) {
      if (DD_ITEMS[(b.textContent || '').trim()]) setCaret(b, false);
    });
  }
  // real site opens the nav dropdowns on HOVER (not click) — panel is appended inside navRoot,
  // so leaving navRoot (incl. the panel) closes them.
  if (navRoot && ddPanel) {
    navRoot.addEventListener('mouseover', function (e) {
      var db = e.target.closest('button[class*="navbar-item"]');
      if (db && DD_ITEMS[(db.textContent || '').trim()]) {
        var key = (db.textContent || '').trim();
        if (!(ddPanel.classList.contains('open') && ddPanel.dataset.owner === key)) { closeAllDropdowns(); openDropdown(db, key); }
      } else if (db && ddPanel.classList.contains('open')) { closeAllDropdowns(); }
    });
    navRoot.addEventListener('mouseleave', function () { closeAllDropdowns(); });
  }

  document.addEventListener('click', function (e) {
    // dropdown toggle (full-width header extension, real content)
    var db = e.target.closest('button[class*="navbar-item"]');
    var dbKey = db ? (db.textContent || '').trim() : '';
    if (db && DD_ITEMS[dbKey] && ddPanel) {
      var wasOpen2 = ddPanel.classList.contains('open') && ddPanel.dataset.owner === dbKey;
      closeAllDropdowns();
      if (!wasOpen2) openDropdown(db, dbKey);
      return;
    } else if (!e.target.closest('.mg-ddx')) closeAllDropdowns();
    // burger
    var burger = e.target.closest('button[class*="navbar-burger"]');
    if (burger) { setSidebar(!sbOpen); return; }
    // CTA
    var cta = e.target.closest('button');
    if (cta && (cta.textContent || '').trim().indexOf('Обсудить проект') === 0) { location.href = 'footerForm.html'; return; }
    // accordion: class-swap animation + the full sub-competency panel (captured from the real site)
    var row = e.target.closest('[class*="block_blockHeader"]');
    if (row && !e.target.closest('.mg-panel')) {
      var rows = [].slice.call(document.querySelectorAll('[class*="block_blockHeader"]'));
      var idx = rows.indexOf(row);
      var c = row.querySelector('[class*="content_blockHeader"]');
      var tog = row.querySelector('[class*="toggle_blockHeader"]');
      var wasOpen = c && c.className.indexOf('contentOpen') >= 0;
      // close everything
      rows.forEach(function (r2) {
        var c2 = r2.querySelector('[class*="content_blockHeader"]');
        if (c2) { c2.classList.remove(ACC_OPEN); c2.classList.add(ACC_CLOSE); }
        var t2 = r2.querySelector('[class*="toggle_blockHeader"]');
        if (t2) t2.classList.remove(ACC_ROT);
      });
      document.querySelectorAll('.mg-panel').forEach(function (p) { p.remove(); });
      if (!wasOpen && c) {
        c.classList.remove(ACC_CLOSE); c.classList.add(ACC_OPEN);
        if (tog) tog.classList.add(ACC_ROT);
        var tpl = document.getElementById('mg-panel-' + idx);
        if (tpl) {
          var holder = document.createElement('div');
          holder.className = 'mg-panel';
          holder.innerHTML = tpl.innerHTML;
          var hover = row.querySelector('[class*="block_hover"]');
          (hover || row).appendChild(holder);
        }
      }
      return;
    }
    // contacts tabs active state
    var tab = e.target.closest('button[class*="_tab"]');
    if (tab && TAB_A) {
      tab.parentElement.querySelectorAll('button').forEach(function (b) { b.classList.remove(TAB_A); });
      tab.classList.add(TAB_A);
    }
    // share buttons on project pages
    var share = e.target.closest('[class*="_social_links_"] button');
    if (share) {
      var k = (share.textContent || share.className).toLowerCase();
      var key = k.indexOf('vk') >= 0 ? 'vk' : k.indexOf('wa') >= 0 ? 'wa' : 'tg';
      var ttl = (document.querySelector('h1') || {}).textContent || document.title;
      ttl = ttl.trim().slice(0, 80);
      var u = encodeURIComponent(location.href);
      var url = key === 'vk' ? shareMap.vk + u + '&title=' + encodeURIComponent(ttl)
              : shareMap[key] + encodeURIComponent(ttl + '\n') + u;
      window.open(url, '_blank');
      return;
    }
    // page fade-out for internal links
    var a = e.target.closest('a[href]');
    if (a && !a.target && !e.metaKey && !e.ctrlKey) {
      var h = a.getAttribute('href');
      if (h && !/^(https?:|mailto:|tel:|#)/.test(h)) {
        e.preventDefault();
        document.documentElement.classList.add('mg-leaving');
        setTimeout(function () { location.href = h; }, 150);
      }
    }
  });

  /* ---------- phone inputs: +7 (___) ___-__-__ mask skeleton like the real form ---------- */
  document.querySelectorAll('input[name="tel"],input[name="phone"],input[type="tel"]').forEach(function (inp) {
    var MASK = '+7 (###) ###-##-##';           // # = a fillable digit slot (10 national digits)
    function nat(v) {                            // strip to national digits (drop leading 7/8 country code)
      var d = (v || '').replace(/\D/g, '');
      if (d.charAt(0) === '8') d = d.slice(1);
      else if (d.charAt(0) === '7') d = d.slice(1);
      return d.slice(0, 10);
    }
    function build(n) {                          // returns {value, caret}
      var out = '', di = 0, caret = 4;
      for (var i = 0; i < MASK.length; i++) {
        var c = MASK.charAt(i);
        if (c === '#') { out += di < n.length ? n.charAt(di) : '_'; if (di < n.length) caret = out.length; di++; }
        else out += c;
      }
      return { value: out, caret: n.length ? caret : 4 };
    }
    function editPos() { return build(nat(inp.value)).caret; }   // caret just after the last real digit
    function snap() {                                            // keep caret inside the editable region
      var c = editPos();
      try { inp.setSelectionRange(c, c); } catch (e) {}
      requestAnimationFrame(function () { try { inp.setSelectionRange(c, c); } catch (e) {} });
    }
    function ensureSkeleton() { if (!inp.value) inp.value = build('').value; }
    inp.addEventListener('focus', function () { ensureSkeleton(); snap(); });
    inp.addEventListener('click', function () { ensureSkeleton(); snap(); });   // clicking anywhere → caret at end of digits
    inp.addEventListener('input', function () {
      var r = build(nat(inp.value));
      inp.value = r.value;
      try { inp.setSelectionRange(r.caret, r.caret); } catch (e) {}
    });
    inp.addEventListener('blur', function () {
      if (!nat(inp.value).length) inp.value = '';   // leave empty if nothing was typed
    });
  });

  /* ---------- Документы -> real information page ---------- */
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    if ((a.textContent || '').trim() === 'Документы') { a.href = 'information.html'; }
  });

  /* ---------- mobile: real site renames the home H1 ---------- */
  if (innerWidth <= 768) {
    var h1p = document.getElementById('publications');
    if (h1p) h1p.textContent = 'Награды проектов';
  }

  /* ---------- slick mini-driver: hero galleries with numbered buttons (project pages, listing, publications) ---------- */
  document.querySelectorAll('.slick-slider').forEach(function (box) {
    var track = box.querySelector('.slick-track'); if (!track) return;
    var slides = [].filter.call(track.children, function (s) { return s.className.indexOf('slick-cloned') < 0; });
    if (slides.length < 2) return;
    var i = 0, N = slides.length, timer = null;
    var W = function () { return slides[0].getBoundingClientRect().width; };
    // numbered buttons like 01..04 living near the slider
    var root = box.closest('div[class*="slider"], section') || box.parentElement;
    var btns = [].filter.call(root.querySelectorAll('button'), function (b) {
      return /^0?\d$/.test((b.textContent || '').trim());
    });
    if (!btns.length && document.querySelectorAll('.slick-slider').length === 1) {
      // numbered nav lives outside the slider container (project pages)
      btns = [].filter.call(document.querySelectorAll('button'), function (b) {
        return /^0?\d$/.test((b.textContent || '').trim());
      });
      if (btns.length !== slides.length) btns = btns.slice(0, slides.length);
    }
    function go(n) {
      i = (n + N) % N;
      track.style.transition = 'transform .5s ease';
      track.style.transform = 'translate3d(' + (-i * W()) + 'px,0,0)';
      btns.forEach(function (b, k) {
        b.style.opacity = k === i ? '1' : '.5';
        b.style.fontSize = k === i ? '2.2em' : '';
      });
      var bar = root.querySelector('[class*="progress"], [class*="line_"]');
      if (bar && bar.getBoundingClientRect().height < 8) bar.style.width = ((i + 1) / N * 100).toFixed(0) + '%';
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); }
    btns.forEach(function (b, k) { b.addEventListener('click', function (e) { e.stopPropagation(); go(k); auto(); }); });
    // drag
    var sx = null;
    box.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    box.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (dx < -50) { go(i + 1); auto(); } else if (dx > 50) { go(i - 1); auto(); }
    });
    box.addEventListener('dragstart', function (e) { e.preventDefault(); });
    go(0); auto();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) auto(); else clearInterval(timer); });
      }).observe(box);
    }
  });

  /* ---------- projects listing: competency filter chips + ?viewConstruction ---------- */
  (function () {
    if (!/project\.html/.test(location.pathname)) return;
    var COMPS = ['Все', 'Архитектура и концепция', 'Градостроительство и генплан', 'Конструктив',
      'Инженерия', 'Геотехника', 'Наука', 'Технологии', 'Цифровые технологии'];
    var chips = [].filter.call(document.querySelectorAll('button'), function (b) {
      return COMPS.indexOf((b.textContent || '').trim()) >= 0;
    });
    if (!chips.length) return;
    var cards = [].slice.call(document.querySelectorAll('a[href*="project_"]')).filter(function (a) {
      return a.querySelector('img');
    });
    function applyFilter(name) {
      cards.forEach(function (card) {
        var txt = card.textContent || '';
        var show = name === 'Все' || txt.indexOf(name) >= 0 ||
          (name.indexOf(' и ') > 0 && txt.indexOf(name.split(' и ')[0]) >= 0);
        card.style.display = show ? '' : 'none';
      });
      chips.forEach(function (c) {
        var on = (c.textContent || '').trim() === name;
        c.style.background = on ? '#1D2E43' : '';
        c.style.color = on ? '#F6F6F6' : '';
      });
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        applyFilter((c.textContent || '').trim());
      });
    });
    var qp = new URLSearchParams(location.search).get('viewConstruction');
    if (qp) applyFilter(decodeURIComponent(qp));
  })();

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAllDropdowns(); setSidebar(false); }
  });
})();
