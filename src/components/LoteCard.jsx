import { useNavigate } from 'react-router-dom'

const cfg = {
  ok:     { badge: 'bg-green-100 text-[#2d6a1f]', bar: 'bg-green-500',  label: 'Bueno',   metric: 'text-[#2d6a1f]',  metricBg: 'bg-green-50' },
  warn:   { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400',  label: 'Regular', metric: 'text-amber-700',  metricBg: 'bg-amber-50' },
  danger: { badge: 'bg-red-100 text-red-600',     bar: 'bg-red-500',    label: 'Crítico', metric: 'text-red-600',    metricBg: 'bg-red-50' },
}

export default function LoteCard({ stats }) {
  const navigate = useNavigate()
  const c = cfg[stats.estadoGeneral]
  const pct = Math.min(parseFloat(stats.rendimientoPromedio), 100)

  return (
    <button
      onClick={() => navigate(`/lote/${encodeURIComponent(stats.lote)}`)}
      className="bg-white rounded-xl border border-gray-200 p-4 text-left w-full hover:border-[#1a3a6b] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Lote {stats.lote}</p>
          <p className="text-xs text-gray-400 mt-0.5">{stats.totalAnimales} animales</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] text-gray-400">Rendimiento promedio</p>
          <p className={`text-xs font-semibold ${c.metric}`}>{stats.rendimientoPromedio}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-gray-800">${stats.inversionTotal.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Inversión total</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className={`text-xs font-semibold ${stats.vendidos > 0 ? (stats.utilidadRealizada >= 0 ? 'text-[#2d6a1f]' : 'text-red-600') : 'text-gray-400'}`}>
            {stats.vendidos > 0 ? `$${stats.utilidadRealizada.toLocaleString()}` : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Utilidad</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-gray-800">{stats.kilosGanadosTotal} kg</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Kilos ganados</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-gray-800">{stats.gananciaDiaPromedio} kg</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Gan./día prom.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2.5 border-t border-gray-100">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{stats.buenos}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{stats.atencion}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{stats.criticos}
        </span>
        <span className="ml-auto text-[10px] text-gray-400">
          {stats.enCurso} en curso · {stats.vendidos} vendidos
        </span>
      </div>
    </button>
  )
}
