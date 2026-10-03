/* TechStore - Autenticación, sesión y perfil (sin DOM, testeable).
 * Requisitos de seguridad (ver Prueba de Conformidad, ISO/IEC 25010 - Seguridad):
 *  - Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.
 *  - La sesión expira tras 15 minutos de inactividad.
 *  - Se exige aceptar la Política de Privacidad para registrarse.
 *  - Tras 5 intentos fallidos de login la cuenta se bloquea 5 minutos. */
var Auth = (function () {
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 5 * 60 * 1000;

  function now() { return Date.now(); }

  function timeoutMs() {
    // Se puede reducir para pruebas desde la consola: Store.set('session_timeout_ms', 60000)
    return Store.get('session_timeout_ms', TS_DATA.SESSION_TIMEOUT_MS);
  }

  function validatePassword(pwd) {
    pwd = pwd || '';
    var errors = [];
    if (pwd.length < 8) errors.push('Debe tener al menos 8 caracteres.');
    if (!/[A-Z]/.test(pwd)) errors.push('Debe incluir al menos una letra mayúscula.');
    if (!/[a-z]/.test(pwd)) errors.push('Debe incluir al menos una letra minúscula.');
    if (!/[0-9]/.test(pwd)) errors.push('Debe incluir al menos un número.');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('Debe incluir al menos un carácter especial (ej. @ # $ %).');
    return { ok: errors.length === 0, errors: errors };
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
  }

  function validatePhone(phone) {
    return /^9\d{8}$/.test(String(phone || '').trim());
  }

  function getUsers() { return Store.get('users', []); }
  function saveUsers(u) { Store.set('users', u); }
  function findUser(email) {
    var e = String(email || '').trim().toLowerCase();
    var list = getUsers();
    for (var i = 0; i < list.length; i++) if (list[i].email === e) return list[i];
    return null;
  }

  /* data: { name, email, phone, password, confirm, consent } */
  function register(data) {
    var errors = {};
    var name = String(data.name || '').trim();
    var email = String(data.email || '').trim().toLowerCase();
    if (name.length < 3) errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
    if (!validateEmail(email)) errors.email = 'Ingresa un correo electrónico válido.';
    else if (findUser(email)) errors.email = 'Ya existe una cuenta registrada con este correo.';
    if (data.phone && !validatePhone(data.phone)) errors.phone = 'El celular debe tener 9 dígitos y empezar con 9.';
    var pv = validatePassword(data.password);
    if (!pv.ok) errors.password = pv.errors.join(' ');
    if (data.password !== data.confirm) errors.confirm = 'Las contraseñas no coinciden.';
    if (!data.consent) errors.consent = 'Debes aceptar la Política de Privacidad y el tratamiento de datos personales para continuar.';
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var users = getUsers();
    users.push({ name: name, email: email, phone: String(data.phone || '').trim(), password: Store.hashPassword(data.password),
      consent: true, consentDate: new Date().toISOString(), addresses: [] });
    saveUsers(users);
    startSession(email);
    return { ok: true };
  }

  function login(email, password) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) return { ok: false, error: 'Ingresa tu correo y contraseña.' };
    var attempts = Store.get('login_attempts', {});
    var a = attempts[email] || { count: 0, lockedUntil: 0 };
    if (a.lockedUntil && a.lockedUntil > now()) {
      var mins = Math.ceil((a.lockedUntil - now()) / 60000);
      return { ok: false, locked: true, error: 'Cuenta bloqueada temporalmente por intentos fallidos. Intenta en ' + mins + ' minuto(s).' };
    }
    var u = findUser(email);
    if (!u || u.password !== Store.hashPassword(password)) {
      a.count = (a.lockedUntil && a.lockedUntil <= now()) ? 1 : a.count + 1;
      a.lockedUntil = 0;
      if (a.count >= MAX_ATTEMPTS) { a.lockedUntil = now() + LOCK_MS; a.count = 0; }
      attempts[email] = a;
      Store.set('login_attempts', attempts);
      if (a.lockedUntil) return { ok: false, locked: true, error: 'Has superado ' + MAX_ATTEMPTS + ' intentos. Cuenta bloqueada por 5 minutos.' };
      return { ok: false, error: 'Correo o contraseña incorrectos. Intentos restantes: ' + (MAX_ATTEMPTS - a.count) + '.' };
    }
    delete attempts[email];
    Store.set('login_attempts', attempts);
    startSession(email);
    return { ok: true, user: publicUser(u) };
  }

  function startSession(email) {
    Store.set('session', { email: email, startedAt: now(), lastActivity: now() });
    Store.remove('session_expired');
  }

  function logout() {
    Store.remove('session');
    return { ok: true };
  }

  /* Devuelve la sesión vigente o null. Si expiró por inactividad la cierra. */
  function getSession() {
    var s = Store.get('session', null);
    if (!s) return null;
    if (now() - s.lastActivity > timeoutMs()) {
      Store.remove('session');
      Store.set('session_expired', true);
      return null;
    }
    return s;
  }

  /* Registra actividad del usuario para extender la sesión. */
  function touch() {
    var s = getSession();
    if (s) { s.lastActivity = now(); Store.set('session', s); }
  }

  /* true una sola vez después de que la sesión expiró (para mostrar aviso). */
  function consumeExpiredFlag() {
    var f = Store.get('session_expired', false);
    if (f) Store.remove('session_expired');
    return f;
  }

  function publicUser(u) {
    return u ? { name: u.name, email: u.email, phone: u.phone, addresses: u.addresses || [], consentDate: u.consentDate } : null;
  }

  function currentUser() {
    var s = getSession();
    return s ? publicUser(findUser(s.email)) : null;
  }

  function updateUser(fn) {
    var s = getSession();
    if (!s) return { ok: false, error: 'Tu sesión ha expirado. Inicia sesión nuevamente.' };
    var users = getUsers();
    var res = { ok: false, error: 'Usuario no encontrado.' };
    users.forEach(function (u) { if (u.email === s.email) res = fn(u); });
    if (res.ok) saveUsers(users);
    return res;
  }

  function updateProfile(data) {
    var name = String(data.name || '').trim();
    var errors = {};
    if (name.length < 3) errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
    if (data.phone && !validatePhone(data.phone)) errors.phone = 'El celular debe tener 9 dígitos y empezar con 9.';
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    return updateUser(function (u) { u.name = name; u.phone = String(data.phone || '').trim(); return { ok: true }; });
  }

  function validateAddress(a) {
    var errors = {};
    if (!a || String(a.fullName || '').trim().length < 3) errors.fullName = 'Ingresa el nombre de quien recibe.';
    if (!validatePhone(a && a.phone)) errors.phone = 'El celular debe tener 9 dígitos y empezar con 9.';
    if (!a || TS_DATA.departments.indexOf(a.department) === -1) errors.department = 'Selecciona un departamento.';
    if (!a || String(a.district || '').trim().length < 3) errors.district = 'Ingresa el distrito.';
    if (!a || String(a.street || '').trim().length < 5) errors.street = 'Ingresa la dirección (calle, número).';
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function saveAddress(a) {
    var v = validateAddress(a);
    if (!v.ok) return v;
    return updateUser(function (u) {
      u.addresses = u.addresses || [];
      var clean = { id: a.id || ('A' + now()), alias: String(a.alias || 'Dirección').trim(), fullName: a.fullName.trim(),
        phone: a.phone.trim(), department: a.department, district: a.district.trim(), street: a.street.trim(),
        reference: String(a.reference || '').trim() };
      var idx = -1;
      u.addresses.forEach(function (x, i) { if (x.id === clean.id) idx = i; });
      if (idx >= 0) u.addresses[idx] = clean; else u.addresses.push(clean);
      return { ok: true, address: clean };
    });
  }

  function deleteAddress(id) {
    return updateUser(function (u) {
      var before = (u.addresses || []).length;
      u.addresses = (u.addresses || []).filter(function (x) { return x.id !== id; });
      return u.addresses.length < before ? { ok: true } : { ok: false, error: 'Dirección no encontrada.' };
    });
  }

  return { validatePassword: validatePassword, validateEmail: validateEmail, validatePhone: validatePhone,
    validateAddress: validateAddress, register: register, login: login, logout: logout, getSession: getSession,
    touch: touch, consumeExpiredFlag: consumeExpiredFlag, currentUser: currentUser, updateProfile: updateProfile,
    saveAddress: saveAddress, deleteAddress: deleteAddress, timeoutMs: timeoutMs, MAX_ATTEMPTS: MAX_ATTEMPTS };
})();
