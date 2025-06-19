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

export default function ProfilePage() {
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
                defaultValue="ADMINISTRADOR"
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
                defaultValue="PRINCIPAL"
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
                defaultValue="3002069768"
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="JSEBASTIANGB.12@GMAIL.COM"
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                username
              </Label>
              <Input
                id="username"
                defaultValue="ADMIN"
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label
                htmlFor="rol"
                className="text-sm font-medium text-gray-700"
              >
                rol
              </Label>
              <Input
                id="rol"
                defaultValue="SUPERADMIN"
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
                defaultValue="MANTENIMIENTO BIOMEDICO"
                className="bg-gray-100 border-gray-300 h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 lg:col-span-1">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                password
              </Label>
              <div className="space-y-3">
                <Input
                  id="password"
                  type="password"
                  defaultValue="PASSWORD"
                  className="bg-gray-100 border-gray-300 h-10"
                />
                <Button
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
