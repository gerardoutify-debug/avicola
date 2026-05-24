export interface Lote {
  fechaIngreso: string;
  nroFactura: string;
  placaCamion: string;
  precioKg: number;
  totalJabas: number;
  fleteTotal: number;
  pollosMuertos: number;
  // Hembras
  porcentajeHembra: number;
  pesoMinHembra: number;
  pesoMaxHembra: number;
  pollosxJabaHembra: number;
  // Machos
  porcentajeMacho: number;
  pesoMinMacho: number;
  pesoMaxMacho: number;
  pollosxJabaMacho: number;
  // Metadata opcional
  proveedor?: string;
  origen?: string;
}

export interface Venta {
  idPedido?: string;
  fecha: string;
  cliente: string;
  tipoVenta: 'Entero' | 'Carcasa';
  loteCodigo: string;
  
  // Datos de llegada/venta
  pesoLlegada: number;
  muertos: number;
  ventaNeta: number;

  // Rendimiento de Carcasa
  pesoCarcasa: number;
  pesoCabezas: number;
  pesoHigados: number;
  pesoRinones: number;
  pesoOtras: number;
}

// Función para generar ID de venta automático
export function generarIdVenta(): string {
  // 1. Intentar obtener el último ID de las ventas guardadas en localStorage
  const storedVentas = localStorage.getItem('avicola_local_ventas');
  let lastNumber = 0;

  if (storedVentas) {
    try {
      const ventas = JSON.parse(storedVentas);
      const pedIds = ventas
        .map((v: any) => v.idPedido)
        .filter((id: string) => id && id.startsWith('PED-'))
        .map((id: string) => parseInt(id.replace('PED-', '')));
      
      if (pedIds.length > 0) {
        lastNumber = Math.max(...pedIds);
      }
    } catch (e) {
      console.error('Error parsing local ventas for ID generation:', e);
    }
  }

  // 2. Si no hay ventas, revisar el correlativo manual
  const manualCorrelativo = parseInt(localStorage.getItem('avicola_venta_correlativo') || '0');
  lastNumber = Math.max(lastNumber, manualCorrelativo);

  // 3. El nuevo ID es el siguiente
  const nextNumber = lastNumber + 1;
  
  // 4. Actualizar el correlativo manual para la próxima vez
  localStorage.setItem('avicola_venta_correlativo', nextNumber.toString());
  
  return `PED-${nextNumber.toString().padStart(3, '0')}`;
}

export interface MetricResults {
  codigoLote: string;
  promPesoHembra: number;
  promPesoMacho: number;
  promPesoPolloPonderado: number;
  promPolloJabaPonderado: number;
  cantidadPollosEstimada: number;
  kilosTotalesEstimados: number;
  montoPagarProveedor: number;
  mermaKilos: number;
  mermaValorizada: number;
  valorizadoPollosMuertos: number;
  valorizadoPollos: number;
  costoTotalPolloVivoAQP: number;
  cantidadPollosVendibles: number;
  costoPolloPorUnidad: number;
  precioKgPuestoAQP: number;
}

export function calcularMétricasLote(lote: Lote): MetricResults {
  // 1. Promedios de peso individuales
  const promPesoHembra = (lote.pesoMinHembra + lote.pesoMaxHembra) / 2;
  const promPesoMacho = (lote.pesoMinMacho + lote.pesoMaxMacho) / 2;

  // 2. Promedio peso/pollo ponderado según % de sexo
  const promPesoPolloPonderado =
    ((lote.porcentajeHembra / 100) * promPesoHembra) +
    ((lote.porcentajeMacho / 100) * promPesoMacho);

  // 3. Promedio pollos por jaba ponderado
  const promPolloJabaHembra = (lote.porcentajeHembra / 100) * lote.pollosxJabaHembra;
  const promPolloJabaMacho = (lote.porcentajeMacho / 100) * lote.pollosxJabaMacho;
  const promPolloJabaPonderado = promPolloJabaHembra + promPolloJabaMacho;

  // 4. Totales de Compra y Volúmenes
  const cantidadPollosEstimada = lote.totalJabas * promPolloJabaPonderado;
  const kilosTotalesEstimados = cantidadPollosEstimada * promPesoPolloPonderado;
  const montoPagarProveedor = kilosTotalesEstimados * lote.precioKg;

  // 5. Mermas (125 gramos de pérdida física de peso por pollo estimado)
  const mermaKilos = cantidadPollosEstimada * 0.125;
  const mermaValorizada = mermaKilos * lote.precioKg;

  // 6. Valorización de pollos muertos
  const valorizadoPollosMuertos = lote.pollosMuertos * promPesoPolloPonderado * lote.precioKg;

  // 7. Costos Totales de Ingreso (Alineado con las fórmulas reales de la hoja de cálculo)
  const valorizadoPollos = montoPagarProveedor + mermaValorizada + valorizadoPollosMuertos;
  const costoTotalPolloVivoAQP = valorizadoPollos + lote.fleteTotal;

  // 8. Saldo Vendible
  const cantidadPollosVendibles = cantidadPollosEstimada - lote.pollosMuertos;

  // 9. Costos Unitarios Puestos en Destino (AQP)
  const costoPolloPorUnidad = cantidadPollosVendibles > 0 ? costoTotalPolloVivoAQP / cantidadPollosVendibles : 0;
  
  // Costo por kg en AQP (Costo de pollos vendibles / peso total de pollos vendibles)
  const kilosVendiblesEstimados = cantidadPollosVendibles * promPesoPolloPonderado;
  const precioKgPuestoAQP = kilosVendiblesEstimados > 0 ? costoTotalPolloVivoAQP / kilosVendiblesEstimados : 0;

  // Código único de lote
  const codigoLote = `REC-${lote.nroFactura.toUpperCase().trim()}-${lote.placaCamion.toUpperCase().trim()}`;

  return {
    codigoLote,
    promPesoHembra,
    promPesoMacho,
    promPesoPolloPonderado,
    promPolloJabaPonderado,
    cantidadPollosEstimada,
    kilosTotalesEstimados,
    montoPagarProveedor,
    mermaKilos,
    mermaValorizada,
    valorizadoPollosMuertos,
    valorizadoPollos,
    costoTotalPolloVivoAQP,
    cantidadPollosVendibles,
    costoPolloPorUnidad,
    precioKgPuestoAQP
  };
}

export interface VentaResults {
  mermaTotal: number;
  porcentajeMerma: number;
  totalMenudencia: number;
  margenContribucion: number;
  porcentajeRentabilidad: number;
  costoKgFinal: number;
  rendimientoCarcasa: number;
}

export function calcularMétricasVenta(venta: Venta, _lote: Lote, metricsLote: MetricResults): VentaResults {
  // Si tenemos el lote y sus kilos estimados, podemos calcular el prorrateo de peso
  // Peso Origen Estimado para esta venta
  const totalPollosLote = metricsLote.cantidadPollosEstimada;
  // Prorrateo de peso origen: (peso total origen / total pollos) * pollos vendidos
  // Pero si el usuario ingresó pesoLlegada, la merma física del viaje es:
  // Merma viaje = (Kilos Origen Prorrateados) - Peso Llegada
  const kilosOrigenProrrateados = totalPollosLote > 0 
    ? (metricsLote.kilosTotalesEstimados / totalPollosLote) * (venta.pesoCarcasa > 0 ? (venta.pesoCarcasa / 0.7) : 1) // estimador
    : 0;

  // En la base de datos la merma total se calcula típicamente como la merma física o porcentual.
  // Vamos a alinearla con: Merma Total (Kilos origen del lote prorrateados - Kilos llegada)
  // Si no se especifica, calculamos Merma de peso en viaje:
  const mermaTotal = Math.max(0, kilosOrigenProrrateados - venta.pesoLlegada);
  const porcentajeMerma = kilosOrigenProrrateados > 0 ? (mermaTotal / kilosOrigenProrrateados) * 100 : 0;

  // Menudencia = Cabezas + Hígados + Riñones + Otras
  const totalMenudencia = venta.pesoCabezas + venta.pesoHigados + venta.pesoRinones + venta.pesoOtras;

  // Rendimiento de carcasa = (Peso Carcasa / Peso Llegada) * 100
  const rendimientoCarcasa = venta.pesoLlegada > 0 ? (venta.pesoCarcasa / venta.pesoLlegada) * 100 : 0;

  // Prorrateamos el costo de esta venta del costo total del lote
  // Costo total de esta venta = Costo de compra puesto en AQP de las unidades vendidas
  // En base al Costo/Kg puesto en AQP
  const costoTotalProrrateado = venta.pesoLlegada * metricsLote.precioKgPuestoAQP;

  // Margen de contribución = Venta Neta - Costo Total Prorrateado
  const margenContribucion = venta.ventaNeta - costoTotalProrrateado;

  // % Rentabilidad = (Margen / Costo Total Prorrateado) * 100
  const porcentajeRentabilidad = costoTotalProrrateado > 0 ? (margenContribucion / costoTotalProrrateado) * 100 : 0;

  // Costo por KG Final = Costo Total Prorrateado / Peso Carcasa (si es carcasa) o Peso Llegada (si es entero)
  const costoKgFinal = venta.tipoVenta === 'Carcasa' 
    ? (venta.pesoCarcasa > 0 ? costoTotalProrrateado / venta.pesoCarcasa : 0)
    : (venta.pesoLlegada > 0 ? costoTotalProrrateado / venta.pesoLlegada : 0);

  return {
    mermaTotal,
    porcentajeMerma,
    totalMenudencia,
    margenContribucion,
    porcentajeRentabilidad,
    costoKgFinal,
    rendimientoCarcasa
  };
}

export interface VentaRow {
  idPedido: string;
  fecha: string;
  proveedor: string;
  origen: string;
  loteCodigo: string;
  tipoPollo: string;
  sexo: string;
  costoTotal: number;
  pesoOrigen: number;
  tipoVenta: string;
  cliente: string;
  pesoLlegada: number;
  muertos: number;
  ventaNeta: number;
  pesoCarcasa: number;
  pesoCabezas: number;
  pesoHigados: number;
  pesoRinones: number;
  pesoOtras: number;
  mermaTotal: number;
  porcentajeMerma: string;
  totalMenudencia: number;
  margenContribucion: number;
  porcentajeRentabilidad: string;
  costoKgFinal: number;
  rendimientoCarcasa: string;
}
