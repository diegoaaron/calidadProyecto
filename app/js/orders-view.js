/* TechStore - Render compartido del detalle de un pedido (confirmación e historial). */
var OrderView = (function () {
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  function detail(o) {
    var t = o.totals, a = o.address;
    return '<table class="items" data-testid="order-items"><thead><tr><th>Producto</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Total</th></tr></thead><tbody>' +
      o.items.map(function (it) {
        return '<tr><td><a href="producto.html?id=' + it.productId + '">' + UI.esc(it.name) + '</a></td><td class="num">' + it.qty +
          '</td><td class="num">' + UI.money(it.price) + '</td><td class="num">' + UI.money(it.lineTotal) + '</td></tr>';
      }).join('') + '</tbody><tfoot>' +
      '<tr><td colspan="3" class="num">Subtotal</td><td class="num">' + UI.money(t.subtotal) + '</td></tr>' +
      (t.discount ? '<tr><td colspan="3" class="num">Descuento (' + UI.esc(t.coupon) + ')</td><td class="num discount">− ' + UI.money(t.discount) + '</td></tr>' : '') +
      '<tr><td colspan="3" class="num">Envío</td><td class="num">' + (t.shipping ? UI.money(t.shipping) : 'Gratis') + '</td></tr>' +
      '<tr><td colspan="3" class="num"><strong>Total</strong></td><td class="num"><strong data-testid="order-total">' + UI.money(t.total) + '</strong></td></tr>' +
      '<tr><td colspan="3" class="num muted small">IGV incluido (18 %)</td><td class="num muted small">' + UI.money(t.igv) + '</td></tr>' +
      '</tfoot></table>' +
      '<p><strong>Envío:</strong> ' + UI.esc(o.shipping.name) + ' (' + UI.esc(o.shipping.days) + ')<br>' +
      UI.esc(a.fullName) + ' · ' + UI.esc(a.street) + ', ' + UI.esc(a.district) + ', ' + UI.esc(a.department) + ' · ' + UI.esc(a.phone) + '</p>' +
      '<p><strong>Pago:</strong> ' + UI.esc(o.payment.method) + (o.payment.last4 ? ' ' + UI.esc(o.payment.brand) + ' •••• ' + UI.esc(o.payment.last4) : '') + '</p>';
  }

  return { detail: detail, fmtDate: fmtDate };
})();
