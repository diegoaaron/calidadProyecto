# CLAUDE.md

Proyecto académico del curso **Calidad de Software**. TechStore es una tienda web de tecnología
(carrito de compras) que sirve como sistema controlado para los entregables semanales del curso.
Idioma del proyecto: **español** (UI, documentos, mensajes de commit).

## Restricciones clave

- **Solo frontend**: HTML + CSS + JavaScript puro. Sin backend, sin npm, sin build, sin frameworks.
- Persistencia en `localStorage` (prefijo `ts_`) a través de `Store`; nunca acceder a `localStorage` directamente.
- Scripts clásicos (no ES modules) para que funcione con `file://` (doble clic en `app/index.html`) y en GitHub Pages.
- Sin recursos externos (CDN, imágenes remotas): las imágenes de producto son SVG generados en `UI.productImage`.

## Estructura

```
app/                  Aplicación (se publica en GitHub Pages; index.html raíz redirige aquí)
  js/data.js          Datos semilla: productos, reseñas, cupones, envíos, constantes (IGV, timeout)
  js/store.js         Persistencia + reset de datos de demo
  js/auth.js          Registro, login, sesión (15 min), bloqueo (5 intentos), perfil, direcciones
  js/cart.js          Lógica del carrito, cupones, totales con IGV incluido
  js/catalog.js       Búsqueda, filtros, orden, reseñas, favoritos
  js/checkout.js      Validación de tarjeta (Luhn), creación de pedidos, historial
  js/ui.js            Header/footer, toasts, errores de formulario, control de sesión por página
  js/orders-view.js   Render compartido del detalle de pedido
  *.html              Una página por pantalla; el script de cada página va inline al final
  tests/tests.html    Pruebas unitarias en navegador (mini-framework propio)
docs/                 Entregables del curso (.docx)
```

Orden de carga de scripts en cada página: `data → store → auth → cart → catalog → [checkout] → ui → [orders-view]`.

## Convenciones

- La lógica de negocio (`auth`, `cart`, `catalog`, `checkout`) **no toca el DOM** y devuelve
  `{ ok: true, ... }` o `{ ok: false, error | errors }`. Mantener esa separación para que sea testeable.
- Los mensajes de error que ve el usuario están en español y aparecen en el informe de historias de usuario
  como resultado esperado: si cambias un mensaje, actualiza también los documentos de `docs/`.
- Elementos interactivos clave llevan `data-testid` (usados para casos de prueba / automatización). No eliminarlos.
- Páginas protegidas llaman `UI.init({ protected: true })` y luego `UI.requireAuth()`.
- Escapar todo contenido dinámico con `UI.esc` al construir HTML.

## Reglas de negocio (fuente de verdad para documentos y pruebas)

- Precios en S/ con IGV 18 % incluido (IGV = total − total/1.18). Máx. 10 unidades por producto y ≤ stock.
- Cupones: `BIENVENIDO10` 10 %, `TECH50` S/ 50 (mín. S/ 500), `CALIDAD20` 20 % (mín. S/ 1000).
- Envío: estándar S/ 15 (gratis desde S/ 300), express S/ 35, recojo en tienda gratis.
- Contraseña: ≥ 8 caracteres, mayúscula, minúscula, número y especial. Consentimiento de privacidad obligatorio.
- Sesión expira a los 15 min de inactividad; 5 intentos fallidos bloquean 5 min. Checkout requiere sesión.
- Usuario demo: `demo@techstore.pe` / `Demo@1234`. Tarjeta de prueba: `4111 1111 1111 1111`.

## Pruebas

- Abrir `app/tests/tests.html` en el navegador: debe mostrar todas las pruebas aprobadas.
  Usan `Store.useMemory()` + `Store.reset()`, así que no alteran los datos de la tienda.
- Al cambiar lógica en `js/`, agregar o ajustar pruebas en `tests/tests.html`.
- Prueba manual del timeout: en consola `Store.set('session_timeout_ms', 60000)`; revertir con `Store.remove('session_timeout_ms')`.
- Verificar en móvil (375 px) que no haya scroll horizontal.

## Entregables del curso (`docs/`)

Los modelos de referencia del docente están en `referencias/` (`historia_usuarios.pptx`, `Modelo de *.docx`,
excluidos de git). Los entregables deben seguir esos modelos y mantener la trazabilidad con
los IDs del informe de historias: **HU01–HU30, RF01–RF30 (1:1 con las HU), RNF01–RNF09, épicas EP01–EP05**.

| Entregable | Estado |
|---|---|
| Informe de Historias de Usuario (`docs/Informe_Historias_de_Usuario.docx`) | Hecho |
| Análisis de usabilidad con Maze (requiere URL de GitHub Pages) | Pendiente |
| Esquema breve de Plan de Calidad, Plan de Pruebas y Conformidad (`docs/Esquema_Calidad_Pruebas_Conformidad.docx`) | Avance |
| Plan de Pruebas | Pendiente |
| Plan de Calidad | Pendiente |
| Prueba de Conformidad (ISO/IEC 25010) | Pendiente |

En las carátulas, dejar los datos del estudiante/docente como marcadores `[...]` para que el usuario los complete.
