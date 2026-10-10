/* TechStore - Prueba de usabilidad no moderada (alternativa propia a Maze).
 * Usability: lógica sin DOM (tareas, registro de la sesión, SUS y métricas consolidadas), testeable.
 * UsabilityPanel: panel flotante que guía al participante por las tareas en todas las páginas.
 * La sesión se guarda en Store con la clave 'usab'; los resultados se exportan como JSON. */
var Usability = (function () {
  var KEY = 'usab';
  var VERSION = 1;

  function orderSince(startedAt, fn) {
    return Store.get('orders', []).some(function (o) {
      return new Date(o.date).getTime() >= startedAt && fn(o);
    });
  }

  /* Tareas del Plan de Pruebas: buscar, filtrar, agregar, aplicar cupón y comprar.
   * check(ctx) recibe { page, params, startedAt } y devuelve true cuando la tarea se cumplió. */
  var TASKS = [
    { id: 'T1', name: 'Buscar', hu: 'HU02, HU06',
      text: 'Busca los audífonos «Sony WH-1000XM5» y abre su página de detalle.',
      check: function (ctx) { return ctx.page === 'producto.html' && ctx.params.id === 'P012'; } },
    { id: 'T2', name: 'Filtrar', hu: 'HU03, HU04, HU05',
      text: 'Encuentra el celular más barato de la tienda y abre su página de detalle.',
      check: function (ctx) { return ctx.page === 'producto.html' && ctx.params.id === 'P007'; } },
    { id: 'T3', name: 'Agregar al carrito', hu: 'HU09, HU11',
      text: 'Agrega 2 unidades del «Parlante JBL Flip 6» a tu carrito.',
      check: function () {
        return Cart.getItems().some(function (it) { return it.productId === 'P014' && it.qty >= 2; });
      } },
    { id: 'T4', name: 'Aplicar cupón', hu: 'HU15',
      text: 'Aplica el cupón de descuento BIENVENIDO10 en tu carrito.',
      check: function () { return Store.get('cart', {}).coupon === 'BIENVENIDO10'; } },
    { id: 'T5', name: 'Comprar', hu: 'HU20, HU24–HU28',
      text: 'Completa la compra de tu carrito con envío express y pago con tarjeta.',
      check: function (ctx) {
        return orderSince(ctx.startedAt, function (o) { return o.shipping.id === 'express' && o.payment.method === 'Tarjeta'; });
      } }
  ];

  var SUS_QUESTIONS = [
    'Creo que me gustaría usar esta tienda con frecuencia.',
    'Encontré la tienda innecesariamente compleja.',
    'Pensé que la tienda era fácil de usar.',
    'Creo que necesitaría la ayuda de una persona con conocimientos técnicos para usar esta tienda.',
    'Las diversas funciones de la tienda estaban bien integradas.',
    'Pensé que había demasiada inconsistencia en la tienda.',
    'Imagino que la mayoría de las personas aprendería a usar esta tienda muy rápidamente.',
    'Encontré la tienda muy complicada de usar.',
    'Me sentí muy seguro/a usando la tienda.',
    'Necesité aprender muchas cosas antes de poder usar la tienda.'
  ];

  // Metas del Plan de Calidad / Plan de Pruebas
  var GOALS = { successRate: 80, sus: 68, minParticipants: 5 };

  function now() { return Date.now(); }
  function load() { return Store.get(KEY, null); }
  function save(s) { Store.set(KEY, s); }

  function randomId() {
    return 'P-' + now().toString(36).toUpperCase().slice(-4) + (100000 + Math.floor(Math.random() * 900000)).toString(36).toUpperCase();
  }

  /* Inicia una sesión nueva desde datos de demo limpios.
   * meta: { alias, device: { width, height, touch, userAgent } } */
  function start(meta) {
    meta = meta || {};
    if (!meta.consent) return { ok: false, error: 'Debes aceptar las condiciones para participar.' };
    Store.reset();
    var s = {
      tool: 'TechStore-usabilidad', version: VERSION, id: randomId(),
      alias: String(meta.alias || '').trim().slice(0, 40) || 'Anónimo',
      device: meta.device || {}, startedAt: new Date(now()).toISOString(), finishedAt: null,
      phase: 'tasks', current: 0, step: 'brief',
      tasks: TASKS.map(function (t) {
        return { id: t.id, name: t.name, status: 'pendiente', startedAt: null, timeMs: null,
          clicks: 0, misclicks: 0, pages: [], seq: null };
      }),
      sus: null, comment: ''
    };
    save(s);
    return { ok: true, session: s };
  }

  function session() { return load(); }
  function active() { var s = load(); return !!(s && s.phase !== 'done'); }
  function currentTask() {
    var s = load();
    if (!s || s.phase !== 'tasks') return null;
    return { def: TASKS[s.current], rec: s.tasks[s.current], index: s.current, total: TASKS.length, step: s.step };
  }

  function update(fn) {
    var s = load();
    if (!s || s.phase !== 'tasks') return { ok: false, error: 'No hay una prueba en curso.' };
    var r = fn(s, s.tasks[s.current]);
    save(s);
    return r || { ok: true };
  }

  /* El participante leyó la consigna y empieza: aquí arranca el cronómetro. */
  function beginTask(page) {
    return update(function (s, rec) {
      if (s.step !== 'brief') return { ok: false, error: 'La tarea ya empezó.' };
      s.step = 'doing';
      rec.status = 'en curso';
      rec.startedAt = now();
      if (page) rec.pages.push(page);
    });
  }

  function recordPage(page) {
    return update(function (s, rec) {
      if (s.step === 'doing' && rec.pages[rec.pages.length - 1] !== page) rec.pages.push(page);
    });
  }

  function recordClick(isMisclick) {
    return update(function (s, rec) {
      if (s.step !== 'doing') return;
      rec.clicks++;
      if (isMisclick) rec.misclicks++;
    });
  }

  function finishTask(status) {
    return update(function (s, rec) {
      if (s.step !== 'doing') return { ok: false, error: 'La tarea no está en curso.' };
      rec.status = status;
      rec.timeMs = now() - rec.startedAt;
      s.step = 'seq';
      return { ok: true, status: status };
    });
  }

  /* Revisa si la tarea en curso ya se cumplió. ctx: { page, params } */
  function evaluate(ctx) {
    var t = currentTask();
    if (!t || t.step !== 'doing') return { ok: true, completed: false };
    var done = false;
    try {
      done = !!t.def.check({ page: ctx.page, params: ctx.params || {}, startedAt: t.rec.startedAt });
    } catch (e) { done = false; }
    if (!done) return { ok: true, completed: false };
    finishTask('exito');
    return { ok: true, completed: true };
  }

  function abandon() { return finishTask('abandono'); }

  /* Pregunta de facilidad (SEQ, 1 = muy difícil … 7 = muy fácil) y paso a la siguiente tarea. */
  function rateTask(value) {
    var v = Number(value);
    if (!(v >= 1 && v <= 7 && Math.floor(v) === v)) return { ok: false, error: 'Elige un valor del 1 al 7.' };
    return update(function (s, rec) {
      if (s.step !== 'seq') return { ok: false, error: 'Primero termina la tarea.' };
      rec.seq = v;
      if (s.current < TASKS.length - 1) {
        s.current++;
        s.step = 'brief';
        return { ok: true, next: true };
      }
      s.phase = 'sus';
      s.step = null;
      return { ok: true, next: false };
    });
  }

  /* Puntaje SUS (0–100): impares aportan (x − 1), pares (5 − x); suma × 2,5. */
  function susScore(answers) {
    if (!answers || answers.length !== 10) return null;
    var sum = 0;
    for (var i = 0; i < 10; i++) {
      var a = Number(answers[i]);
      if (!(a >= 1 && a <= 5)) return null;
      sum += i % 2 === 0 ? a - 1 : 5 - a;
    }
    return sum * 2.5;
  }

  /* Interpretación de Bangor, Kortum y Miller (2009). */
  function susGrade(score) {
    if (score === null || score === undefined) return '';
    if (score > 80.3) return 'Excelente';
    if (score >= 68) return 'Bueno';
    if (score >= 51) return 'Aceptable';
    return 'Pobre';
  }

  function submitSus(answers, comment) {
    var s = load();
    if (!s || s.phase !== 'sus') return { ok: false, error: 'El cuestionario no está disponible.' };
    var score = susScore(answers);
    if (score === null) return { ok: false, error: 'Responde las 10 afirmaciones.' };
    s.sus = { answers: answers.map(Number), score: score };
    s.comment = String(comment || '').trim().slice(0, 1000);
    s.phase = 'done';
    s.finishedAt = new Date(now()).toISOString();
    save(s);
    return { ok: true, score: score };
  }

  /* Resultado exportable (sin datos personales: solo alias, dispositivo y métricas). */
  function result() {
    var s = load();
    if (!s || s.phase !== 'done') return null;
    var out = JSON.parse(JSON.stringify(s));
    delete out.phase; delete out.current; delete out.step;
    out.tasks.forEach(function (t) { delete t.startedAt; });
    return out;
  }

  function clear() { Store.remove(KEY); }

  // ---- Consolidación de resultados de varios participantes ----

  function validResult(r) {
    return r && r.tool === 'TechStore-usabilidad' && r.tasks && r.tasks.length === TASKS.length &&
      r.sus && typeof r.sus.score === 'number';
  }

  function mean(list) { return list.length ? list.reduce(function (a, b) { return a + b; }, 0) / list.length : null; }
  function median(list) {
    if (!list.length) return null;
    var l = list.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(l.length / 2);
    return l.length % 2 ? l[m] : (l[m - 1] + l[m]) / 2;
  }
  function sd(list) {
    if (list.length < 2) return 0;
    var m = mean(list);
    return Math.sqrt(list.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (list.length - 1));
  }
  function r1(n) { return n === null ? null : Math.round(n * 10) / 10; }

  /* results: lista de JSON exportados. Devuelve métricas por tarea y globales. */
  function aggregate(results) {
    var seen = {};
    var valid = (results || []).filter(function (r) {
      if (!validResult(r) || seen[r.id]) return false;
      seen[r.id] = true;
      return true;
    });
    var tasks = TASKS.map(function (t, i) {
      var recs = valid.map(function (r) { return r.tasks[i]; });
      var ok = recs.filter(function (x) { return x.status === 'exito'; });
      var clicks = recs.reduce(function (s, x) { return s + x.clicks; }, 0);
      var miss = recs.reduce(function (s, x) { return s + x.misclicks; }, 0);
      var times = ok.map(function (x) { return x.timeMs / 1000; });
      var seqs = recs.filter(function (x) { return x.seq; }).map(function (x) { return x.seq; });
      return {
        id: t.id, name: t.name, hu: t.hu, attempts: recs.length, successes: ok.length,
        successRate: recs.length ? r1(ok.length / recs.length * 100) : null,
        meanTime: r1(mean(times)), medianTime: r1(median(times)),
        misclickRate: clicks ? r1(miss / clicks * 100) : 0,
        seq: r1(mean(seqs))
      };
    });
    var attempts = tasks.reduce(function (s, t) { return s + t.attempts; }, 0);
    var successes = tasks.reduce(function (s, t) { return s + t.successes; }, 0);
    var sus = valid.map(function (r) { return r.sus.score; });
    var overall = {
      participants: valid.length, ignored: (results || []).length - valid.length,
      successRate: attempts ? r1(successes / attempts * 100) : null,
      susMean: r1(mean(sus)), susSd: r1(sd(sus)),
      susMin: sus.length ? Math.min.apply(null, sus) : null, susMax: sus.length ? Math.max.apply(null, sus) : null
    };
    overall.susGrade = susGrade(overall.susMean);
    overall.meetsSuccess = overall.successRate !== null && overall.successRate >= GOALS.successRate;
    overall.meetsSus = overall.susMean !== null && overall.susMean >= GOALS.sus;
    overall.enoughParticipants = valid.length >= GOALS.minParticipants;
    return { tasks: tasks, overall: overall, participants: valid };
  }

  return { TASKS: TASKS, SUS_QUESTIONS: SUS_QUESTIONS, GOALS: GOALS, start: start, session: session, active: active,
    currentTask: currentTask, beginTask: beginTask, recordPage: recordPage, recordClick: recordClick, evaluate: evaluate,
    abandon: abandon, rateTask: rateTask, susScore: susScore, susGrade: susGrade, submitSus: submitSus, result: result,
    clear: clear, aggregate: aggregate };
})();

/* Panel flotante del participante. Solo se monta si hay una prueba en curso. */
var UsabilityPanel = (function () {
  var INTERACTIVE = 'a, button, input, select, textarea, label, summary, option, [role="button"], [tabindex]';
  var root = null, timer = null;

  function page() { return window.location.pathname.split('/').pop() || 'index.html'; }
  function params() {
    var out = {};
    window.location.search.replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      out[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
    });
    return out;
  }

  function check() {
    var r = Usability.evaluate({ page: page(), params: params() });
    if (r.completed) render();
  }

  function onClick(e) {
    if (root && root.contains(e.target)) return;
    var hit = e.target.closest ? e.target.closest(INTERACTIVE) : null;
    Usability.recordClick(!hit);
    // Las acciones (agregar, aplicar cupón…) cambian el estado tras el clic
    setTimeout(check, 150);
  }

  function render() {
    var t = Usability.currentTask();
    if (!t) {
      var s = Usability.session();
      if (s && s.phase === 'sus' && page() !== 'usabilidad.html') { window.location.href = 'usabilidad.html'; return; }
      if (root) root.innerHTML = '';
      return;
    }
    var head = '<div class="usab-head"><strong>Tarea ' + (t.index + 1) + ' de ' + t.total + '</strong>' +
      '<span class="usab-dots">' + Usability.TASKS.map(function (x, i) {
        return '<span class="' + (i < t.index ? 'done' : i === t.index ? 'now' : '') + '"></span>';
      }).join('') + '</span></div>';
    var hint = '<details class="usab-data"><summary>Datos de prueba</summary>' +
      '<p>Cuenta: <code>demo@techstore.pe</code> / <code>Demo@1234</code><br>' +
      'Tarjeta: <code>4111 1111 1111 1111</code>, vence <code>12/30</code>, CVV <code>123</code></p></details>';
    var body;
    if (t.step === 'brief') {
      body = '<p class="usab-text" data-testid="usab-task-text">' + UI.esc(t.def.text) + '</p>' +
        '<p class="small muted">Hazlo como lo harías normalmente. No hay respuestas incorrectas: evaluamos la tienda, no a ti.</p>' +
        '<button type="button" class="btn btn-primary btn-block" data-act="begin" data-testid="usab-begin">Empezar tarea</button>';
    } else if (t.step === 'doing') {
      body = '<p class="usab-text" data-testid="usab-task-text">' + UI.esc(t.def.text) + '</p>' + hint +
        '<button type="button" class="btn btn-outline btn-small" data-act="abandon" data-testid="usab-abandon">No pude hacerlo, pasar a la siguiente</button>';
    } else {
      var ok = t.rec.status === 'exito';
      body = '<p class="usab-text">' + (ok ? '✅ ¡Tarea completada!' : 'Tarea omitida.') + ' ¿Qué tan fácil o difícil te resultó?</p>' +
        '<div class="usab-scale" role="group" aria-label="Facilidad de 1 a 7">' +
        [1, 2, 3, 4, 5, 6, 7].map(function (n) {
          return '<button type="button" class="btn btn-outline btn-small" data-act="seq" data-value="' + n + '" data-testid="usab-seq-' + n + '">' + n + '</button>';
        }).join('') + '</div><div class="usab-scale-labels small muted"><span>Muy difícil</span><span>Muy fácil</span></div>';
    }
    root.className = 'usab-panel' + (t.step === 'doing' ? ' usab-doing' : '');
    root.innerHTML = head + body;
  }

  function onPanelClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'begin') { Usability.beginTask(page()); check(); }
    else if (act === 'abandon') {
      if (confirm('¿Seguro que quieres pasar a la siguiente tarea?')) Usability.abandon();
    } else if (act === 'seq') {
      var r = Usability.rateTask(b.getAttribute('data-value'));
      if (r.ok && !r.next) { window.location.href = 'usabilidad.html'; return; }
      if (r.ok) check();
    }
    render();
  }

  function mount() {
    // Sin UI (p. ej. tests.html) o en la propia página de la prueba no se muestra el panel
    if (typeof UI === 'undefined' || root || !Usability.active() || page() === 'usabilidad.html') return;
    root = document.createElement('aside');
    root.setAttribute('aria-label', 'Prueba de usabilidad');
    root.setAttribute('data-testid', 'usab-panel');
    document.body.appendChild(root);
    document.body.classList.add('usab-on');
    root.addEventListener('click', onPanelClick);
    document.addEventListener('click', onClick, true);
    Usability.recordPage(page());
    check();
    render();
    timer = setInterval(check, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  return { mount: mount };
})();
