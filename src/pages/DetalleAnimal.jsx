import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function DetalleAnimal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnimal = async () => {
      const { data } = await supabase
        .from('animales')
        .select('*')
        .eq('id', id)
        .single()
      setAnimal(data)
      setLoading(false)
    }
    fetchAnimal()
  }, [id])

  const handleEliminar = async () => {
    if (!confirm('¿Seguro que quieres eliminar este animal?')) return
    await supabase.from('animales').delete().eq('id', id)
    navigate('/animales')
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  if (!animal) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Animal no encontrado</p>
    </div>
  )

  const pesoIdeal = (animal.peso_ingreso * 1.35).toFixed(1)
  const rendimiento = ((animal.peso_actual / pesoIdeal) * 100).toFixed(1)
  const deficit = (pesoIdeal - animal.peso_actual).toFixed(1)
  const gananciaDia = animal.fecha_ingreso
    ? ((animal.peso_actual - animal.peso_ingreso) / Math.max(1, Math.floor((new Date() - new Date(animal.fecha_ingreso)) / 86400000))).toFixed(2)
    : null
  const diasEnFinca = animal.fecha_ingreso
    ? Math.floor((new Date() - new Date(animal.fecha_ingreso)) / 86400000)
    : null
  const estado = rendimiento >= 90 ? 'ok' : rendimiento >= 80 ? 'warn' : 'danger'

  const recomendacion = estado === 'ok'
    ? 'Animal en condición óptima, mantener plan alimenticio actual.'
    : estado === 'warn'
    ? 'Revisar plan alimenticio, el animal está por debajo del peso ideal.'
    : 'Mejorar alimentación urgente, déficit de peso crítico.'

  return (
    <div className="flex-1 flex flex-col pb-16">
      {/* Topbar */}
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div>
            <p className="text-white font-medium">{animal.raza}</p>
            <p className="text-white/60 text-xs">{animal.sexo} · {animal.sistema}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
          {estado === 'ok' ? '✓ Óptimo' : estado === 'warn' ? '⚠ Atención' : '✕ Crítico'}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#e6ecf5] rounded-xl p-3">
            <p className="text-base font-medium text-[#1a3a6b]">{animal.peso_actual} kg</p>
            <p className="text-xs text-gray-400 mt-0.5">Peso actual</p>
          </div>
          <div className="bg-[#e3f4fb] rounded-xl p-3">
            <p className="text-base font-medium text-[#0c5f85]">{pesoIdeal} kg</p>
            <p className="text-xs text-gray-400 mt-0.5">Peso ideal</p>
          </div>
          <div className={`rounded-xl p-3 ${estado === 'ok' ? 'bg-green-50' : estado === 'warn' ? 'bg-amber-50' : 'bg-red-50'}`}>
            <p className={`text-base font-medium ${estado === 'ok' ? 'text-[#2d6a1f]' : estado === 'warn' ? 'text-amber-700' : 'text-red-600'}`}>{rendimiento}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Rendim.</p>
          </div>
        </div>

        {/* Recomendación */}
        <div className={`rounded-xl p-3 border-l-4 ${estado === 'ok' ? 'bg-green-50 border-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'}`}>
          <p className={`text-sm font-medium ${estado === 'ok' ? 'text-[#2d6a1f]' : estado === 'warn' ? 'text-amber-700' : 'text-red-600'}`}>
            {recomendacion}
          </p>
          {estado !== 'ok' && (
            <p className={`text-xs mt-1 ${estado === 'warn' ? 'text-amber-600' : 'text-red-500'}`}>
              Déficit de {deficit} kg
            </p>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Información</p>
          <div className="flex flex-col gap-0">
            {[
              { label: 'Lote', value: animal.lote || '—' },
              { label: 'Potrero', value: animal.potrero || '—' },
              { label: 'Edad', value: animal.edad_meses ? `${animal.edad_meses} meses` : '—' },
              { label: 'Vacunas al día', value: animal.vacunas_al_dia ? 'Sí ✓' : 'No ✕', color: animal.vacunas_al_dia ? 'text-[#2d6a1f]' : 'text-red-500' },
              { label: 'Último tratamiento', value: animal.ultimo_tratamiento || '—' },
              { label: 'Ganancia/día', value: gananciaDia ? `${gananciaDia} kg` : '—' },
              { label: 'Días en finca', value: diasEnFinca !== null ? `${diasEnFinca} días` : '—' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                <p className="text-sm text-gray-400">{label}</p>
                <p className={`text-sm font-medium ${color || 'text-gray-800'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={() => navigate(`/agregar?edit=${id}`)}
            className="border border-[#1a3a6b] text-[#1a3a6b] rounded-xl py-2.5 text-sm font-medium">
            Editar animal
          </button>
          <button
            onClick={handleEliminar}
            className="border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium">
            Eliminar animal
          </button>
        </div>
      </div>
    </div>
  )
}