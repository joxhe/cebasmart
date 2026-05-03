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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0d2240 0%, #1a3a6b 45%, #1e4d8c 100%)' }}>

      {/* Logo section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-14 pb-8 gap-4">

        {/* Logo flotando sin cuadrado */}
        <div className="relative w-52 h-52 drop-shadow-2xl">
          <img
            src="/logo.png"
            alt="CebaSmart"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Nombre */}
        <div className="flex items-baseline gap-1 -mt-2">
          <span className="text-[#4ec93a] text-3xl font-bold tracking-tight">Ceba</span>
          <span className="text-white text-3xl font-bold tracking-tight">Smart</span>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-white/20" />
          <p className="text-white/50 text-xs tracking-widest uppercase">Monitoreo ganadero inteligente</p>
          <div className="h-px w-8 bg-white/20" />
        </div>
      </div>

      {/* Form section */}
      <div
        className="px-6 pt-8 pb-12 flex flex-col gap-4 shadow-2xl"
        style={{ background: 'white', borderRadius: '32px 32px 0 0' }}
      >
        {/* Header del form */}
        <div className="mb-1">
          <p className="text-xl font-bold text-[#1a3a6b]">
            {isRegister ? 'Crear cuenta' : 'Bienvenido 👋'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isRegister ? 'Regístrate para empezar' : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {isRegister && (
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-[#1a3a6b] transition-colors">
            <User size={16} color="#9ca3af" />
            <input
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              placeholder="Nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-[#1a3a6b] transition-colors">
          <Mail size={16} color="#9ca3af" />
          <input
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-[#1a3a6b] transition-colors">
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
          className="text-white rounded-2xl py-4 text-sm font-bold mt-1 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2d6a1f 0%, #3d8a28 100%)' }}
        >
          {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-gray-400">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span
            className="text-[#1a3a6b] font-bold cursor-pointer"
            onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  )
}