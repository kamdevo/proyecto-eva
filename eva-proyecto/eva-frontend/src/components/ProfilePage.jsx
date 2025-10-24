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
import { useAuth } from "../hooks/useAuth";
import httpService from "../services/httpService";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth()
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

    try {
      const token = localStorage.getItem('eva_auth_token')
      console.log('🔐 Enviando POST con token:', token ? token.substring(0, 30) + '...' : 'NO HAY TOKEN')
      
      const response = await fetch('http://192.168.2.146:8001/api/v1/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(passwordData)
      })

      console.log('📡 Respuesta:', response.status, response.statusText)
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success("Contraseña actualizada exitosamente")
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        })
      } else {
        toast.error(data.message || "Error al actualizar la contraseña")
      }
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error("Error al actualizar la contraseña")
    }
  }

  useEffect(() => {
    loadUserProfile()
  }, [authUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-16">
      {/* Header */}
      <div className="bg-slate-600 text-white px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-lg font-medium">Información de perfil</h1>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {/* Selección de sede */}
            <div className="space-y-2">
              <Label
                htmlFor="sede"
                className="text-sm font-medium text-gray-700"
              >
                Selección de sede
              </Label>{" "}
              <Select defaultValue="todo">
                <SelectTrigger className="w-full bg-gray-100 border-gray-300 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">TODO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label
                htmlFor="nombre"
                className="text-sm font-medium text-gray-700"
              >
                Nombre
              </Label>
              <Input
                id="nombre"
                value={userProfile?.nombre || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-2">
              <Label
                htmlFor="apellidos"
                className="text-sm font-medium text-gray-700"
              >
                Apellidos
              </Label>
              <Input
                id="apellidos"
                value={userProfile?.apellido || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label
                htmlFor="telefono"
                className="text-sm font-medium text-gray-700"
              >
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={userProfile?.telefono || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userProfile?.email || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                value={userProfile?.username || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label
                htmlFor="rol"
                className="text-sm font-medium text-gray-700"
              >
                Rol
              </Label>
              <Input
                id="rol"
                value={userProfile?.rol_nombre || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Centro de costo */}
            <div className="space-y-2">
              <Label
                htmlFor="centro-costo"
                className="text-sm font-medium text-gray-700"
              >
                Centro de costo
              </Label>
              <Input
                id="centro-costo"
                value={userProfile?.centro_nombre || 'N/A'}
                readOnly
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Cambiar Password */}
            <div className="space-y-2 lg:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                Cambiar Contraseña
              </Label>
              <div className="space-y-3">
                {/* Contraseña Actual */}
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Contraseña actual"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="bg-white border-gray-300 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Nueva Contraseña */}
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="bg-white border-gray-300 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="relative">
                  <Input
                    type={showPasswords.confirmation ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                    className="bg-white border-gray-300 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmation')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  onClick={handleUpdatePassword}
                  size="sm"
                  className="bg-[#367FA9] hover:bg-blue-700 text-white p-5 text-md font-medium"
                >
                  Actualizar contraseña
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
