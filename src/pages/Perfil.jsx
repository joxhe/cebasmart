import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'

export default function Perfil() {
  const { user, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ nombre: '', celular: '', ubicacion: '' })

  useEffect(() => {
    const fetchData = async () => {
      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: animalesData } = await supabase
        .from('animales')
        .select('lote, potrero')
        .eq('usuario_id', user.id)

      setPerfil(perfilData)
      setForm({
        nombre: perfilData?.nombre || '',
        celular: perfilData?.celular || '',
        ubicacion: perfilData?.ubicacion || '',
      })
      setAnimales(animalesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleGuardar = async () => {
    await supabase.from('perfiles').update(form).eq('id', user.id)
    setPerfil({ ...perfil, ...form })
    setEditando(false)
  }

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    clearUser()
    navigate('/')
  }

  const lotes = new Set(animales.map(a => a.lote).filter(Boolean)).size
  const potreros = new Set(animales.map(a => a.potrero).filter(Boolean)).size

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col pb-16">
      {/* Topbar */}
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <p className="text-white font-medium">Mi perfil</p>
        <button
          onClick={() => setEditando(!editando)}
          className="text-[#2a9fd6] text-sm font-medium">
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="bg-[#1a3a6b] px-4 pb-6 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#2a9fd6] flex items-center justify-center text-white text-2xl font-medium">
            {perfil?.nombre?.charAt(0) ?? 'G'}
          </div>
          <p className="text-white font-medium">{perfil?.nombre || 'Ganadero'}</p>
          <p className="text-white/50 text-xs">{perfil?.ubicacion || 'Sin ubicación'}</p>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 -mt-6">
            {[
              { val: animales.length, lbl: 'Animales' },
              { val: lotes, lbl: 'Lotes' },
              { val: potreros, lbl: 'Potreros' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-xl font-medium text-[#1a3a6b]">{val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>

          {/* Info / Form */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Información personal</p>
            {editando ? (
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Nombre', key: 'nombre', placeholder: 'Tu nombre' },
                  { label: 'Celular', key: 'celular', placeholder: 'Ej: 3201234567' },
                  { label: 'Ubicación', key: 'ubicacion', placeholder: 'Ej: Sincelejo, Sucre' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <button
                  onClick={handleGuardar}
                  className="bg-[#2d6a1f] text-white rounded-xl py-2.5 text-sm font-medium mt-1">
                  Guardar cambios
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {[
                  { label: 'Nombre', value: perfil?.nombre || '—' },
                  { label: 'Correo', value: user?.email || '—' },
                  { label: 'Celular', value: perfil?.celular || '—' },
                  { label: 'Ubicación', value: perfil?.ubicacion || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCerrarSesion}
            className="border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium mt-1">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}