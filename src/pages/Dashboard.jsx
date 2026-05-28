import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'
import { calcularIndicadores, calcularEstadisticasLote } from '../lib/calculos'
import LoteCard from '../components/LoteCard'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: perfilData } = await supabase
        .from('perfiles').select('*').eq('id', user.id).single()
      const { data: animalesData } = await supabase
        .from('animales').select('*').eq('usuario_id', user.id)
      setPerfil(perfilData)
      setAnimales(animalesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const buenos = animales.filter(a => calcularIndicadores(a).estado === 'ok').length
  const atencion = animales.filter(a => calcularIndicadores(a).estado === 'warn').length
  const criticos = animales.filter(a => calcularIndicadores(a).estado === 'danger').length
  const alertas = animales.filter(a => calcularIndicadores(a).estado !== 'ok')
  const estadisticasLotes = calcularEstadisticasLote(animales)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col pb-16">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Hola, {perfil?.nombre?.split(' ')[0] ?? 'Ganadero'}</p>
          <p className="text-white/60 text-xs">{animales.length} animales registrados</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2a9fd6] flex items-center justify-center text-white text-xs font-medium">
          {perfil?.nombre?.charAt(0) ?? 'G'}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-5 overflow-y-auto">

        {/* Resumen de estado */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Estado del hato</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-semibold text-[#2d6a1f]">{buenos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Buen estado</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-2xl font-semibold text-amber-700">{atencion}</p>
              <p className="text-xs text-gray-500 mt-0.5">Atención</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-semibold text-red-600">{criticos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Crítico</p>
            </div>
          </div>
        </div>

        {/* Estadísticas por lote */}
        {animales.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Estadísticas por lote</p>
            {estadisticasLotes.length === 0 ? (
              <div className="bg-[#e6ecf5] rounded-xl p-4 text-center">
                <p className="text-sm text-[#1a3a6b] font-medium">Sin lotes asignados</p>
                <p className="text-xs text-gray-400 mt-1">Asigna lotes a tus animales para ver estadísticas por grupo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {estadisticasLotes.map(stats => (
                  <LoteCard key={stats.lote} stats={stats} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alertas del día */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Alertas del día</p>
          {alertas.length === 0 ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#2d6a1f] font-medium">Todo en orden 🐄</p>
              <p className="text-xs text-gray-400 mt-1">No hay alertas por el momento</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alertas.map(animal => {
                const { estado, recomendacion } = calcularIndicadores(animal)
                return (
                  <div key={animal.id} className="flex items-start gap-3 py-2 border-b border-gray-100">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${estado === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
                      {estado === 'danger' ? '🔴' : '🟡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/animal/${animal.id}`)}
                        className="text-sm font-medium text-gray-800 hover:text-[#1a3a6b] text-left w-full"
                      >
                        {animal.raza} — {recomendacion}
                      </button>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {animal.lote ? (
                          <button
                            onClick={() => navigate(`/lote/${encodeURIComponent(animal.lote)}`)}
                            className="hover:text-[#1a3a6b] hover:underline"
                          >
                            Lote {animal.lote}
                          </button>
                        ) : 'Sin lote'}
                        {animal.potrero ? ` · Potrero ${animal.potrero}` : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Estado vacío */}
        {animales.length === 0 && (
          <div className="bg-[#e6ecf5] rounded-xl p-4 text-center">
            <p className="text-sm text-[#1a3a6b] font-medium">No tienes animales aún</p>
            <p className="text-xs text-gray-400 mt-1">Empieza registrando tu primer animal</p>
          </div>
        )}

      </div>
    </div>
  )
}
