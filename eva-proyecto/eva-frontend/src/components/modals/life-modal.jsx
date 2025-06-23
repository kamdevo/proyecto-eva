"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const lifeData = [
  {
    codigo: "AUT001",
    nombre: "AUTOCLAVE TUTTNAUER",
    marca: "TUTTNAUER",
    modelo: "3870EA",
    serie: "TUT001",
    ubicacion: "CENTRAL ESTERILIZACION",
    anios_transcurridos: 1,
  },
  {
    codigo: "BAL001",
    nombre: "BALANZA ANALITICA",
    marca: "ADAM",
    modelo: "PW-254",
    serie: "ADA001",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
  {
    codigo: "BAL002",
    nombre: "BALANZA COMERCIAL",
    marca: "BOECO",
    modelo: "BPS-3000",
    serie: "BOE001",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
  {
    codigo: "CEN001",
    nombre: "CENTRIFUGA CLINICA",
    marca: "HETTICH",
    modelo: "EBA-200",
    serie: "HET001",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
  {
    codigo: "COM001",
    nombre: "COMPRESOR DE DOCTORES",
    marca: "PHILIPS",
    modelo: "HC-550",
    serie: "PHI001",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
  {
    codigo: "DEF001",
    nombre: "DESFIBRILADOR",
    marca: "PHILIPS",
    modelo: "MRx",
    serie: "PHI002",
    ubicacion: "EMERGENCIA",
    anios_transcurridos: 1,
  },
  {
    codigo: "ECG001",
    nombre: "EQUIPO ECG",
    marca: "PHILIPS",
    modelo: "TC-30",
    serie: "PHI003",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
  {
    codigo: "RAY001",
    nombre: "EQUIPO RAYOS X PORTATIL",
    marca: "GE",
    modelo: "AMX-4",
    serie: "GE001",
    ubicacion: "RADIOLOGIA",
    anios_transcurridos: 1,
  },
  {
    codigo: "BAL003",
    nombre: "EQUIPO SEGUNDO BALANZA",
    marca: "ADAM",
    modelo: "PW-124",
    serie: "ADA002",
    ubicacion: "CENTRAL DE MEZCLAS",
    anios_transcurridos: 1,
  },
  {
    codigo: "GLU001",
    nombre: "GLUCOMETRO",
    marca: "ACCU-CHEK",
    modelo: "Active",
    serie: "ACC001",
    ubicacion: "LABORATORIO",
    anios_transcurridos: 1,
  },
];

export function LifeModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            ⚖️ Equipos biomédicos obsoletos por vida util
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="bg-blue-600 text-white p-2 rounded">
            <span>Listado obsoletos por vida útil</span>
          </div>

          <div className="text-sm text-gray-600">
            Mostrando {lifeData.length} entradas
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">
                    Código
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Nombre
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Marca
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Modelo
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Serie
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Ubicación
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Años transcurridos
                  </th>
                </tr>
              </thead>
              <tbody>
                {lifeData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      {item.codigo}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.nombre}
                    </td>
                    <td className="border border-gray-300 p-2">{item.marca}</td>
                    <td className="border border-gray-300 p-2">
                      {item.modelo}
                    </td>
                    <td className="border border-gray-300 p-2">{item.serie}</td>
                    <td className="border border-gray-300 p-2">
                      {item.ubicacion}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.anios_transcurridos}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        🔍
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-600 text-white"
            >
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
