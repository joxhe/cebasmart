import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcularIndicadores } from '../lib/calculos'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

function GraficaPeso({ datos, pesoIdeal }) {
  const labels = datos.map(d => d.label)
  const pesos = datos.map(d => d.peso)
  const ideales = datos.map(() => pesoIdeal)

  const data = {
    labels,
    datasets: [
      {
        label: 'Peso real',
        data: pesos,
        borderColor: '#1a3a6b',
        backgroundColor: '#1a3a6b',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: '#1a3a6b',
        tension: 0.3,
      },
      {
        label: `Peso ideal (${pesoIdeal} kg)`,
        data: ideales,
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          color: '#6b7280',
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, color: '#9ca3af' },
        grid: { color: '#f3f4f6' },
      },
      y: {
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: v => `${v} kg`,
        },
        grid: { color: '#f3f4f6' },
      },
    },
  }

  return (
    <div style={{ height: 220 }}>
      <Line data={data} options={options} />
    </div>
  )
}

function GraficaPrecios({ compra, venta }) {
  const data = {
    labels: ['Compra', 'Venta'],
    datasets: [
      {
        label: 'Precio ($)',
        data: [compra || 0, venta || 0],
        backgroundColor: ['#166534', '#4ade80'],
        borderColor: ['#14532d', '#15803d'],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: ctx => `$${ctx.parsed.y?.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#4b5563', font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#4b5563',
          font: { size: 11 },
          callback: value => `$${value}`,
        },
        grid: { color: '#e5e7eb' },
      },
    },
  }

  return (
    <div style={{ height: 240 }}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default function DetalleAnimal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registros, setRegistros] = useState([])
  const [nuevoPeso, setNuevoPeso] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [venta, setVenta] = useState({
    precio_venta: animal?.precio_venta || '',
    peso_venta: animal?.peso_venta || '',
    fecha_venta: animal?.fecha_venta || '',
  })
  const [guardandoVenta, setGuardandoVenta] = useState(false)

  const fetchAnimal = async () => {
    const { data } = await supabase
      .from('animales').select('*').eq('id', id).single()
    setAnimal(data)
    setLoading(false)
  }

  const fetchRegistros = async () => {
    const { data } = await supabase
      .from('registros_peso')
      .select('*')
      .eq('animal_id', id)
      .order('fecha', { ascending: true })
    setRegistros(data || [])
  }

  const handleRegistrarVenta = async () => {
    if (!venta.precio_venta || !venta.peso_venta || !venta.fecha_venta) {
      alert('Completa todos los campos de venta')
      return
    }
    setGuardandoVenta(true)
    const { error } = await supabase.from('animales').update({
      precio_venta: parseFloat(venta.precio_venta),
      peso_venta: parseFloat(venta.peso_venta),
      fecha_venta: venta.fecha_venta,
      vendido: true
    }).eq('id', id)
    setGuardandoVenta(false)
    if (error) { alert('Error al guardar venta: ' + error.message); return }
    await fetchAnimal()
  }

  useEffect(() => {
    fetchAnimal()
    fetchRegistros()
  }, [id])

  const handleRegistrarPeso = async () => {
    if (!nuevoPeso || isNaN(parseFloat(nuevoPeso))) return
    setGuardando(true)
    const peso = parseFloat(nuevoPeso)

    await supabase.from('registros_peso').insert({
      animal_id: id,
      peso,
      fecha: new Date().toISOString(),
    })

    await supabase.from('animales')
      .update({ peso_actual: peso })
      .eq('id', id)

    setNuevoPeso('')
    await fetchAnimal()
    await fetchRegistros()
    setGuardando(false)
  }

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

  const {
    diasEnFinca, pesoIdeal, diferenciaPeso,
    gananciaDia, gananciaMes, rendimiento,
    estado, estadoTexto, alerta, prioridad, recomendacion
  } = calcularIndicadores(animal)

  const puntoInicial = {
    peso: animal.peso_ingreso,
    label: new Date(animal.fecha_ingreso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
  }

  const puntosRegistros = registros.map(r => ({
    peso: parseFloat(r.peso),
    label: new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
  }))

  const datosGrafica = [puntoInicial, ...puntosRegistros]

  return (
    <div className="flex-1 flex flex-col pb-16">
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div>
            <p className="text-white font-medium">{animal.raza}</p>
            <p className="text-white/60 text-xs">{animal.sexo} · {animal.sistema} · Lote {animal.lote}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
          {alerta}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

        {/* Stats principales */}
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
          <div className="flex justify-between items-center mb-1">
            <p className={`text-sm font-medium ${estado === 'ok' ? 'text-[#2d6a1f]' : estado === 'warn' ? 'text-amber-700' : 'text-red-600'}`}>
              {recomendacion}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado === 'ok' ? 'bg-green-100 text-[#2d6a1f]' : estado === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
              Prioridad {prioridad}
            </span>
          </div>
          <p className="text-xs text-gray-500">Estado nutricional: <strong>{estadoTexto}</strong></p>
          {parseFloat(diferenciaPeso) < 0 && (
            <p className="text-xs text-gray-500 mt-0.5">Déficit de {Math.abs(diferenciaPeso)} kg</p>
          )}
        </div>

        {/* Gráfica de trazabilidad */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Trazabilidad de peso</p>
          <div className="bg-gray-50 rounded-xl p-3">
            {datosGrafica.length < 2 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                Registra al menos un peso para ver la gráfica
              </p>
            ) : (
              <GraficaPeso datos={datosGrafica} pesoIdeal={pesoIdeal} />
            )}
          </div>
        </div>

        {/* Registrar nuevo peso */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Registrar nuevo peso</p>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: 195"
              type="number"
              value={nuevoPeso}
              onChange={e => setNuevoPeso(e.target.value)}
            />
            <button
              onClick={handleRegistrarPeso}
              disabled={guardando || !nuevoPeso}
              className="bg-[#1a3a6b] text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {guardando ? '...' : 'Guardar'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            Se registra con la fecha de hoy — {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Historial */}
        {registros.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Historial</p>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Ingreso</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(animal.fecha_ingreso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-800">{animal.peso_ingreso} kg</p>
              </div>
              {registros.map((r, i) => {
                const anterior = i === 0 ? animal.peso_ingreso : parseFloat(registros[i - 1].peso)
                const diferencia = (parseFloat(r.peso) - anterior).toFixed(1)
                const positivo = parseFloat(diferencia) >= 0
                return (
                  <div key={r.id} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Registro {i + 1}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{r.peso} kg</p>
                      <p className={`text-[10px] font-medium ${positivo ? 'text-[#2d6a1f]' : 'text-red-500'}`}>
                        {positivo ? '+' : ''}{diferencia} kg
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Indicadores productivos */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Indicadores productivos</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Ganancia / día', value: `${gananciaDia} kg` },
              { label: 'Ganancia / mes', value: `${gananciaMes} kg` },
              { label: 'Diferencia de peso', value: `${diferenciaPeso} kg` },
              { label: 'Días en finca', value: `${diasEnFinca} días` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registro de venta y tabla de rendimiento */}
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Rendimiento económico</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="grid grid-cols-2 gap-2 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-600">
              <span>Concepto</span>
              <span className="text-right">Valor</span>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-gray-800">
                <span>Precio de compra</span>
                <span className="text-right">${animal.precio_compra?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-gray-800">
                <span>Precio de venta</span>
                <span className="text-right">${animal.precio_venta?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-gray-800">
                <span>Peso de ingreso</span>
                <span className="text-right">{animal.peso_ingreso} kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-gray-800">
                <span>Peso de venta</span>
                <span className="text-right">{animal.peso_venta ?? '—'} kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-[#166534]">
                <span>Kilos ganados</span>
                <span className="text-right">{animal.peso_venta ? `${(animal.peso_venta - animal.peso_ingreso).toFixed(1)} kg` : '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-[#166534]">
                <span>Utilidad</span>
                <span className="text-right">{animal.precio_venta ? `$${(animal.precio_venta - animal.precio_compra).toLocaleString()}` : '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm text-gray-800">
                <span>Fecha venta</span>
                <span className="text-right">{animal.fecha_venta ? new Date(animal.fecha_venta).toLocaleDateString('es-CO') : '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-3 mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Precio de compra vs precio de venta</p>
            <GraficaPrecios compra={animal.precio_compra} venta={animal.precio_venta || 0} />
          </div>

          {!animal.vendido && (
            <div className="bg-yellow-50 rounded-xl p-3 mt-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Precio venta ($)</label>
                  <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
                    type="number" value={venta.precio_venta} onChange={e => setVenta(v => ({ ...v, precio_venta: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Peso venta (kg)</label>
                  <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
                    type="number" value={venta.peso_venta} onChange={e => setVenta(v => ({ ...v, peso_venta: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Fecha venta</label>
                  <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
                    type="date" value={venta.fecha_venta} onChange={e => setVenta(v => ({ ...v, fecha_venta: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleRegistrarVenta} disabled={guardandoVenta}
                className="bg-[#2d6a1f] text-white rounded-xl py-2 text-sm font-medium disabled:opacity-60">
                {guardandoVenta ? 'Guardando...' : 'Registrar venta'}
              </button>
            </div>
          )}
        </div>

        {/* Info general */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Información</p>
          <div className="flex flex-col">
            {[
              { label: 'Edad', value: `${animal.edad_meses} meses` },
              { label: 'Peso de ingreso', value: `${animal.peso_ingreso} kg` },
              { label: 'Precio de compra', value: `$${animal.precio_compra?.toLocaleString() ?? '—'}` },
              { label: 'Fecha de ingreso', value: animal.fecha_ingreso ? new Date(animal.fecha_ingreso).toLocaleDateString('es-CO') : '—' },
              { label: 'Potrero', value: animal.potrero || '—' },
              { label: 'Cambio de potrero', value: animal.cambio_potrero || '—', color: animal.cambio_potrero === 'Mejorar' ? 'text-amber-600' : animal.cambio_potrero === 'Mantener' ? 'text-[#2d6a1f]' : 'text-gray-800' },
              { label: 'Vacunas al día', value: animal.vacunas ? 'Sí ✓' : 'No ✕', color: animal.vacunas ? 'text-[#2d6a1f]' : 'text-red-500' },
              { label: 'Último tratamiento', value: animal.ultimo_tratamiento ? new Date(animal.ultimo_tratamiento).toLocaleDateString('es-CO') : '—' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <p className="text-sm text-gray-400">{label}</p>
                <p className={`text-sm font-medium ${color || 'text-gray-800'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 mt-1">
          <button onClick={() => navigate(`/agregar?edit=${id}`)}
            className="border border-[#1a3a6b] text-[#1a3a6b] rounded-xl py-2.5 text-sm font-medium">
            Editar animal
          </button>
          <button onClick={handleEliminar}
            className="border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium">
            Eliminar animal
          </button>
        </div>

      </div>
    </div>
  )
}