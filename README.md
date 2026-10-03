# TechStore – Proyecto del curso de Calidad de Software

Aplicación web de **carrito de compras** (tienda de tecnología) hecha solo con HTML, CSS y JavaScript.
No tiene backend: todo corre en el navegador y los datos se guardan en `localStorage`.
Sirve como sistema controlado para los entregables del curso: historias de usuario, análisis con Maze,
plan de pruebas, plan de calidad y prueba de conformidad.

## Estructura

```
app/                 Aplicación web (lo que se publica)
  index.html         Catálogo: búsqueda, categorías, filtros, orden
  producto.html      Detalle de producto (?id=P001)
  carrito.html       Carrito, cupones, totales con IGV
  checkout.html      Dirección → envío → pago simulado → confirmación
  confirmacion.html  Pedido confirmado
  pedidos.html       Historial de pedidos
  favoritos.html     Lista de favoritos
  login.html / registro.html / perfil.html / privacidad.html
  js/                Lógica (data, store, auth, cart, catalog, checkout, ui)
  tests/tests.html   Pruebas unitarias (abrir en el navegador)
docs/                Entregables del curso (.docx)
index.html           Redirección a app/ (para GitHub Pages)
```

## Cómo usarla en local

Doble clic en `app/index.html`. Si prefieres un servidor local:

```bash
cd app
python -m http.server 8080
# abrir http://localhost:8080
```

## Datos de prueba

| Dato | Valor |
|---|---|
| Usuario demo | `demo@techstore.pe` / `Demo@1234` |
| Cupones | `BIENVENIDO10` (10 %), `TECH50` (S/ 50, mín. S/ 500), `CALIDAD20` (20 %, mín. S/ 1000) |
| Tarjeta de prueba | `4111 1111 1111 1111`, fecha futura (MM/AA), CVV `123` |
| Productos agotados | P004 (ASUS Vivobook), P024 (HyperX Cloud II) |
| Pocas unidades | P003 (3), P008 (2), P019 (1), P021 (3) |

En el pie de página, **Datos de prueba → Restablecer datos de demo** vuelve la tienda a su estado inicial.

## Reglas de negocio principales

- Precios en soles con **IGV (18 %) incluido**; el resumen muestra el IGV contenido en el total.
- Máximo 10 unidades por producto y nunca más que el stock disponible.
- Envío estándar S/ 15 (gratis desde S/ 300), express S/ 35, recojo en tienda gratis.
- Contraseña: mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
- Es obligatorio aceptar la Política de Privacidad para registrarse (Ley N.° 29733).
- La sesión se cierra tras **15 minutos de inactividad**. Para probarlo rápido, en la consola del navegador:
  `Store.set('session_timeout_ms', 60000)` (1 minuto). Para volver a 15 min: `Store.remove('session_timeout_ms')`.
- 5 intentos fallidos de inicio de sesión bloquean la cuenta 5 minutos.
- El checkout exige sesión iniciada; el stock se descuenta al confirmar el pedido.

## Pruebas

Abrir `app/tests/tests.html` en el navegador: ejecuta 53 pruebas unitarias sobre la lógica
(carrito, autenticación, checkout, catálogo y favoritos) con almacenamiento en memoria.

Los elementos clave de la interfaz tienen atributos `data-testid` para automatizar pruebas
(Selenium, Playwright, Cypress).

## Publicar en GitHub Pages (necesario para Maze)

1. Crea un repositorio público en GitHub, por ejemplo `techstore-calidad`.
2. Desde esta carpeta:
   ```bash
   git add .
   git commit -m "TechStore: app de carrito de compras"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/techstore-calidad.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)` → **Save**.
4. En 1–2 minutos la app estará en `https://<tu-usuario>.github.io/techstore-calidad/`
   (la raíz redirige a `app/`). Esa URL es la que se usa en Maze (*Website testing*).

> Los archivos de referencia del curso (`.pptx` y modelos `.docx` de la raíz) están en `.gitignore`
> para no publicarlos. Si quieres subirlos, quita esas líneas.
