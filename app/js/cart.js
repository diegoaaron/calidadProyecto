/* TechStore - Lógica del carrito de compras (sin DOM, testeable).
 * Todas las operaciones devuelven { ok: true, ... } o { ok: false, error: 'mensaje' }.
 * Los precios del catálogo incluyen IGV (18 %). */
var Cart = (function () {
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function load() {
    var c = Store.get('cart', null);
    if (!c || !c.items) c = { items: [], coupon: null };
    return c;
  }
  function save(c) { Store.set('cart', c); }

  function maxAllowed(product) {
    return Math.min(product.stock, TS_DATA.MAX_QTY_PER_ITEM);
  }

  function isValidQty(q) {
    return typeof q === 'number' && isFinite(q) && Math.floor(q) === q;
  }

  /* Ítems del carrito unidos con la información actual del producto. */
  function getItems() {
    var c = load();
    var out = [];
    c.items.forEach(function (it) {
      var p = Store.getProduct(it.productId);
      if (p) out.push({ productId: p.id, name: p.name, brand: p.brand, category: p.category,
        price: p.price, stock: p.stock, qty: it.qty, lineTotal: round2(p.price * it.qty) });
    });
    return out;
  }

  function add(productId, qty) {
    if (qty === undefined) qty = 1;
    if (!isValidQty(qty) || qty < 1) return { ok: false, error: 'La cantidad debe ser un número entero mayor o igual a 1.' };
    var p = Store.getProduct(productId);
    if (!p) return { ok: false, error: 'El producto no existe.' };
    if (p.stock <= 0) return { ok: false, error: 'Producto agotado.' };
    var c = load();
    var existing = null;
    for (var i = 0; i < c.items.length; i++) if (c.items[i].productId === productId) existing = c.items[i];
    var current = existing ? existing.qty : 0;
    var max = maxAllowed(p);
    if (current + qty > max) {
      return { ok: false, error: 'Solo puedes llevar hasta ' + max + ' unidad(es) de este producto' +
        (current ? ' (ya tienes ' + current + ' en el carrito).' : '.') };
    }
    if (existing) existing.qty = current + qty; else c.items.push({ productId: productId, qty: qty });
    save(c);
    return { ok: true, qty: current + qty };
  }

  function updateQty(productId, qty) {
    if (!isValidQty(qty) || qty < 1) return { ok: false, error: 'La cantidad mínima es 1. Usa "Eliminar" para quitar el producto.' };
    var p = Store.getProduct(productId);
    if (!p) return { ok: false, error: 'El producto no existe.' };
    var max = maxAllowed(p);
    if (qty > max) return { ok: false, error: 'Stock disponible: máximo ' + max + ' unidad(es).' };
    var c = load();
    var found = false;
    c.items.forEach(function (it) { if (it.productId === productId) { it.qty = qty; found = true; } });
    if (!found) return { ok: false, error: 'El producto no está en el carrito.' };
    save(c);
    return { ok: true, qty: qty };
  }

  function remove(productId) {
    var c = load();
    var before = c.items.length;
    c.items = c.items.filter(function (it) { return it.productId !== productId; });
    if (c.items.length === before) return { ok: false, error: 'El producto no está en el carrito.' };
    if (c.items.length === 0) c.coupon = null;
    save(c);
    return { ok: true };
  }

  function clear() {
    save({ items: [], coupon: null });
    return { ok: true };
  }

  /* Número total de unidades (contador del header). */
  function count() {
    return load().items.reduce(function (s, it) { return s + it.qty; }, 0);
  }

  function subtotal() {
    return round2(getItems().reduce(function (s, it) { return s + it.lineTotal; }, 0));
  }

  function evaluateCoupon(code, sub) {
    var key = String(code || '').trim().toUpperCase();
    if (!key) return { ok: false, error: 'Ingresa un código de cupón.' };
    var cp = TS_DATA.coupons[key];
    if (!cp) return { ok: false, error: 'El cupón "' + key + '" no es válido.' };
    if (sub < cp.minSubtotal) return { ok: false, error: 'El cupón ' + key + ' requiere una compra mínima de S/ ' + cp.minSubtotal.toFixed(2) + '.' };
    var discount = cp.type === 'percent' ? round2(sub * cp.value / 100) : Math.min(cp.value, sub);
    return { ok: true, code: key, discount: round2(discount), description: cp.description };
  }

  function applyCoupon(code) {
    var c = load();
    if (c.items.length === 0) return { ok: false, error: 'Tu carrito está vacío.' };
    var r = evaluateCoupon(code, subtotal());
    if (!r.ok) return r;
    c.coupon = r.code;
    save(c);
    return r;
  }

  function removeCoupon() {
    var c = load();
    c.coupon = null;
    save(c);
    return { ok: true };
  }

  function shippingCost(methodId, sub) {
    var m = null;
    TS_DATA.shippingMethods.forEach(function (x) { if (x.id === methodId) m = x; });
    if (!m) return 0;
    if (m.freeFrom !== null && sub >= m.freeFrom) return 0;
    return m.cost;
  }

  /* Resumen de montos. methodId es opcional (sin método no se cobra envío). */
  function totals(methodId) {
    var c = load();
    var sub = subtotal();
    var discount = 0, couponCode = null, couponError = null;
    if (c.coupon) {
      var r = evaluateCoupon(c.coupon, sub);
      if (r.ok) { discount = r.discount; couponCode = r.code; } else { couponError = r.error; }
    }
    var afterDiscount = round2(sub - discount);
    var shipping = methodId ? shippingCost(methodId, afterDiscount) : 0;
    var total = round2(afterDiscount + shipping);
    var base = round2(total / (1 + TS_DATA.IGV_RATE));
    var igv = round2(total - base);
    return { subtotal: sub, discount: discount, coupon: couponCode, couponError: couponError,
      shipping: shipping, total: total, base: base, igv: igv, units: count() };
  }

  return { getItems: getItems, add: add, updateQty: updateQty, remove: remove, clear: clear, count: count,
    subtotal: subtotal, applyCoupon: applyCoupon, removeCoupon: removeCoupon, evaluateCoupon: evaluateCoupon,
    shippingCost: shippingCost, totals: totals, round2: round2 };
})();
