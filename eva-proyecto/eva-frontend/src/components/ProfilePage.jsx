import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchableSelect from "./ui/searchable-select";
import { useCentrosCosto } from "../hooks/useCentrosCosto";
import { useAuth } from "../hooks/useAuth";
import httpService from "../services/httpService";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { centros, loading: centrosLoading } = useCentrosCosto();
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })

  // Estado para visibilidad de contraseñas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirmation: false
  })

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Función para cargar el perfil del usuario actual
  const loadUserProfile = async () => {
    try {
      setLoading(true)

      const response = await httpService.get('/v1/user')

      if (response.data.success) {
        setUserProfile(response.data.data)
      } else {
        toast.error('Error al cargar el perfil')
      }
    } catch (error) {
      // Fallback: usar datos del AuthContext
      if (authUser) {
        setUserProfile({
          ...authUser,
          rol_nombre: authUser.rol?.name || authUser.rol_nombre || 'Usuario',
          centro_nombre: authUser.centro?.name || authUser.centro_nombre || 'Sin asignar'
        })
        toast.info('Usando datos locales')
      } else {
        toast.error('Error al cargar el perfil')
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para cambiar contraseña
  const handleUpdatePassword = async (e) => {
    e?.preventDefault?.()
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error("Completa todos los campos de contraseña")
      return
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("Las contraseñas nuevas no coinciden")
      return
    }

    if (passwordData.new_password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const updatePromise = async () => {
      const token = localStorage.getItem('eva_auth_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || window.APP_CONFIG?.API_BASE_URL + '/api' || 'http://192.168.2.146:8001/api'}/v1/user/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(passwordData)
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al actualizar la contraseña")
      }
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" })
      return data
    }

    toast.promise(updatePromise(), {
      loading: 'Procesando solicitud...',
      success: 'Contraseña actualizada exitosamente',
      error: (err) => err.message || 'Error al actualizar la contraseña',
    })
  }

  useEffect(() => {
    loadUserProfile()
  }, [authUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <style>{`
        .profile-card {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: all 0.3s ease;
        }
        .profile-card:hover {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .input-group-focus:focus-within label {
          color: #0284c7;
        }
      `}</style>

      {/* BEGIN: MainHeader */}
      <header className="bg-slate-800 text-white py-6 px-4 sm:px-8 mb-8 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0284c7] p-2 rounded-lg text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Información de Perfil</h1>
          </div>
          <div className="text-sm font-medium text-slate-400">
            Panel de Administración
          </div>
        </div>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: MainContent */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BEGIN: PersonalInformation */}
          <section className="lg:col-span-2 space-y-6">
            {/* Datos Personales */}
            <div className="bg-white rounded-xl profile-card overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Datos Personales</h2>
                <p className="text-sm text-gray-500">Gestione su información básica de identificación.</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selección de sede */}
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="sede">Selección de sede</Label>
                  <Select defaultValue="todo">
                    <SelectTrigger className="w-full bg-gray-50 border-gray-300 h-10">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">TODO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Nombre */}
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="nombre">Nombre</Label>
                  <Input
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm bg-gray-50 h-10"
                    id="nombre"
                    type="text"
                    value={userProfile?.nombre || 'N/A'}
                    readOnly
                  />
                </div>
                {/* Apellidos */}
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="apellidos">Apellidos</Label>
                  <Input
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm bg-gray-50 h-10"
                    id="apellidos"
                    type="text"
                    value={userProfile?.apellido || 'N/A'}
                    readOnly
                  />
                </div>
                {/* Teléfono */}
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                    </div>
                    <Input
                      className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm bg-gray-50 h-10"
                      id="telefono"
                      type="text"
                      value={userProfile?.telefono || 'N/A'}
                      readOnly
                    />
                  </div>
                </div>
                {/* Email */}
                <div className="flex flex-col gap-1.5 input-group-focus md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                    </div>
                    <Input
                      className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm bg-gray-50 h-10"
                      id="email"
                      type="email"
                      value={userProfile?.email || 'N/A'}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Cuenta */}
            <div className="bg-white rounded-xl profile-card overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Configuración de Cuenta</h2>
                <p class="text-sm text-gray-500">Roles y asignación de costos.</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="username">Username</Label>
                  <Input
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm bg-gray-50 h-10"
                    id="username"
                    type="text"
                    value={userProfile?.username || 'N/A'}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="rol">Rol</Label>
                  <Input
                    className="block w-full rounded-lg border-gray-200 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed h-10"
                    id="rol"
                    readOnly
                    value={userProfile?.rol_nombre || 'N/A'}
                  />
                </div>
                <div className="flex flex-col gap-1.5 input-group-focus">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="centro-costo">Centro de costo</Label>
                  <SearchableSelect
                    placeholder="Buscar o seleccionar centro de costo..."
                    options={centros.filter(c => c && c.id && c.nombre).map(c => ({ id: c.id, nombre: c.nombre, codigo: c.codigo || '' }))}
                    value={userProfile?.centro_id || ''}
                    onValueChange={(value) => setUserProfile(prev => ({ ...prev, centro_id: value }))}
                    loading={centrosLoading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </section>
          {/* END: PersonalInformation */}

          {/* BEGIN: SecuritySection */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl profile-card overflow-hidden sticky top-24 border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Seguridad</h2>
                <p className="text-sm text-gray-500">Actualizar contraseña de acceso.</p>
              </div>
              <form className="p-6 space-y-5" onSubmit={handleUpdatePassword}>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cambiar Contraseña</h3>

                {/* Contraseña Actual */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="current-password">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm h-10"
                      id="current-password"
                      placeholder="••••••••"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0284c7]"
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm h-10"
                      id="new-password"
                      placeholder="••••••••"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0284c7]"
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:border-[#0ea5e9] focus:ring-[#0ea5e9] sm:text-sm h-10"
                      id="confirm-password"
                      placeholder="••••••••"
                      type={showPasswords.confirmation ? "text" : "password"}
                      value={passwordData.new_password_confirmation}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0284c7]"
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmation')}
                    >
                      {showPasswords.confirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] transition-colors duration-200 h-10"
                  type="submit"
                >
                  Actualizar contraseña
                </Button>
              </form>
            </div>
          </aside>
          {/* END: SecuritySection */}
        </div>
      </main>
      {/* END: MainContent */}

      {/* BEGIN: FooterActions */}
      <footer className="max-w-5xl mx-auto px-4 mt-4 mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl profile-card border border-gray-100">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">Gestione sus datos de acceso y perfil institucional.</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all border-none">
              Cancelar
            </Button>
            <Button className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 transition-all">
              Volver al Inicio
            </Button>
          </div>
        </div>
      </footer>
      {/* END: FooterActions */}
    </div>
  );
}
