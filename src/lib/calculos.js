export const calcularEstadisticasLote = (animales) => {
  const grupos = {}
  for (const animal of animales) {
    const lote = animal.lote || 'Sin lote'
    if (!grupos[lote]) grupos[lote] = []
    grupos[lote].push(animal)
  }

  return Object.entries(grupos).map(([lote, lista]) => {
    const vendidos = lista.filter(a => a.vendido)
    const enCurso = lista.filter(a => !a.vendido)
    const inds = lista.map(a => calcularIndicadores(a))

    const rendimientoPromedio = inds.length
      ? (inds.reduce((s, i) => s + parseFloat(i.rendimiento), 0) / inds.length).toFixed(1)
      : '0'
    const gananciaDiaPromedio = inds.length
      ? (inds.reduce((s, i) => s + parseFloat(i.gananciaDia), 0) / inds.length).toFixed(3)
      : '0'

    const inversionTotal = lista.reduce((s, a) => s + (a.precio_compra || 0), 0)
    const ingresoVentas = vendidos.reduce((s, a) => s + (a.precio_venta || 0), 0)
    const utilidadRealizada = vendidos.reduce((s, a) => s + ((a.precio_venta || 0) - (a.precio_compra || 0)), 0)
    const kilosGanadosTotal = lista.reduce((s, a) => {
      const pesoFinal = a.vendido ? (a.peso_venta || a.peso_actual) : a.peso_actual
      return s + (pesoFinal - a.peso_ingreso)
    }, 0)

    const buenos = inds.filter(i => i.estado === 'ok').length
    const atencion = inds.filter(i => i.estado === 'warn').length
    const criticos = inds.filter(i => i.estado === 'danger').length
    const estadoGeneral = parseFloat(rendimientoPromedio) >= 90 ? 'ok' : parseFloat(rendimientoPromedio) >= 80 ? 'warn' : 'danger'

    return {
      lote,
      totalAnimales: lista.length,
      vendidos: vendidos.length,
      enCurso: enCurso.length,
      buenos,
      atencion,
      criticos,
      rendimientoPromedio,
      gananciaDiaPromedio,
      inversionTotal,
      ingresoVentas,
      utilidadRealizada,
      kilosGanadosTotal: parseFloat(kilosGanadosTotal.toFixed(1)),
      estadoGeneral,
    }
  })
}

export const calcularIndicadores = (animal) => {
  const diasEnFinca = animal.fecha_ingreso
    ? Math.floor((new Date() - new Date(animal.fecha_ingreso)) / 86400000)
    : 0

  const pesoIdeal = animal.edad_meses * 9
  const diferenciaPeso = (animal.peso_actual - pesoIdeal).toFixed(1)
  const gananciaDia = diasEnFinca > 0
    ? ((animal.peso_actual - animal.peso_ingreso) / diasEnFinca).toFixed(3)
    : 0
  const gananciaMes = (gananciaDia * 30).toFixed(2)
  const rendimiento = ((animal.peso_actual / pesoIdeal) * 100).toFixed(2)

  const estado = rendimiento >= 90 ? 'ok' : rendimiento >= 80 ? 'warn' : 'danger'
  const estadoTexto = estado === 'ok' ? 'Bueno' : estado === 'warn' ? 'Regular' : 'Crítico'
  const alerta = estado === 'ok' ? '🟢 Óptimo' : estado === 'warn' ? '🟡 Atención' : '🔴 Crítico'
  const prioridad = estado === 'ok' ? 'Baja' : estado === 'warn' ? 'Media' : 'Alta'
  const recomendacion = estado === 'ok' ? 'Mantener manejo' : 'Mejorar alimentación'

  return {
    diasEnFinca,
    pesoIdeal,
    diferenciaPeso,
    gananciaDia,
    gananciaMes,
    rendimiento,
    estado,
    estadoTexto,
    alerta,
    prioridad,
    recomendacion,
  }
}