import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Plus } from "lucide-react";

export function EditEquipmentModal({ open, onOpenChange, equipment }) {
  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Editar - Equipo biomédico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* REGISTRO DE EQUIPOS BIOMÉDICOS */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO DE EQUIPOS BIOMÉDICOS HOSPITAL UNIVERSITARIO DEL VALLE
                "EVARISTO GARCÍA"
              </CardTitle>
              <div className="text-center text-xs text-gray-600 mt-1">
                IDENTIFICACIÓN DEL EQUIPO
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Nombre del equipo:
                    </Label>
                    <Input
                      defaultValue={equipment.equipo.name}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Serie:</Label>
                    <Input
                      defaultValue={equipment.equipo.series}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">INV/Activo:</Label>
                    <Input
                      defaultValue={equipment.equipo.code}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Marca:</Label>
                    <Input
                      defaultValue={equipment.equipo.brand}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Modelo:</Label>
                    <Input
                      defaultValue={equipment.equipo.model}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">R.Invima:</Label>
                    <div className="flex gap-2 mt-1">
                      <Select defaultValue="si">
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Descripción adicional:
                    </Label>
                    <Input
                      placeholder="DESCRIPCIÓN ADICIONAL"
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Archivo excel hoja de vida:
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Button variant="outline" size="sm">
                        Seleccionar archivo
                      </Button>
                      <span className="text-sm text-gray-500">
                        NINGÚN ARC. LECCIONADO
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Antiguo:</Label>
                      <Input
                        placeholder="CÓDIGO ANTIGUO"
                        className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Nuevo:</Label>
                      <Input
                        defaultValue={equipment.equipo.code}
                        className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Ubicación:</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Servicio ★
                          </Label>
                          <Input
                            defaultValue={equipment.ubicacion.servicio}
                            className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Área ★</Label>
                          <Input
                            defaultValue={equipment.ubicacion.area}
                            className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">Sede:</Label>
                      <Select defaultValue="sede1">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sede1">SEDE HUV</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-500 mt-1">
                        Seleccione la ubicación del equipo
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">
                          Centro de costo:
                        </Label>
                        <Input
                          placeholder=""
                          className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">
                          País de origen:
                        </Label>
                        <Input
                          placeholder=""
                          className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      IMAGEN RELACIONADA DEL EQUIPO
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2 min-h-[150px] sm:min-h-[180px] flex flex-col items-center justify-center">
                      {equipment.image ? (
                        <img
                          src={equipment.image || "/placeholder.svg"}
                          alt="Equipment"
                          className="max-w-full max-h-32 object-contain mb-2"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-gray-500 mb-2">
                        Drag & drop files here
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        (or click to select file)
                      </p>
                      <Button variant="outline" size="sm">
                        SELECT FILE
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 mt-2"
                        size="sm"
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REGISTRO HISTÓRICO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO HISTÓRICO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Forma de adquisición:
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--SELECCIONE--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="donacion">Donación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Garantía:</Label>
                  <Input
                    placeholder="----------"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Activo comodato:</Label>
                  <Input
                    placeholder="CÓDIGO DE COMODATO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de adquisición:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de instalación:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha recepción almacén:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha acta de recibo:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de inicio operación:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de fabricación:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">Costo:</Label>
                  <Input
                    placeholder="COSTO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vida útil:</Label>
                  <Input
                    placeholder="VIDA ÚTIL AÑOS"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REGISTRO TÉCNICO DE INSTALACIÓN Y FUNCIONAMIENTO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO TÉCNICO DE INSTALACIÓN Y FUNCIONAMIENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Fuente de alimentación:
                  </Label>
                  <Select defaultValue="electrica">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrica">Eléctrica</SelectItem>
                      <SelectItem value="bateria">Batería</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Tecnología predominante:
                  </Label>
                  <Select defaultValue="electronica">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronica">Electrónica</SelectItem>
                      <SelectItem value="mecanica">Mecánica</SelectItem>
                      <SelectItem value="hidraulica">Hidráulica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Evaluación de desempeño:
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    ¿Se realiza calibración?
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Periodicidad:</Label>
                  <Input
                    placeholder="ANUAL"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Frecuencia de mantenimiento:
                  </Label>
                  <Select defaultValue="anual">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <Label className="text-base font-semibold">
                  Estado actual del equipo:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Funcionalidad:</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optima">Óptima</SelectItem>
                        <SelectItem value="buena">Buena</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Disponibilidad:
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="no-disponible">
                          No Disponible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Localización actual:
                    </Label>
                    <Input
                      defaultValue={equipment.ubicacion.localizacion}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* REGISTRO DE APOYO TÉCNICO */}
              <div>
                <Label className="text-base font-semibold">
                  REGISTRO DE APOYO TÉCNICO
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div>
                    <Label className="font-medium text-xs sm:text-sm">
                      Manuales:
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-manual-operacion" />
                        <Label
                          htmlFor="edit-manual-operacion"
                          className="text-xs sm:text-sm"
                        >
                          Operación
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-manual-mantenimiento" />
                        <Label
                          htmlFor="edit-manual-mantenimiento"
                          className="text-xs sm:text-sm"
                        >
                          Mantenimiento
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-manual-partes" />
                        <Label
                          htmlFor="edit-manual-partes"
                          className="text-xs sm:text-sm"
                        >
                          Partes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-manual-otros" />
                        <Label
                          htmlFor="edit-manual-otros"
                          className="text-xs sm:text-sm"
                        >
                          Otros
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-xs sm:text-sm">
                      Planos:
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-plano-electrico" />
                        <Label
                          htmlFor="edit-plano-electrico"
                          className="text-xs sm:text-sm"
                        >
                          Eléctrico
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-plano-electronico" />
                        <Label
                          htmlFor="edit-plano-electronico"
                          className="text-xs sm:text-sm"
                        >
                          Electrónico
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-plano-neumatico" />
                        <Label
                          htmlFor="edit-plano-neumatico"
                          className="text-xs sm:text-sm"
                        >
                          Neumático
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="edit-plano-mecanico" />
                        <Label
                          htmlFor="edit-plano-mecanico"
                          className="text-xs sm:text-sm"
                        >
                          Mecánico
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación biomédica:
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clase1">Clase I</SelectItem>
                        <SelectItem value="clase2a">Clase IIa</SelectItem>
                        <SelectItem value="clase2b">Clase IIb</SelectItem>
                        <SelectItem value="clase3">Clase III</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación de acuerdo al riesgo:
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bajo">Bajo</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COMPONENTES */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                COMPONENTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="border border-gray-300 rounded-lg p-4 min-h-[80px] sm:min-h-[100px] bg-white">
                <Textarea
                  placeholder="Descripción de componentes del equipo..."
                  defaultValue="Componentes principales del equipo médico..."
                  className="min-h-[100px] border-none resize-none focus:ring-0 w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEGUIMIENTO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                SEGUIMIENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <Label className="text-xs sm:text-sm">Propietario:</Label>
                  <Select defaultValue="hospital">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">
                        Hospital Universitario del Valle
                      </SelectItem>
                      <SelectItem value="tercero">Tercero</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Verificación física:
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="no-aplica">No Aplica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OBSERVACIONES */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                OBSERVACIONES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <Textarea
                placeholder="Escriba todas las observaciones que se estimen pertinentes para el seguimiento del equipo"
                defaultValue="Observaciones del equipo médico..."
                className="min-h-[60px] sm:min-h-[80px] w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between p-4 border-t">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8">
            Guardar Cambios
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
