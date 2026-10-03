/* TechStore - Capa de persistencia sobre localStorage.
 * Si localStorage no está disponible (modo privado, file:// bloqueado, pruebas)
 * se usa un almacenamiento en memoria para que la app siga funcionando. */
var Store = (function () {
  var PREFIX = 'ts_';
  var memory = {};
  var backend = null;

  function detectBackend() {
    try {
      var k = PREFIX + '__probe';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  backend = detectBackend();

  function rawGet(key) {
    try {
      return backend ? backend.getItem(PREFIX + key) : (memory[key] === undefined ? null : memory[key]);
    } catch (e) { return memory[key] === undefined ? null : memory[key]; }
  }
  function rawSet(key, value) {
    try {
      if (backend) backend.setItem(PREFIX + key, value); else memory[key] = value;
    } catch (e) { memory[key] = value; }
  }
  function rawRemove(key) {
    try { if (backend) backend.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    delete memory[key];
  }

  function get(key, fallback) {
    var raw = rawGet(key);
    if (raw === null) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  function set(key, value) { rawSet(key, JSON.stringify(value)); }
  function remove(key) { rawRemove(key); }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* Inicializa datos semilla la primera vez. */
  function init() {
    if (!get('seeded', false)) reset();
  }

  /* Restablece la tienda al estado inicial de demo. */
  function reset() {
    set('products', clone(TS_DATA.products));
    set('reviews', clone(TS_DATA.reviews));
    set('users', [{
      name: 'Cliente Demo', email: 'demo@techstore.pe', phone: '987654321',
      // Contraseña: Demo@1234
      password: hashPassword('Demo@1234'), consent: true, consentDate: '2026-01-01T00:00:00.000Z',
      addresses: [{ id: 'A1', alias: 'Casa', fullName: 'Cliente Demo', phone: '987654321', department: 'Lima',
        district: 'Miraflores', street: 'Av. Larco 1234', reference: 'Frente al parque' }]
    }]);
    set('cart', { items: [], coupon: null });
    set('orders', []);
    set('wishlist', {});
    remove('session');
    set('seeded', true);
  }

  /* Ofuscación simple (NO es criptografía real; la app es solo académica). */
  function hashPassword(pwd) {
    var h = 5381;
    for (var i = 0; i < pwd.length; i++) h = ((h << 5) + h + pwd.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(16) + '_' + pwd.length;
  }

  /* Para pruebas: fuerza almacenamiento en memoria. */
  function useMemory() { backend = null; memory = {}; }

  // Accesos de dominio
  function getProducts() { return get('products', clone(TS_DATA.products)); }
  function saveProducts(list) { set('products', list); }
  function getProduct(id) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  return {
    init: init, reset: reset, get: get, set: set, remove: remove, useMemory: useMemory,
    hashPassword: hashPassword, getProducts: getProducts, saveProducts: saveProducts, getProduct: getProduct
  };
})();
