import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'
import { calcularIndicadores } from '../lib/calculos'

export default function AgregarAnimal() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    raza: '',
    sexo: 'Macho',
    sistema: 'Levante',
    lote: '',
    potrero: '',
    cambio_potrero: 'Revisar',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    peso_ingreso: '',
    peso_actual: '',
    edad_meses: '',
    vacunas: false,
    ultimo_tratamiento: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const indicadores = form.peso_actual && form.edad_meses
    ? calcularIndicadores({ ...form, peso_ingreso: parseFloat(form.peso_ingreso), peso_actual: parseFloat(form.peso_actual), edad_meses: parseInt(form.edad_meses) })
    : null

  const handleGuardar = async () => {
    if (!form.raza || !form.peso_ingreso || !form.peso_actual || !form.edad_meses) {
      alert('Raza, edad, peso de ingreso y peso actual son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('animales').insert({
      usuario_id: user.id,
      raza: form.raza,
      sexo: form.sexo,
      sistema: form.sistema,
      lote: form.lote,
      potrero: form.potrero,
      cambio_potrero: form.cambio_potrero,
      fecha_ingreso: form.fecha_ingreso,
      peso_ingreso: parseFloat(form.peso_ingreso),
      peso_actual: parseFloat(form.peso_actual),
      edad_meses: parseInt(form.edad_meses),
      vacunas: form.vacunas,
      ultimo_tratamiento: form.ultimo_tratamiento || null,
    })
    setLoading(false)
    if (error) { alert('Error al guardar: ' + error.message); return }
    navigate('/animales')
  }

  return (
    <div className="flex-1 flex flex-col pb-16">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Sistema</label>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] bg-white"
              value={form.sistema} onChange={e => set('sistema', e.target.value)}>
              <option>Levante</option>
              <option>Ceba</option>
              <option>Cría</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Edad (meses)</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 24" type="number" value={form.edad_meses} onChange={e => set('edad_meses', e.target.value)} />
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Lote</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: A" value={form.lote} onChange={e => set('lote', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Potrero</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 1 (Pasto bueno)" value={form.potrero} onChange={e => set('potrero', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Cambio de potrero</label>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] bg-white"
              value={form.cambio_potrero} onChange={e => set('cambio_potrero', e.target.value)}>
              <option>Mantener</option>
              <option>Revisar</option>
              <option>Mejorar</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Fecha de ingreso</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
              type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
          <label className="text-sm text-gray-600">Vacunas al día</label>
          <button onClick={() => set('vacunas', !form.vacunas)}
            className={`w-11 h-6 rounded-full transition-colors ${form.vacunas ? 'bg-[#2d6a1f]' : 'bg-gray-200'} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.vacunas ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Último tratamiento (fecha)</label>
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
            type="date" value={form.ultimo_tratamiento} onChange={e => set('ultimo_tratamiento', e.target.value)} />
        </div>

        {indicadores && (
          <div className={`rounded-xl p-3 border-l-4 ${indicadores.estado === 'ok' ? 'bg-green-50 border-[#2d6a1f]' : indicadores.estado === 'warn' ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'}`}>
            <p className="text-xs font-medium text-gray-500 mb-2">Indicadores automáticos</p>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-700">Peso ideal: <strong>{indicadores.pesoIdeal} kg</strong></p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${indicadores.estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : indicadores.estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                {indicadores.alerta}
              </span>
            </div>
            <p className="text-xs text-gray-500">Rendimiento: {indicadores.rendimiento}%</p>
            <p className="text-xs text-gray-500">Prioridad: {indicadores.prioridad}</p>
            <p className="text-xs text-gray-500">Recomendación: {indicadores.recomendacion}</p>
          </div>
        )}

        <button onClick={handleGuardar} disabled={loading}
          className="bg-[#2d6a1f] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-60 mt-1">
          {loading ? 'Guardando...' : 'Guardar animal'}
        </button>
      </div>
    </div>
  )
}