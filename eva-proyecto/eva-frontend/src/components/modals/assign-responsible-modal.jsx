"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, UserPlus, Save, Search } from "lucide-react";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/searchable-select";

export default function AssignResponsibleModal({ isOpen, onClose, ticketId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsuarios();
    }
  }, [isOpen]);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/usuarios-asignables`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al cargar usuarios');
      }
      
      // Transformar datos para el SearchableSelect
      const usuariosOptions = result.data.map(usuario => ({
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido || ''} - ${usuario.username}`,
        email: usuario.email,
        rol: usuario.rol_nombre || 'Sin rol',
        username: usuario.username
      }));

      setUsuarios(usuariosOptions);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al cargar la lista de usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUsuario) {
      toast.error("Debe seleccionar un responsable");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/asignar-responsable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          usuario_id: selectedUsuario
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al asignar responsable');
      }

      const usuarioAsignado = usuarios.find(u => u.id === selectedUsuario);
      toast.success(`✅ Responsable asignado: ${usuarioAsignado?.nombre || 'Usuario'}`);
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al asignar el responsable");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader className="bg-purple-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Asignar Responsable</DialogTitle>
              <p className="text-sm text-purple-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="usuario" className="text-sm font-semibold text-gray-700 flex items-center">
              <Search className="w-4 h-4 mr-2 text-purple-600" />
              Seleccionar Usuario Responsable *
            </Label>
            
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SearchableSelect
                options={usuarios}
                value={selectedUsuario}
                onChange={setSelectedUsuario}
                placeholder="Buscar usuario por nombre o email..."
                emptyMessage="No se encontraron usuarios"
                className="w-full"
              />
            )}
            
            <p className="text-xs text-gray-500">
              Busque y seleccione el usuario que será responsable de este ticket
            </p>
          </div>

          {/* Usuario seleccionado */}
          {selectedUsuario && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">Usuario Seleccionado:</p>
              <div className="text-sm text-purple-800">
                <p><strong>Nombre:</strong> {usuarios.find(u => u.id === selectedUsuario)?.nombre}</p>
                <p><strong>Email:</strong> {usuarios.find(u => u.id === selectedUsuario)?.email}</p>
                <p><strong>Rol:</strong> {usuarios.find(u => u.id === selectedUsuario)?.rol}</p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El usuario asignado recibirá una notificación sobre su nueva responsabilidad en este ticket.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting || !selectedUsuario}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Asignando..." : "Asignar Responsable"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
