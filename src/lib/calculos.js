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