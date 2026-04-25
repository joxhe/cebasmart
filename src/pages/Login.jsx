import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }

      // Crear perfil
      await supabase.from('perfiles').insert({
        id: data.user.id,
        nombre,
        celular: '',
        ubicacion: '',
      })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Correo o contraseña incorrectos'); setLoading(false); return }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 pt-10 pb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <ellipse cx="18" cy="15" rx="11" ry="9" stroke="white" strokeWidth="2"/>
            <path d="M11 22c0 4 3.1 7 7 7s7-3 7-7" stroke="white" strokeWidth="2"/>
            <circle cx="14.5" cy="14" r="1.6" fill="white"/>
            <path d="M7 15h3M26 15h3" stroke="#2a9fd6" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[#4e9e3a] text-2xl font-semibold">Ceba</span>
          <span className="text-white text-2xl font-semibold">Smart</span>
        </div>
        <p className="text-white/50 text-sm">Monitoreo ganadero inteligente</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white px-6 py-8 flex flex-col gap-4">
        {isRegister && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Nombre completo</label>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a6b]"
              placeholder="Ej: Carlos García"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Correo electrónico</label>
          <input
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a6b]"
            placeholder="Ej: carlos@gmail.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Contraseña</label>
          <input
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a6b]"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#2d6a1f] text-white rounded-lg py-3 text-sm font-medium mt-2 disabled:opacity-60"
        >
          {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-2">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span
            className="text-[#2a9fd6] font-medium cursor-pointer"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  )
}