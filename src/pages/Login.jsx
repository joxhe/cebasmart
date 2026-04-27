import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
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
    <div className="min-h-screen bg-[#1a3a6b] flex flex-col">

{/* Logo section */}
<div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 gap-3">
  <div className="w-44 h-44 rounded-3xl bg-[#0f2347] flex items-center justify-center p-3 shadow-2xl">
    <img
      src="/logo.png"
      alt="CebaSmart"
      className="w-full h-full object-contain"
    />
  </div>
  <div className="flex items-baseline gap-0.5 mt-2">
    <span className="text-[#4e9e3a] text-2xl font-semibold">Ceba</span>
    <span className="text-white text-2xl font-semibold">Smart</span>
  </div>
  <p className="text-white/50 text-sm tracking-wide">Monitoreo ganadero inteligente</p>
</div>

      {/* Form section */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-4 shadow-2xl">
        <p className="text-xl font-semibold text-[#1a3a6b] mb-1">
          {isRegister ? 'Crear cuenta' : 'Bienvenido 👋'}
        </p>

        {isRegister && (
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1a3a6b]">
            <User size={16} color="#9ca3af" />
            <input
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              placeholder="Nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1a3a6b]">
          <Mail size={16} color="#9ca3af" />
          <input
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1a3a6b]">
          <Lock size={16} color="#9ca3af" />
          <input
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            placeholder="Contraseña"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={() => setShowPass(!showPass)}>
            {showPass
              ? <EyeOff size={16} color="#9ca3af" />
              : <Eye size={16} color="#9ca3af" />
            }
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#2d6a1f] text-white rounded-2xl py-4 text-sm font-semibold mt-1 disabled:opacity-60 shadow-lg">
          {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-gray-400">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span
            className="text-[#2a9fd6] font-semibold cursor-pointer"
            onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  )
}