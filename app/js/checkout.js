/* TechStore - Checkout: validación de pago simulado y creación de pedidos (sin DOM, testeable).
 * IMPORTANTE: no se procesa ningún pago real. Usa tarjetas de prueba, p. ej. 4111 1111 1111 1111. */
var Checkout = (function () {
  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  /* Algoritmo de Luhn (verificación del número de tarjeta). */
  function luhn(num) {
    var n = digits(num);
    if (n.length < 13 || n.length > 19) return false;
    var sum = 0, dbl = false;
    for (var i = n.length - 1; i >= 0; i--) {
      var d = parseInt(n.charAt(i), 10);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  function cardBrand(num) {
    var n = digits(num);
    if (/^4/.test(n)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'American Express';
    return 'Tarjeta';
  }

  /* expiry en formato MM/AA. today es opcional (para pruebas). */
  function validateExpiry(expiry, today) {
    var m = /^(\d{2})\/(\d{2})$/.exec(String(expiry || '').trim());
    if (!m) return false;
    var month = parseInt(m[1], 10), year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return false;
    var t = today || new Date();
    var cy = t.getFullYear(), cm = t.getMonth() + 1;
    return year > cy || (year === cy && month >= cm);
  }

  /* card: { number, holder, expiry, cvv } */
  function validateCard(card, today) {
    var errors = {};
    var n = digits(card.number);
    if (!luhn(n)) errors.number = 'Número de tarjeta inválido.';
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{5,}$/.test(String(card.holder || '').trim())) errors.holder = 'Ingresa el nombre como aparece en la tarjeta.';
    if (!validateExpiry(card.expiry, today)) errors.expiry = 'Fecha de vencimiento inválida o tarjeta vencida (MM/AA).';
    var cvvLen = cardBrand(n) === 'American Express' ? 4 : 3;
    if (!new RegExp('^\\d{' + cvvLen + '}$').test(String(card.cvv || ''))) errors.cvv = 'El CVV debe tener ' + cvvLen + ' dígitos.';
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }

  function newOrderId() {
    var d = new Date();
    return 'TS-' + d.getFullYear() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2) + '-' + pad(Math.floor(Math.random() * 10000), 4);
  }

  /* data: { address, shippingMethod, payment: { method: 'card'|'contraentrega', card } } */
  function placeOrder(data, today) {
    var user = Auth.currentUser();
    if (!user) return { ok: false, error: 'Tu sesión ha expirado. Inicia sesión para completar la compra.' };
    var items = Cart.getItems();
    if (!items.length) return { ok: false, error: 'Tu carrito está vacío.' };

    var av = Auth.validateAddress(data.address);
    if (!av.ok) return { ok: false, error: 'Revisa la dirección de envío.', errors: av.errors };

    var method = null;
    TS_DATA.shippingMethods.forEach(function (m) { if (m.id === data.shippingMethod) method = m; });
    if (!method) return { ok: false, error: 'Selecciona un método de envío.' };

    var pay = data.payment || {};
    var paymentInfo;
    if (pay.method === 'card') {
      var cv = validateCard(pay.card || {}, today);
      if (!cv.ok) return { ok: false, error: 'Revisa los datos de la tarjeta.', errors: cv.errors };
      var n = digits(pay.card.number);
      paymentInfo = { method: 'Tarjeta', brand: cardBrand(n), last4: n.slice(-4) };
    } else if (pay.method === 'contraentrega') {
      paymentInfo = { method: 'Pago contra entrega' };
    } else {
      return { ok: false, error: 'Selecciona un método de pago.' };
    }

    // Verificación de stock al momento de confirmar
    var products = Store.getProducts();
    var byId = {};
    products.forEach(function (p) { byId[p.id] = p; });
    for (var i = 0; i < items.length; i++) {
      var p = byId[items[i].productId];
      if (!p || p.stock < items[i].qty) {
        return { ok: false, error: 'Stock insuficiente para "' + items[i].name + '". Disponible: ' + (p ? p.stock : 0) + '.' };
      }
    }

    var totals = Cart.totals(method.id);
    items.forEach(function (it) { byId[it.productId].stock -= it.qty; });
    Store.saveProducts(products);

    var order = {
      id: newOrderId(), date: new Date().toISOString(), email: user.email, status: 'Confirmado',
      items: items.map(function (it) { return { productId: it.productId, name: it.name, price: it.price, qty: it.qty, lineTotal: it.lineTotal }; }),
      totals: totals, address: data.address, shipping: { id: method.id, name: method.name, days: method.days },
      payment: paymentInfo
    };
    var orders = Store.get('orders', []);
    orders.unshift(order);
    Store.set('orders', orders);
    Cart.clear();
    return { ok: true, order: order };
  }

  function getOrders() {
    var user = Auth.currentUser();
    if (!user) return [];
    return Store.get('orders', []).filter(function (o) { return o.email === user.email; });
  }

  function getOrder(id) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  return { luhn: luhn, cardBrand: cardBrand, validateExpiry: validateExpiry, validateCard: validateCard,
    placeOrder: placeOrder, getOrders: getOrders, getOrder: getOrder };
})();
