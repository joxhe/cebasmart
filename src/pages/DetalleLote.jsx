import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'
import { calcularIndicadores } from '../lib/calculos'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const estadoCfg = {
  ok:     { badge: 'bg-green-100 text-[#2d6a1f]',  bar: 'bg-green-500',  border: 'border-[#2d6a1f]',  bg: 'bg-green-50',  text: 'text-[#2d6a1f]',  label: '🟢 Bueno'   },
  warn:   { badge: 'bg-amber-100 text-amber-700',  bar: 'bg-amber-400',  border: 'border-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  label: '🟡 Regular' },
  danger: { badge: 'bg-red-100 text-red-600',      bar: 'bg-red-500',    border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-600',    label: '🔴 Crítico' },
}

function GraficaLote({ inversion, ingresos }) {
  const data = {
    labels: ['Inversión total', 'Ingresos ventas'],
    datasets: [{
      label: 'Valor ($)',
      data: [inversion, ingresos],
      backgroundColor: ['#1a3a6b', '#4ade80'],
      borderColor: ['#142d54', '#15803d'],
      borderWidth: 1,
    }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `$${ctx.parsed.y?.toLocaleString()}` } },
    },
    scales: {
      x: { ticks: { color: '#4b5563', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#4b5563', font: { size: 11 }, callback: v => `$${v.toLocaleString()}` }, grid: { color: '#e5e7eb' } },
    },
  }
  return <div style={{ height: 220 }}><Bar data={data} options={options} /></div>
}

export default function DetalleLote() {
  const { nombre } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)

  const loteNombre = decodeURIComponent(nombre)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('animales').select('*').eq('usuario_id', user.id)
      const todos = data || []
      const filtrados = loteNombre === 'Sin lote'
        ? todos.filter(a => !a.lote)
        : todos.filter(a => a.lote === loteNombre)
      setAnimales(filtrados)
      setLoading(false)
    }
    fetchData()
  }, [loteNombre])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  const vendidosLista = animales.filter(a => a.vendido)
  const enCursoLista = animales.filter(a => !a.vendido)
  const inds = animales.map(a => calcularIndicadores(a))

  const inversionTotal = animales.reduce((s, a) => s + (a.precio_compra || 0), 0)
  const ingresoVentas = vendidosLista.reduce((s, a) => s + (a.precio_venta || 0), 0)
  const utilidadRealizada = vendidosLista.reduce((s, a) => s + ((a.precio_venta || 0) - (a.precio_compra || 0)), 0)
  const kilosGanados = animales.reduce((s, a) => {
    const pf = a.vendido ? (a.peso_venta || a.peso_actual) : a.peso_actual
    return s + (pf - a.peso_ingreso)
  }, 0)
  const rendimientoProm = inds.length
    ? (inds.reduce((s, i) => s + parseFloat(i.rendimiento), 0) / inds.length).toFixed(1)
    : '0'
  const gananciaDiaProm = inds.length
    ? (inds.reduce((s, i) => s + parseFloat(i.gananciaDia), 0) / inds.length).toFixed(3)
    : '0'
  const buenos = inds.filter(i => i.estado === 'ok').length
  const atencion = inds.filter(i => i.estado === 'warn').length
  const criticos = inds.filter(i => i.estado === 'danger').length
  const estadoGeneral = parseFloat(rendimientoProm) >= 90 ? 'ok' : parseFloat(rendimientoProm) >= 80 ? 'warn' : 'danger'
  const c = estadoCfg[estadoGeneral]
  const pct = Math.min(parseFloat(rendimientoProm), 100)

  return (
    <div className="flex-1 flex flex-col pb-16">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <p className="text-white font-medium">Lote {loteNombre}</p>
            <p className="text-white/60 text-xs">{animales.length} animales</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

        {/* Resumen económico */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Resumen económico</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#e6ecf5] rounded-xl p-3">
              <p className="text-base font-semibold text-[#1a3a6b]">${inversionTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Inversión total</p>
            </div>
            <div className={`rounded-xl p-3 ${utilidadRealizada >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-base font-semibold ${vendidosLista.length > 0 ? (utilidadRealizada >= 0 ? 'text-[#2d6a1f]' : 'text-red-600') : 'text-gray-400'}`}>
                {vendidosLista.length > 0 ? `$${utilidadRealizada.toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Utilidad realizada</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-base font-semibold text-gray-800">{kilosGanados.toFixed(1)} kg</p>
              <p className="text-xs text-gray-400 mt-0.5">Kilos ganados</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-base font-semibold text-gray-800">
                {enCursoLista.length} / {vendidosLista.length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">En curso / Vendidos</p>
            </div>
          </div>
        </div>

        {/* Indicadores productivos */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Indicadores productivos</p>
          <div className={`rounded-xl p-4 border-l-4 ${c.bg} ${c.border}`}>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs text-gray-500">Rendimiento promedio</p>
                <p className={`text-sm font-semibold ${c.text}`}>{rendimientoProm}%</p>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{gananciaDiaProm} kg</p>
                <p className="text-xs text-gray-400">Ganancia/día prom.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{buenos}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{atencion}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{criticos}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de rendimiento económico */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Detalle económico</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="grid grid-cols-2 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-600">
              <span>Concepto</span>
              <span className="text-right">Valor</span>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Inversión total', value: `$${inversionTotal.toLocaleString()}` },
                { label: 'Ingresos por ventas', value: vendidosLista.length > 0 ? `$${ingresoVentas.toLocaleString()}` : '—' },
                { label: 'Utilidad bruta', value: vendidosLista.length > 0 ? `$${utilidadRealizada.toLocaleString()}` : '—', color: utilidadRealizada >= 0 ? 'text-[#166534]' : 'text-red-600' },
                { label: 'Kilos ganados total', value: `${kilosGanados.toFixed(1)} kg`, color: 'text-[#166534]' },
                { label: 'Animales en curso', value: `${enCursoLista.length}` },
                { label: 'Animales vendidos', value: `${vendidosLista.length}` },
              ].map(({ label, value, color }) => (
                <div key={label} className="grid grid-cols-2 px-4 py-3 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={`text-right font-medium ${color || 'text-gray-800'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfica inversión vs ingresos */}
        {vendidosLista.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Inversión vs ingresos</p>
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <GraficaLote inversion={inversionTotal} ingresos={ingresoVentas} />
            </div>
          </div>
        )}

        {/* Animales del lote */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Animales en este lote</p>
          {animales.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin animales</p>
          ) : (
            <div className="flex flex-col gap-2">
              {animales.map(animal => {
                const { pesoIdeal, rendimiento, estado, alerta } = calcularIndicadores(animal)
                return (
                  <button key={animal.id} onClick={() => navigate(`/animal/${animal.id}`)}
                    className="bg-gray-50 rounded-xl p-3 text-left w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{animal.raza}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{animal.sexo} · {animal.sistema}{animal.vendido ? ' · Vendido' : ''}</p>
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
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
