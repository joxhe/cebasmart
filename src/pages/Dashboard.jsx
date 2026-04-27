import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'
import { calcularIndicadores } from '../lib/calculos'

export default function Dashboard() {
  const { user } = useAuthStore()
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col pb-16">
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Hola, {perfil?.nombre?.split(' ')[0] ?? 'Ganadero'}</p>
          <p className="text-white/60 text-xs">{animales.length} animales registrados</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2a9fd6] flex items-center justify-center text-white text-xs font-medium">
          {perfil?.nombre?.charAt(0) ?? 'G'}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-[#2d6a1f]">{buenos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Buen estado</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-amber-700">{atencion}</p>
            <p className="text-xs text-gray-500 mt-0.5">Atención</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-red-600">{criticos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Crítico</p>
          </div>
        </div>

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
                    <div>
                      <p className="text-sm font-medium text-gray-800">{animal.raza} — {recomendacion}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Lote {animal.lote} · Potrero {animal.potrero}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {animales.length === 0 && (
          <div className="bg-[#e6ecf5] rounded-xl p-4 text-center mt-2">
            <p className="text-sm text-[#1a3a6b] font-medium">No tienes animales aún</p>
            <p className="text-xs text-gray-400 mt-1">Empieza registrando tu primer animal</p>
          </div>
        )}
      </div>
    </div>
  )
}