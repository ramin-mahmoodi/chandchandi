/* Thin overlay scrollbar (desktop / mouse only).
   Native page scrollbar is hidden so it never reserves space on the right;
   a slim thumb fades in on scroll or when the mouse is near the right edge. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var root = document.documentElement;
  var track = document.createElement('div');
  var thumb = document.createElement('div');
  track.className = 'osb';
  thumb.className = 'osb-thumb';
  track.appendChild(thumb);
  document.body.appendChild(track);
  root.classList.add('osb-on');

  var hideT = 0, dragging = false, startY = 0, startTop = 0;

  function metrics() {
    var vh = root.clientHeight, sh = root.scrollHeight;
    var th = Math.max(36, Math.round(vh * vh / sh));
    return { vh: vh, sh: sh, th: th, max: vh - th };
  }
  function update() {
    var m = metrics();
    var scrollable = m.sh > m.vh + 1 && !root.classList.contains('sheet-open');
    track.style.display = scrollable ? '' : 'none';
    if (!scrollable) return;
    thumb.style.height = m.th + 'px';
    var top = (root.scrollTop / (m.sh - m.vh)) * m.max;
    thumb.style.transform = 'translateY(' + (top || 0) + 'px)';
  }
  function show() {
    track.classList.add('show');
    clearTimeout(hideT);
    hideT = setTimeout(function () {
      if (!dragging && !track.matches(':hover')) track.classList.remove('show');
    }, 900);
  }

  addEventListener('scroll', function () { update(); show(); }, { passive: true });
  addEventListener('resize', update);
  if (window.ResizeObserver) {
    var roRaf = 0;
    new ResizeObserver(function () {
      if (roRaf) return;
      roRaf = requestAnimationFrame(function () { roRaf = 0; update(); });
    }).observe(document.body);
  }
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['class'] });
  track.addEventListener('mouseenter', function () { track.classList.add('show'); clearTimeout(hideT); });
  track.addEventListener('mouseleave', show);
  addEventListener('mousemove', function (e) {
    if (innerWidth - e.clientX < 24 && !track.classList.contains('show')) show();
  }, { passive: true });

  thumb.addEventListener('pointerdown', function (e) {
    dragging = true; startY = e.clientY;
    startTop = (root.scrollTop / (root.scrollHeight - root.clientHeight)) * metrics().max;
    thumb.setPointerCapture(e.pointerId);
    track.classList.add('drag', 'show');
    e.preventDefault();
  });
  thumb.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var m = metrics();
    var top = Math.min(m.max, Math.max(0, startTop + e.clientY - startY));
    root.scrollTop = (top / m.max) * (m.sh - m.vh);
  });
  function end() { dragging = false; track.classList.remove('drag'); show(); }
  thumb.addEventListener('pointerup', end);
  thumb.addEventListener('pointercancel', end);

  track.addEventListener('pointerdown', function (e) {
    if (e.target !== track) return;
    var r = thumb.getBoundingClientRect();
    root.scrollBy({ top: (e.clientY < r.top ? -1 : 1) * root.clientHeight * 0.9, behavior: 'smooth' });
  });
  update();
})();
