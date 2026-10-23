/* Focus management for the settings / detail sheets:
   - focus moves into the dialog when it opens
   - Tab / Shift+Tab stay inside it, the page behind is inert
   - focus returns to the button that opened it when it closes */
(function () {
  var wrap = document.querySelector('.wrap');
  var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var opener = null, active = null;

  function visible(el) {
    return !el.disabled && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function items(sheet) {
    return Array.prototype.filter.call(sheet.querySelectorAll(FOCUSABLE), visible);
  }
  function openSheetEl() {
    var a = document.getElementById('dsheet'), b = document.getElementById('sheet');
    if (a && !a.hidden) return a;
    if (b && !b.hidden) return b;
    return null;
  }

  function sync() {
    var sh = openSheetEl();
    if (sh && sh !== active) {
      if (!active) opener = document.activeElement;
      active = sh;
      if (wrap) wrap.inert = true;
      var body = sh.querySelector('.sheet-body');
      if (body) {
        if (!body.hasAttribute('tabindex')) body.setAttribute('tabindex', '-1');
        body.focus({ preventScroll: true });
      }
    } else if (!sh && active) {
      active = null;
      if (wrap) wrap.inert = false;
      if (opener && document.contains(opener) && opener.focus) opener.focus({ preventScroll: true });
      opener = null;
    }
  }

  ['sheet', 'dsheet'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['hidden'] });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !active) return;
    var list = items(active);
    if (!list.length) { e.preventDefault(); return; }
    var first = list[0], last = list[list.length - 1], cur = document.activeElement;
    var inside = active.contains(cur) && cur !== active.querySelector('.sheet-body');
    if (!inside) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
  });
})();
