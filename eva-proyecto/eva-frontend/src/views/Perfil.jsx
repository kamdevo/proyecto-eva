import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { User, Mail, Phone, Building, Shield, Key, MapPin } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "../hooks/useAuth"
import httpService from "../services/httpService"

const Perfil = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [selectedSede, setSelectedSede] = useState("Todo")
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })

  useEffect(() => {
    // Cargar la sede guardada del usuario si existe
    if (user?.sede_preferida) {
      setSelectedSede(user.sede_preferida)
    }
  }, [user])

  const handleUpdatePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error("Por favor completa todos los campos de contraseña")
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

    setUpdatingPassword(true)
    try {
      await httpService.post('/v1/user/update-password', passwordData)
      
      toast.success("Contraseña actualizada exitosamente")
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
      })
    } catch (error) {
      console.error("Error actualizando contraseña:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la contraseña")
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleSedeChange = async (value) => {
    setSelectedSede(value)
    try {
      await httpService.post('/v1/user/update-sede', { sede_preferida: value })
      toast.success("Sede actualizada exitosamente")
    } catch (error) {
      console.error("Error actualizando sede:", error)
      toast.error("Error al actualizar la sede")
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Información personal y configuración de cuenta</p>
      </div>

      <div className="grid gap-6">
        {/* Información Personal - Solo Lectura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.nombre || 'N/A'}</span>
                </div>
              </div>

              {/* Apellidos */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Apellidos</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.apellido || 'N/A'}</span>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.telefono || 'N/A'}</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.email || 'N/A'}</span>
                </div>
              </div>

              {/* Username */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Username</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.username || 'N/A'}</span>
                </div>
              </div>

              {/* Rol */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Rol</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.rol?.name || user.rol || 'N/A'}</span>
                </div>
              </div>

              {/* Centro de Costo */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Centro de Costo</Label>
                <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.centro || 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña - Editable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Contraseña Actual */}
              <div>
                <Label htmlFor="current_password">Contraseña Actual</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Nueva Contraseña */}
              <div>
                <Label htmlFor="new_password">Nueva Contraseña</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <Label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña</Label>
                <Input
                  id="new_password_confirmation"
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Botón Actualizar Contraseña */}
              <div className="flex justify-end">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updatingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Actualizar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Sede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Configuración de Sede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="sede">Selección de Sede</Label>
              <Select value={selectedSede} onValueChange={handleSedeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="Sede principal">Sede Principal</SelectItem>
                  <SelectItem value="Sede norte">Sede Norte</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                Esta configuración determina qué sede se mostrará por defecto en los filtros
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Perfil
