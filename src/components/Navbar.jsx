import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  {
    path: '/',
    label: 'Inicio',
    icon: (active) => (
      <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
        <path d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2z" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    path: '/animales',
    label: 'Animales',
    icon: (active) => (
      <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
        <ellipse cx="8" cy="7" rx="4" ry="3.2" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3"/>
        <path d="M5 9.5c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3"/>
      </svg>
    )
  },
  {
    path: '/agregar',
    label: 'Agregar',
    icon: (active) => (
      <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
        <circle cx="8" cy="8" r="6" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3"/>
        <path d="M8 5v6M5 8h6" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: (active) => (
      <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
        <circle cx="8" cy="5.5" r="2.5" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3"/>
        <path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={active ? '#2d6a1f' : '#9ca3af'} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    )
  },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-100 flex z-50">
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            {tab.icon(active)}
            <span className={`text-[10px] ${active ? 'text-[#2d6a1f] font-medium' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}