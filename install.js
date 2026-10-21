/* Tombol "Pasang Aplikasi" (Android/Chrome/Edge) + petunjuk iPhone. */
(function () {
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;
  var dismissed = false; try { dismissed = localStorage.getItem('pwa_install_hide') === '1'; } catch (e) {}
  if (dismissed) return;
  var deferred = null;

  function bar(text, btnText, onBtn) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;background:#0180F7;color:#fff;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);font:600 14px/1.3 "DM Sans",system-ui,sans-serif';
    var t = document.createElement('span'); t.style.flex = '1'; t.textContent = text; d.appendChild(t);
    if (btnText) {
      var b = document.createElement('button'); b.textContent = btnText;
      b.style.cssText = 'background:#fff;color:#0180F7;border:0;border-radius:10px;padding:8px 14px;font:700 14px system-ui;cursor:pointer';
      b.onclick = function () { onBtn(d); }; d.appendChild(b);
    }
    var x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Tutup');
    x.style.cssText = 'background:transparent;color:#fff;border:0;font:400 24px/1 system-ui;cursor:pointer;padding:0 4px';
    x.onclick = function () { d.remove(); try { localStorage.setItem('pwa_install_hide', '1'); } catch (e) {} };
    d.appendChild(x); document.body.appendChild(d); return d;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    bar('Pasang Sahabatku di HP kamu agar bisa dibuka seperti aplikasi.', 'Pasang', function (d) {
      deferred.prompt(); deferred.userChoice.then(function () { deferred = null; d.remove(); });
    });
  });
  window.addEventListener('appinstalled', function () { var b = document.querySelector('[aria-label="Tutup"]'); if (b) b.click(); });

  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream) {
    window.addEventListener('load', function () {
      setTimeout(function () { bar('Untuk memasang: ketuk tombol Bagikan lalu pilih "Tambah ke Layar Utama".'); }, 2500);
    });
  }
})();
