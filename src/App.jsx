import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import useAuthStore from './store/useAuthStore'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Animales from './pages/Animales'
import AgregarAnimal from './pages/AgregarAnimal'
import DetalleAnimal from './pages/DetalleAnimal'
import Perfil from './pages/Perfil'
import Navbar from './components/Navbar'

function App() {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!user) return <Login />

  return (
    <BrowserRouter>
      <div className="w-full min-h-screen flex flex-col relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animales" element={<Animales />} />
          <Route path="/agregar" element={<AgregarAnimal />} />
          <Route path="/animal/:id" element={<DetalleAnimal />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  )
}

export default App