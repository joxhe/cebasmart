import { useLocation, useNavigate } from 'react-router-dom'
import { Home, List, PlusCircle, User } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/animales', label: 'Animales', icon: List },
  { path: '/agregar', label: 'Registrar', icon: PlusCircle },
  { path: '/perfil', label: 'Perfil', icon: User },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 flex z-50">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5">
            <Icon size={20} color={active ? '#2d6a1f' : '#9ca3af'} strokeWidth={1.5} />
            <span className={`text-[10px] ${active ? 'text-[#2d6a1f] font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}