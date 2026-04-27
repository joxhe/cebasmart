import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'
import { calcularIndicadores } from '../lib/calculos'

export default function Animales() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    const fetchAnimales = async () => {
      const { data } = await supabase
        .from('animales')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
      setAnimales(data || [])
      setLoading(false)
    }
    fetchAnimales()
  }, [])

  const lotes = ['Todos', ...new Set(animales.map(a => a.lote).filter(Boolean))]
  const filtrados = filtro === 'Todos'
    ? animales
    : filtro === 'Alertas'
    ? animales.filter(a => calcularIndicadores(a).estado !== 'ok')
    : animales.filter(a => a.lote === filtro)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col pb-16">
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <p className="text-white font-medium">Mis animales</p>
        <button onClick={() => navigate('/agregar')} className="text-[#2a9fd6] text-sm font-medium">+ Agregar</button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...lotes, 'Alertas'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${filtro === f ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-500 border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-gray-400 text-sm">No hay animales aquí</p>
            <button onClick={() => navigate('/agregar')} className="text-[#2a9fd6] text-sm font-medium">+ Registrar animal</button>
          </div>
        ) : (
          filtrados.map(animal => {
            const { pesoIdeal, rendimiento, estado, alerta } = calcularIndicadores(animal)
            return (
              <button key={animal.id} onClick={() => navigate(`/animal/${animal.id}`)}
                className="bg-gray-50 rounded-xl p-3 text-left w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{animal.raza}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{animal.sexo} · {animal.sistema} {animal.lote ? `· Lote ${animal.lote}` : ''}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                    {alerta}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-800">{animal.peso_actual} kg</p>
                    <p className="text-[10px] text-gray-400">Actual</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-800">{pesoIdeal} kg</p>
                    <p className="text-[10px] text-gray-400">Ideal</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className={`text-xs font-medium ${estado === 'ok' ? 'text-[#2d6a1f]' : estado === 'warn' ? 'text-amber-700' : 'text-red-600'}`}>{rendimiento}%</p>
                    <p className="text-[10px] text-gray-400">Rendim.</p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}