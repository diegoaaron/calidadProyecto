/* TechStore - Utilidades de interfaz compartidas: header, footer, toasts, imágenes y sesión. */
var UI = (function () {
  var COLORS = { laptops: '#3b5bdb', celulares: '#0c8599', tablets: '#7048e8', audio: '#e8590c', accesorios: '#2b8a3e', gaming: '#c2255c' };
  var ICONS = {
    laptops: '<rect x="70" y="55" width="160" height="100" rx="8" fill="none" stroke="#fff" stroke-width="10"/><path d="M50 170h200l-15 18H65z" fill="#fff"/>',
    celulares: '<rect x="115" y="40" width="70" height="135" rx="14" fill="none" stroke="#fff" stroke-width="10"/><circle cx="150" cy="158" r="6" fill="#fff"/>',
    tablets: '<rect x="90" y="45" width="120" height="130" rx="12" fill="none" stroke="#fff" stroke-width="10"/><circle cx="150" cy="160" r="5" fill="#fff"/>',
    audio: '<path d="M90 140v-25a60 60 0 0 1 120 0v25" fill="none" stroke="#fff" stroke-width="10"/><rect x="78" y="128" width="28" height="48" rx="8" fill="#fff"/><rect x="194" y="128" width="28" height="48" rx="8" fill="#fff"/>',
    accesorios: '<rect x="120" y="50" width="60" height="110" rx="30" fill="none" stroke="#fff" stroke-width="10"/><path d="M150 52v40" stroke="#fff" stroke-width="8"/>',
    gaming: '<path d="M85 90h130a30 30 0 0 1 30 32l-6 40a18 18 0 0 1-32 6l-14-22H107l-14 22a18 18 0 0 1-32-6l-6-40a30 30 0 0 1 30-32z" fill="none" stroke="#fff" stroke-width="10"/><path d="M105 115v24M93 127h24" stroke="#fff" stroke-width="8"/><circle cx="195" cy="120" r="7" fill="#fff"/><circle cx="210" cy="136" r="7" fill="#fff"/>'
  };

  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* Imagen SVG generada (no depende de recursos externos). */
  function productImage(p) {
    var color = COLORS[p.category] || '#495057';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + color + '"/><stop offset="1" stop-color="#212529"/></linearGradient></defs>' +
      '<rect width="300" height="225" fill="url(#g)"/>' + (ICONS[p.category] || '') +
      '<text x="150" y="212" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="#fff" opacity=".9">' + esc(p.brand) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function stars(avg) {
    var full = Math.round(avg);
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= full ? '★' : '☆';
    return '<span class="stars" aria-label="Calificación ' + avg + ' de 5">' + s + '</span>';
  }

  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  // ---- Toasts ----
  function toast(msg, type) {
    var box = document.getElementById('toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    t.setAttribute('data-testid', 'toast');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('hide'); }, 3200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3700);
  }

  // ---- Errores de formulario ----
  function showErrors(form, errors) {
    var fields = form.querySelectorAll('[data-error-for]');
    for (var i = 0; i < fields.length; i++) { fields[i].textContent = ''; }
    var inputs = form.querySelectorAll('.invalid');
    for (var j = 0; j < inputs.length; j++) inputs[j].classList.remove('invalid');
    var first = null;
    Object.keys(errors || {}).forEach(function (k) {
      var el = form.querySelector('[data-error-for="' + k + '"]');
      if (el) el.textContent = errors[k];
      var input = form.querySelector('[name="' + k + '"]');
      if (input) { input.classList.add('invalid'); input.setAttribute('aria-invalid', 'true'); if (!first) first = input; }
    });
    if (first) first.focus();
  }

  // ---- Header / footer ----
  function renderHeader(active) {
    var user = Auth.currentUser();
    var count = Cart.count();
    var h = document.getElementById('site-header');
    if (!h) return;
    h.innerHTML =
      '<div class="header-inner">' +
        '<a class="logo" href="index.html" data-testid="logo"><span class="logo-mark">T</span>TechStore</a>' +
        '<form class="search" action="index.html" method="get" role="search" data-testid="search-form">' +
          '<label class="sr-only" for="search-q">Buscar productos</label>' +
          '<input id="search-q" name="q" type="search" placeholder="Buscar laptops, celulares, audífonos..." value="' + esc(qs('q')) + '" data-testid="search-input">' +
          '<button type="submit" class="btn btn-primary" data-testid="search-button">Buscar</button>' +
        '</form>' +
        '<nav class="nav" aria-label="Principal">' +
          '<a href="favoritos.html" class="' + (active === 'favoritos' ? 'active' : '') + '" data-testid="nav-favoritos">♡ Favoritos</a>' +
          (user
            ? '<a href="pedidos.html" class="' + (active === 'pedidos' ? 'active' : '') + '" data-testid="nav-pedidos">Mis pedidos</a>' +
              '<a href="perfil.html" class="' + (active === 'perfil' ? 'active' : '') + '" data-testid="nav-perfil">Hola, ' + esc(user.name.split(' ')[0]) + '</a>' +
              '<button type="button" class="link-btn" id="logout-btn" data-testid="logout-button">Cerrar sesión</button>'
            : '<a href="login.html" class="' + (active === 'login' ? 'active' : '') + '" data-testid="nav-login">Ingresar</a>' +
              '<a href="registro.html" class="' + (active === 'registro' ? 'active' : '') + '" data-testid="nav-registro">Crear cuenta</a>') +
          '<a href="carrito.html" class="cart-link ' + (active === 'carrito' ? 'active' : '') + '" data-testid="nav-carrito" aria-label="Carrito, ' + count + ' productos">' +
            '🛒 Carrito <span class="badge" id="cart-count" data-testid="cart-count">' + count + '</span></a>' +
        '</nav>' +
      '</div>';
    var lb = document.getElementById('logout-btn');
    if (lb) lb.addEventListener('click', function () {
      Auth.logout();
      window.location.href = 'index.html?logout=1';
    });
  }

  function updateCartCount() {
    var el = document.getElementById('cart-count');
    if (el) {
      var c = Cart.count();
      el.textContent = c;
      el.parentNode.setAttribute('aria-label', 'Carrito, ' + c + ' productos');
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    }
  }

  function renderFooter() {
    var f = document.getElementById('site-footer');
    if (!f) return;
    f.innerHTML =
      '<div class="footer-inner">' +
        '<div><strong>TechStore</strong><p class="muted">Tienda web académica para el curso de Calidad de Software. ' +
        'No se realizan compras ni pagos reales; los datos se guardan solo en este navegador.</p></div>' +
        '<details class="demo-data"><summary>Datos de prueba</summary>' +
          '<ul><li>Usuario: <code>demo@techstore.pe</code> / <code>Demo@1234</code></li>' +
          '<li>Cupones: <code>BIENVENIDO10</code>, <code>TECH50</code> (mín. S/ 500), <code>CALIDAD20</code> (mín. S/ 1000)</li>' +
          '<li>Tarjeta Visa de prueba: <code>4111 1111 1111 1111</code>, cualquier fecha futura, CVV <code>123</code></li></ul>' +
          '<button type="button" class="btn btn-small btn-outline" id="reset-demo" data-testid="reset-demo">Restablecer datos de demo</button>' +
        '</details>' +
        '<p class="muted small"><a href="privacidad.html">Política de privacidad</a> · v1.0</p>' +
      '</div>';
    document.getElementById('reset-demo').addEventListener('click', function () {
      if (confirm('Se borrarán carrito, pedidos, usuarios creados y stock modificado. ¿Continuar?')) {
        Store.reset();
        window.location.href = 'index.html';
      }
    });
  }

  // ---- Sesión: actividad e inactividad ----
  var wasLogged = false;
  function watchSession(protectedPage) {
    wasLogged = !!Auth.getSession();
    var last = 0;
    function activity() {
      var t = Date.now();
      if (t - last > 5000) { last = t; Auth.touch(); }
    }
    ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function (ev) {
      window.addEventListener(ev, activity, { passive: true });
    });
    setInterval(function () {
      var logged = !!Auth.getSession();
      if (wasLogged && !logged) {
        Auth.consumeExpiredFlag();
        if (protectedPage) {
          window.location.href = 'login.html?expired=1&next=' + encodeURIComponent(currentPage());
        } else {
          renderHeader(document.body.getAttribute('data-page'));
          toast('Tu sesión se cerró por inactividad (15 minutos).', 'warn');
        }
      }
      wasLogged = logged;
    }, 10000);
  }

  function currentPage() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p + window.location.search;
  }

  /* Para páginas que requieren sesión. Devuelve el usuario o redirige. */
  function requireAuth() {
    var u = Auth.currentUser();
    if (!u) {
      var expired = Auth.consumeExpiredFlag();
      window.location.href = 'login.html?' + (expired ? 'expired=1&' : 'auth=1&') + 'next=' + encodeURIComponent(currentPage());
      return null;
    }
    return u;
  }

  /* Inicialización común de cada página. */
  function init(opts) {
    opts = opts || {};
    Store.init();
    renderHeader(opts.active);
    renderFooter();
    // En páginas protegidas el aviso lo maneja requireAuth (redirige a login con ?expired=1)
    if (!opts.protected && Auth.consumeExpiredFlag()) {
      setTimeout(function () { toast('Tu sesión se cerró por inactividad (15 minutos). Vuelve a iniciar sesión.', 'warn'); }, 100);
    }
    watchSession(!!opts.protected);
  }

  return { esc: esc, money: money, productImage: productImage, stars: stars, qs: qs, toast: toast,
    showErrors: showErrors, renderHeader: renderHeader, updateCartCount: updateCartCount, requireAuth: requireAuth, init: init };
})();
