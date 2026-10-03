/* TechStore - Datos semilla (catálogo, cupones, envíos, reseñas).
 * Todo es estático: no hay backend. Al "restablecer datos de demo"
 * se vuelve a este estado inicial. */
var TS_DATA = (function () {
  var categories = [
    { id: 'laptops', name: 'Laptops' },
    { id: 'celulares', name: 'Celulares' },
    { id: 'tablets', name: 'Tablets' },
    { id: 'audio', name: 'Audio' },
    { id: 'accesorios', name: 'Accesorios' },
    { id: 'gaming', name: 'Gaming' }
  ];

  // price en soles (S/), IGV incluido en el total final (se calcula aparte).
  var products = [
    { id: 'P001', name: 'Laptop Lenovo IdeaPad 3 15"', brand: 'Lenovo', category: 'laptops', price: 2199.0, stock: 8,
      description: 'Laptop para estudio y oficina con pantalla Full HD de 15.6", procesador Intel Core i5 y SSD rápido.',
      specs: { Procesador: 'Intel Core i5-1235U', RAM: '8 GB', Almacenamiento: '512 GB SSD', Pantalla: '15.6" FHD', Peso: '1.65 kg' } },
    { id: 'P002', name: 'Laptop HP Pavilion 14"', brand: 'HP', category: 'laptops', price: 2899.0, stock: 5,
      description: 'Ultraportátil con carcasa de aluminio, ideal para trabajo y clases en movimiento.',
      specs: { Procesador: 'AMD Ryzen 7 5825U', RAM: '16 GB', Almacenamiento: '512 GB SSD', Pantalla: '14" FHD IPS', Peso: '1.41 kg' } },
    { id: 'P003', name: 'MacBook Air M2 13"', brand: 'Apple', category: 'laptops', price: 4999.0, stock: 3,
      description: 'Delgada, silenciosa y con batería para todo el día gracias al chip M2.',
      specs: { Procesador: 'Apple M2', RAM: '8 GB', Almacenamiento: '256 GB SSD', Pantalla: '13.6" Liquid Retina', Peso: '1.24 kg' } },
    { id: 'P004', name: 'Laptop ASUS Vivobook 16"', brand: 'ASUS', category: 'laptops', price: 2499.0, stock: 0,
      description: 'Pantalla amplia de 16" para productividad con teclado numérico.',
      specs: { Procesador: 'Intel Core i7-1255U', RAM: '16 GB', Almacenamiento: '1 TB SSD', Pantalla: '16" WUXGA', Peso: '1.88 kg' } },
    { id: 'P005', name: 'Samsung Galaxy A55 5G', brand: 'Samsung', category: 'celulares', price: 1599.0, stock: 15,
      description: 'Smartphone de gama media con pantalla Super AMOLED y cámara de 50 MP.',
      specs: { Pantalla: '6.6" Super AMOLED 120Hz', Almacenamiento: '256 GB', RAM: '8 GB', Cámara: '50 MP', Batería: '5000 mAh' } },
    { id: 'P006', name: 'iPhone 15 128 GB', brand: 'Apple', category: 'celulares', price: 3999.0, stock: 6,
      description: 'Dynamic Island, cámara de 48 MP y puerto USB-C.',
      specs: { Pantalla: '6.1" Super Retina XDR', Almacenamiento: '128 GB', Chip: 'A16 Bionic', Cámara: '48 MP', Conector: 'USB-C' } },
    { id: 'P007', name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', category: 'celulares', price: 899.0, stock: 20,
      description: 'Excelente relación calidad-precio con carga rápida de 33 W.',
      specs: { Pantalla: '6.67" AMOLED', Almacenamiento: '256 GB', RAM: '8 GB', Cámara: '108 MP', Batería: '5000 mAh' } },
    { id: 'P008', name: 'Motorola Edge 40 Neo', brand: 'Motorola', category: 'celulares', price: 1299.0, stock: 2,
      description: 'Diseño curvo, resistente al agua IP68 y pantalla pOLED de 144 Hz.',
      specs: { Pantalla: '6.55" pOLED 144Hz', Almacenamiento: '256 GB', RAM: '12 GB', Cámara: '50 MP', Resistencia: 'IP68' } },
    { id: 'P009', name: 'iPad 10.ª generación', brand: 'Apple', category: 'tablets', price: 2199.0, stock: 7,
      description: 'Tablet versátil para estudiar, dibujar y entretenerse.',
      specs: { Pantalla: '10.9" Liquid Retina', Chip: 'A14 Bionic', Almacenamiento: '64 GB', Conectividad: 'Wi-Fi 6' } },
    { id: 'P010', name: 'Samsung Galaxy Tab S9 FE', brand: 'Samsung', category: 'tablets', price: 1899.0, stock: 4,
      description: 'Incluye S Pen y resistencia IP68, ideal para tomar apuntes.',
      specs: { Pantalla: '10.9" TFT 90Hz', Almacenamiento: '128 GB', RAM: '6 GB', Lápiz: 'S Pen incluido' } },
    { id: 'P011', name: 'Lenovo Tab M10 Plus', brand: 'Lenovo', category: 'tablets', price: 749.0, stock: 12,
      description: 'Tablet económica con 4 parlantes y pantalla 2K.',
      specs: { Pantalla: '10.6" 2K', Almacenamiento: '128 GB', RAM: '4 GB', Audio: '4 parlantes Dolby Atmos' } },
    { id: 'P012', name: 'Audífonos Sony WH-1000XM5', brand: 'Sony', category: 'audio', price: 1499.0, stock: 9,
      description: 'Cancelación de ruido líder en la industria y 30 h de batería.',
      specs: { Tipo: 'Over-ear inalámbrico', Batería: '30 h', ANC: 'Sí', Conexión: 'Bluetooth 5.2' } },
    { id: 'P013', name: 'AirPods Pro (2.ª gen)', brand: 'Apple', category: 'audio', price: 1099.0, stock: 10,
      description: 'Audio espacial personalizado y cancelación activa de ruido.',
      specs: { Tipo: 'In-ear inalámbrico', Batería: '6 h (30 h con estuche)', ANC: 'Sí', Estuche: 'USB-C MagSafe' } },
    { id: 'P014', name: 'Parlante JBL Flip 6', brand: 'JBL', category: 'audio', price: 549.0, stock: 14,
      description: 'Parlante portátil resistente al agua y polvo con sonido potente.',
      specs: { Potencia: '30 W', Batería: '12 h', Resistencia: 'IP67', Conexión: 'Bluetooth 5.1' } },
    { id: 'P015', name: 'Audífonos JBL Tune 520BT', brand: 'JBL', category: 'audio', price: 199.0, stock: 25,
      description: 'Audífonos ligeros con JBL Pure Bass y 57 h de batería.',
      specs: { Tipo: 'On-ear inalámbrico', Batería: '57 h', Conexión: 'Bluetooth 5.3', Micrófono: 'Sí' } },
    { id: 'P016', name: 'Mouse Logitech MX Master 3S', brand: 'Logitech', category: 'accesorios', price: 429.0, stock: 18,
      description: 'Mouse ergonómico silencioso con scroll electromagnético.',
      specs: { DPI: '8000', Conexión: 'Bluetooth / Logi Bolt', Batería: '70 días', Botones: '7' } },
    { id: 'P017', name: 'Teclado Logitech K380', brand: 'Logitech', category: 'accesorios', price: 169.0, stock: 30,
      description: 'Teclado compacto multidispositivo para PC, tablet y celular.',
      specs: { Conexión: 'Bluetooth', Dispositivos: 'Hasta 3', Pilas: '2 x AAA', Idioma: 'Español' } },
    { id: 'P018', name: 'Cargador Anker 65W USB-C', brand: 'Anker', category: 'accesorios', price: 189.0, stock: 22,
      description: 'Cargador GaN compacto para laptop, tablet y celular.',
      specs: { Potencia: '65 W', Puertos: '2 USB-C + 1 USB-A', Tecnología: 'GaN II' } },
    { id: 'P019', name: 'Disco SSD Externo Samsung T7 1TB', brand: 'Samsung', category: 'accesorios', price: 459.0, stock: 1,
      description: 'Almacenamiento portátil ultrarrápido de hasta 1050 MB/s.',
      specs: { Capacidad: '1 TB', Velocidad: '1050 MB/s', Conexión: 'USB 3.2 Gen 2', Peso: '58 g' } },
    { id: 'P020', name: 'Webcam Logitech C920 HD', brand: 'Logitech', category: 'accesorios', price: 299.0, stock: 11,
      description: 'Videollamadas en Full HD 1080p con micrófonos estéreo.',
      specs: { Resolución: '1080p 30fps', Micrófono: 'Estéreo', Enfoque: 'Automático' } },
    { id: 'P021', name: 'PlayStation 5 Slim', brand: 'Sony', category: 'gaming', price: 2599.0, stock: 3,
      description: 'Consola de nueva generación con SSD ultrarrápido y control DualSense.',
      specs: { Almacenamiento: '1 TB SSD', Resolución: 'Hasta 4K 120fps', Lector: 'Blu-ray' } },
    { id: 'P022', name: 'Nintendo Switch OLED', brand: 'Nintendo', category: 'gaming', price: 1599.0, stock: 6,
      description: 'Juega en casa o en cualquier lugar con pantalla OLED de 7".',
      specs: { Pantalla: '7" OLED', Almacenamiento: '64 GB', Modos: 'TV / Sobremesa / Portátil' } },
    { id: 'P023', name: 'Mando Xbox Inalámbrico', brand: 'Microsoft', category: 'gaming', price: 279.0, stock: 16,
      description: 'Control compatible con Xbox, PC y dispositivos móviles.',
      specs: { Conexión: 'Bluetooth / Xbox Wireless', Pilas: '2 x AA', Puerto: 'USB-C' } },
    { id: 'P024', name: 'Audífonos Gamer HyperX Cloud II', brand: 'HyperX', category: 'gaming', price: 349.0, stock: 0,
      description: 'Sonido envolvente 7.1 virtual y micrófono con cancelación de ruido.',
      specs: { Tipo: 'Over-ear alámbrico', Sonido: '7.1 virtual', Conexión: 'USB / 3.5 mm' } }
  ];

  var reviews = [
    { productId: 'P001', user: 'Carla M.', rating: 5, comment: 'Muy buena para la universidad, rápida y ligera.', date: '2026-08-12' },
    { productId: 'P001', user: 'Jorge T.', rating: 4, comment: 'Buena laptop, la batería podría durar más.', date: '2026-08-30' },
    { productId: 'P003', user: 'Lucía R.', rating: 5, comment: 'Excelente, silenciosa y la batería dura todo el día.', date: '2026-07-04' },
    { productId: 'P005', user: 'Pedro A.', rating: 4, comment: 'Gran pantalla y buena cámara por el precio.', date: '2026-09-01' },
    { productId: 'P006', user: 'Ana G.', rating: 5, comment: 'Por fin con USB-C. Las fotos son increíbles.', date: '2026-06-20' },
    { productId: 'P007', user: 'Miguel S.', rating: 4, comment: 'Calidad-precio imbatible.', date: '2026-09-10' },
    { productId: 'P007', user: 'Rosa L.', rating: 3, comment: 'Buen equipo pero trae publicidad en el sistema.', date: '2026-09-15' },
    { productId: 'P012', user: 'Diego P.', rating: 5, comment: 'La cancelación de ruido es espectacular.', date: '2026-05-11' },
    { productId: 'P014', user: 'Valeria C.', rating: 4, comment: 'Suena fuerte, ideal para la playa.', date: '2026-02-02' },
    { productId: 'P016', user: 'Luis F.', rating: 5, comment: 'El mejor mouse que he usado para trabajar.', date: '2026-04-18' },
    { productId: 'P021', user: 'Renzo V.', rating: 5, comment: 'Los tiempos de carga son mínimos.', date: '2026-03-27' },
    { productId: 'P022', user: 'Sofía N.', rating: 4, comment: 'La pantalla OLED se ve genial.', date: '2026-01-09' }
  ];

  var coupons = {
    BIENVENIDO10: { type: 'percent', value: 10, minSubtotal: 0, description: '10% de descuento en tu compra' },
    TECH50: { type: 'fixed', value: 50, minSubtotal: 500, description: 'S/ 50 de descuento en compras desde S/ 500' },
    CALIDAD20: { type: 'percent', value: 20, minSubtotal: 1000, description: '20% de descuento en compras desde S/ 1000' }
  };

  var shippingMethods = [
    { id: 'estandar', name: 'Envío estándar', days: '3 a 5 días hábiles', cost: 15, freeFrom: 300 },
    { id: 'express', name: 'Envío express', days: '24 a 48 horas', cost: 35, freeFrom: null },
    { id: 'tienda', name: 'Recojo en tienda', days: 'Desde el día siguiente', cost: 0, freeFrom: null }
  ];

  var departments = ['Lima', 'Arequipa', 'La Libertad', 'Piura', 'Cusco', 'Lambayeque', 'Junín', 'Ica'];

  return {
    categories: categories,
    products: products,
    reviews: reviews,
    coupons: coupons,
    shippingMethods: shippingMethods,
    departments: departments,
    IGV_RATE: 0.18,
    MAX_QTY_PER_ITEM: 10,
    SESSION_TIMEOUT_MS: 15 * 60 * 1000
  };
})();
