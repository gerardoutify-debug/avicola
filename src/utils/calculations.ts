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
  cantidadPollos: number;
  pesoLlegada: number;
  pesoSalida: number;
  ventaNeta: number;
}

export function generarIdVenta(): string {
  const storedVentas = localStorage.getItem('avicola_local_ventas');
  let lastNumber = 0;

  if (storedVentas) {
    try {
      const ventas = JSON.parse(storedVentas);
      const pedIds = ventas
        .map((v: any) => v.idPedido)
        .filter((id: string) => id && id.startsWith('PED-'))
        .map((id: string) => parseInt(id.replace('PED-', '')));
      if (pedIds.length > 0) lastNumber = Math.max(...pedIds);
    } catch (e) {
      console.error('Error parsing local ventas for ID generation:', e);
    }
  }

  const manualCorrelativo = parseInt(localStorage.getItem('avicola_venta_correlativo') || '0');
  lastNumber = Math.max(lastNumber, manualCorrelativo);
  const nextNumber = lastNumber + 1;
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
  const promPesoHembra = (lote.pesoMinHembra + lote.pesoMaxHembra) / 2;
  const promPesoMacho = (lote.pesoMinMacho + lote.pesoMaxMacho) / 2;

  const promPesoPolloPonderado =
    ((lote.porcentajeHembra / 100) * promPesoHembra) +
    ((lote.porcentajeMacho / 100) * promPesoMacho);

  const promPolloJabaHembra = (lote.porcentajeHembra / 100) * lote.pollosxJabaHembra;
  const promPolloJabaMacho = (lote.porcentajeMacho / 100) * lote.pollosxJabaMacho;
  const promPolloJabaPonderado = promPolloJabaHembra + promPolloJabaMacho;

  const cantidadPollosEstimada = lote.totalJabas * promPolloJabaPonderado;
  const kilosTotalesEstimados = cantidadPollosEstimada * promPesoPolloPonderado;
  const montoPagarProveedor = kilosTotalesEstimados * lote.precioKg;

  // 125 gramos de pérdida física de peso por pollo estimado
  const mermaKilos = cantidadPollosEstimada * 0.125;
  const mermaValorizada = mermaKilos * lote.precioKg;

  const valorizadoPollosMuertos = lote.pollosMuertos * promPesoPolloPonderado * lote.precioKg;
  const valorizadoPollos = montoPagarProveedor + mermaValorizada + valorizadoPollosMuertos;
  const costoTotalPolloVivoAQP = valorizadoPollos + lote.fleteTotal;

  const cantidadPollosVendibles = cantidadPollosEstimada - lote.pollosMuertos;
  const costoPolloPorUnidad = cantidadPollosVendibles > 0 ? costoTotalPolloVivoAQP / cantidadPollosVendibles : 0;

  const kilosVendiblesEstimados = cantidadPollosVendibles * promPesoPolloPonderado;
  const precioKgPuestoAQP = kilosVendiblesEstimados > 0 ? costoTotalPolloVivoAQP / kilosVendiblesEstimados : 0;

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
  rendimientoReal: number;
  margenContribucion: number;
  porcentajeRentabilidad: number;
  costoKgFinal: number;
}

export function calcularMétricasVenta(venta: Venta, _lote: Lote, metricsLote: MetricResults): VentaResults {
  const mermaTotal = Math.max(0, venta.pesoLlegada - venta.pesoSalida);
  const porcentajeMerma = venta.pesoLlegada > 0 ? (mermaTotal / venta.pesoLlegada) * 100 : 0;
  const rendimientoReal = venta.pesoLlegada > 0 ? (venta.pesoSalida / venta.pesoLlegada) * 100 : 0;

  const costoProrrateado = venta.pesoLlegada * metricsLote.precioKgPuestoAQP;
  const margenContribucion = venta.ventaNeta - costoProrrateado;
  const porcentajeRentabilidad = costoProrrateado > 0 ? (margenContribucion / costoProrrateado) * 100 : 0;
  const costoKgFinal = venta.pesoSalida > 0 ? costoProrrateado / venta.pesoSalida : 0;

  return { mermaTotal, porcentajeMerma, rendimientoReal, margenContribucion, porcentajeRentabilidad, costoKgFinal };
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
  cantidadPollos: number;
  pesoLlegada: number;
  pesoSalida: number;
  ventaNeta: number;
  mermaTotal: number;
  porcentajeMerma: string;
  rendimientoReal: string;
  margenContribucion: number;
  porcentajeRentabilidad: string;
  costoKgFinal: number;
}
