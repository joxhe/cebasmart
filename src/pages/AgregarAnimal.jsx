import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'

export default function AgregarAnimal() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    raza: '',
    sexo: 'Macho',
    edad_meses: '',
    sistema: 'Levante',
    lote: '',
    potrero: '',
    peso_ingreso: '',
    peso_actual: '',
    vacunas_al_dia: false,
    ultimo_tratamiento: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const pesoIdeal = form.peso_ingreso ? (parseFloat(form.peso_ingreso) * 1.35).toFixed(1) : null
  const rendimiento = pesoIdeal && form.peso_actual ? ((parseFloat(form.peso_actual) / pesoIdeal) * 100).toFixed(1) : null
  const estado = rendimiento >= 90 ? 'ok' : rendimiento >= 80 ? 'warn' : rendimiento ? 'danger' : null

  const handleGuardar = async () => {
    if (!form.raza || !form.peso_ingreso || !form.peso_actual) {
      alert('Raza, peso de ingreso y peso actual son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('animales').insert({
      ...form,
      usuario_id: user.id,
      edad_meses: parseInt(form.edad_meses) || 0,
      peso_ingreso: parseFloat(form.peso_ingreso),
      peso_actual: parseFloat(form.peso_actual),
    })
    setLoading(false)
    if (error) { alert('Error al guardar'); return }
    navigate('/animales')
  }

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
          <p className="text-white font-medium">Registrar animal</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-white/60 text-sm">Cancelar</button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {/* Fila 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Raza</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: Brahma" value={form.raza} onChange={e => set('raza', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Sexo</label>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] bg-white"
              value={form.sexo} onChange={e => set('sexo', e.target.value)}>
              <option>Macho</option>
              <option>Hembra</option>
            </select>
          </div>
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Edad (meses)</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 24" type="number" value={form.edad_meses} onChange={e => set('edad_meses', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Sistema</label>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] bg-white"
              value={form.sistema} onChange={e => set('sistema', e.target.value)}>
              <option>Levante</option>
              <option>Ceba</option>
              <option>Cría</option>
            </select>
          </div>
        </div>

        {/* Fila 3 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Lote</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: Lote A" value={form.lote} onChange={e => set('lote', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Potrero</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: Potrero 3" value={form.potrero} onChange={e => set('potrero', e.target.value)} />
          </div>
        </div>

        {/* Fila 4 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Peso ingreso (kg)</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 173" type="number" value={form.peso_ingreso} onChange={e => set('peso_ingreso', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Peso actual (kg)</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 180" type="number" value={form.peso_actual} onChange={e => set('peso_actual', e.target.value)} />
          </div>
        </div>

        {/* Vacunas */}
        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
          <label className="text-sm text-gray-600">Vacunas al día</label>
          <button
            onClick={() => set('vacunas_al_dia', !form.vacunas_al_dia)}
            className={`w-11 h-6 rounded-full transition-colors ${form.vacunas_al_dia ? 'bg-[#2d6a1f]' : 'bg-gray-200'} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.vacunas_al_dia ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Último tratamiento */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Último tratamiento</label>
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
            placeholder="Ej: Desparasitación" value={form.ultimo_tratamiento} onChange={e => set('ultimo_tratamiento', e.target.value)} />
        </div>

        {/* Indicadores automáticos */}
        {pesoIdeal && (
          <div className={`rounded-xl p-3 border-l-4 ${estado === 'ok' ? 'bg-green-50 border-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'}`}>
            <p className="text-xs font-medium text-gray-500 mb-1">Indicadores automáticos</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Peso ideal: <strong>{pesoIdeal} kg</strong></p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                {estado === 'ok' ? '✓ Óptimo' : estado === 'warn' ? '⚠ Regular' : '✕ Crítico'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Rendimiento: {rendimiento}%</p>
          </div>
        )}

        <button
          onClick={handleGuardar}
          disabled={loading}
          className="bg-[#2d6a1f] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-60 mt-1">
          {loading ? 'Guardando...' : 'Guardar animal'}
        </button>
      </div>
    </div>
  )
}