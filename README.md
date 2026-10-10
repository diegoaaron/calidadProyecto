# TechStore – Proyecto del curso de Calidad de Software

Aplicación web de **carrito de compras** (tienda de tecnología) hecha solo con HTML, CSS y JavaScript.
No tiene backend: todo corre en el navegador y los datos se guardan en `localStorage`.
Sirve como sistema controlado para los entregables del curso: historias de usuario, análisis de usabilidad,
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
  usabilidad.html    Prueba de usabilidad para participantes (alternativa propia a Maze)
  usabilidad-resultados.html  Consolidado de resultados de la prueba de usabilidad
  js/                Lógica (data, store, auth, cart, catalog, checkout, ui, usability)
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

Abrir `app/tests/tests.html` en el navegador: ejecuta 65 pruebas unitarias sobre la lógica
(carrito, autenticación, checkout, catálogo, favoritos y prueba de usabilidad) con almacenamiento en memoria.

Los elementos clave de la interfaz tienen atributos `data-testid` para automatizar pruebas
(Selenium, Playwright, Cypress).

## Prueba de usabilidad (alternativa a Maze)

Maze cobra por probar sitios web en vivo, así que la app incluye su propia prueba no moderada con la misma metodología:

1. Comparte con cada participante **https://diegoaaron.github.io/calidadProyecto/app/usabilidad.html**.
2. El participante acepta las condiciones y un panel le guía por 5 tareas (buscar, filtrar, agregar, aplicar cupón y comprar).
   El éxito se detecta automáticamente y se registran tiempo, clics, clics errados y páginas visitadas.
   Tras cada tarea califica su facilidad (SEQ, 1–7) y al final responde el cuestionario SUS.
3. El participante descarga su archivo `usabilidad-*.json` (o copia el texto) y te lo envía.
4. En `app/usabilidad-resultados.html` cargas los archivos: muestra tasa de éxito, tiempos, clics errados, SEQ y SUS
   frente a las metas del Plan de Calidad (éxito ≥ 80 %, SUS ≥ 68, mínimo 5 participantes) y exporta CSV.

No se registran datos personales: solo un alias opcional, el tamaño de pantalla y las acciones dentro de la tienda.

## Publicar en GitHub Pages

Publicada en: **https://diegoaaron.github.io/calidadProyecto/** (la raíz redirige a `app/`).
Pasos usados para publicarla:

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
   (la raíz redirige a `app/`).

> Los archivos de referencia del curso (`.pptx` y modelos `.docx` de la raíz) están en `.gitignore`
> para no publicarlos. Si quieres subirlos, quita esas líneas.
