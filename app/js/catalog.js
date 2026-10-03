/* TechStore - Catálogo: búsqueda, filtros, orden, reseñas y favoritos (sin DOM, testeable). */
var Catalog = (function () {
  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  function ratingOf(productId) {
    var list = getReviews(productId);
    if (!list.length) return { avg: 0, count: 0 };
    var sum = list.reduce(function (s, r) { return s + r.rating; }, 0);
    return { avg: Math.round(sum / list.length * 10) / 10, count: list.length };
  }

  function getReviews(productId) {
    return Store.get('reviews', []).filter(function (r) { return r.productId === productId; });
  }

  /* opts: { q, category, brands: [], minPrice, maxPrice, inStock, sort } */
  function query(opts) {
    opts = opts || {};
    var q = normalize(opts.q);
    var list = Store.getProducts().filter(function (p) {
      if (q && normalize(p.name + ' ' + p.brand).indexOf(q) === -1) return false;
      if (opts.category && p.category !== opts.category) return false;
      if (opts.brands && opts.brands.length && opts.brands.indexOf(p.brand) === -1) return false;
      if (opts.minPrice !== undefined && opts.minPrice !== null && opts.minPrice !== '' && p.price < Number(opts.minPrice)) return false;
      if (opts.maxPrice !== undefined && opts.maxPrice !== null && opts.maxPrice !== '' && p.price > Number(opts.maxPrice)) return false;
      if (opts.inStock && p.stock <= 0) return false;
      return true;
    }).map(function (p) {
      var r = ratingOf(p.id);
      var o = {};
      for (var k in p) o[k] = p[k];
      o.rating = r.avg; o.reviewCount = r.count;
      return o;
    });

    var sorters = {
      'precio-asc': function (a, b) { return a.price - b.price; },
      'precio-desc': function (a, b) { return b.price - a.price; },
      'nombre-asc': function (a, b) { return a.name.localeCompare(b.name, 'es'); },
      'nombre-desc': function (a, b) { return b.name.localeCompare(a.name, 'es'); },
      'valoracion': function (a, b) { return b.rating - a.rating || b.reviewCount - a.reviewCount; }
    };
    if (opts.sort && sorters[opts.sort]) list.sort(sorters[opts.sort]);
    return list;
  }

  function brands(category) {
    var set = {};
    Store.getProducts().forEach(function (p) { if (!category || p.category === category) set[p.brand] = true; });
    return Object.keys(set).sort();
  }

  function categoryName(id) {
    for (var i = 0; i < TS_DATA.categories.length; i++) if (TS_DATA.categories[i].id === id) return TS_DATA.categories[i].name;
    return id;
  }

  function stockStatus(p) {
    if (p.stock <= 0) return { code: 'agotado', label: 'Agotado' };
    if (p.stock <= 3) return { code: 'pocas', label: '¡Últimas ' + p.stock + ' unidades!' };
    return { code: 'disponible', label: 'Disponible (' + p.stock + ' en stock)' };
  }

  // ---- Favoritos (requiere sesión) ----
  function wishKey() {
    var u = Auth.currentUser();
    return u ? u.email : null;
  }
  function getWishlist() {
    var k = wishKey();
    if (!k) return [];
    return (Store.get('wishlist', {})[k] || []).slice();
  }
  function isFavorite(productId) { return getWishlist().indexOf(productId) !== -1; }
  function toggleFavorite(productId) {
    var k = wishKey();
    if (!k) return { ok: false, needLogin: true, error: 'Inicia sesión para guardar favoritos.' };
    if (!Store.getProduct(productId)) return { ok: false, error: 'El producto no existe.' };
    var all = Store.get('wishlist', {});
    var list = all[k] || [];
    var idx = list.indexOf(productId);
    var added;
    if (idx === -1) { list.push(productId); added = true; } else { list.splice(idx, 1); added = false; }
    all[k] = list;
    Store.set('wishlist', all);
    return { ok: true, added: added };
  }

  return { query: query, brands: brands, categoryName: categoryName, stockStatus: stockStatus, ratingOf: ratingOf,
    getReviews: getReviews, getWishlist: getWishlist, isFavorite: isFavorite, toggleFavorite: toggleFavorite, normalize: normalize };
})();
