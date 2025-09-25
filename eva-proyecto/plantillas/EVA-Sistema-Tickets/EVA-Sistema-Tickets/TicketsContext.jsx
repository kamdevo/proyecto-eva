import React, { createContext, useContext, useState } from 'react';

const TicketsContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([
    {
      id: "14820",
      origin: "HUV Biomédico",
      tipo: "biomedico",
      description: "Mantenimiento preventivo de desfibrilador en UCI, revisión de batería y calibración de parámetros",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
      creadoPor: "Dr. Carlos Mendez",
      asignadoA: "Juan Sebastián Torres",
      prioridad: "Alta",
      area: "UCI - Unidad de Cuidados Intensivos",
      equipo: "Desfibrilador Zoll R-Series"
    },
    {
      id: "14819",
      origin: "HUV Industrial",
      tipo: "industrial",
      description: "Reparación de sistema de aire acondicionado en quirófano 3, falla en compresor principal",
      date: "2024-05-08",
      time: "12:15:22",
      status: "En Proceso",
      creadoPor: "Ing. María González",
      asignadoA: "Pedro Ramírez",
      prioridad: "Crítica",
      area: "Quirófanos - Bloque Quirúrgico",
      equipo: "Sistema HVAC Carrier 30XA"
    },
    {
      id: "14818",
      origin: "HUV Biomédico",
      tipo: "biomedico",
      description: "Calibración de monitor de signos vitales, ajuste de parámetros de presión arterial",
      date: "2024-05-07",
      time: "16:45:10",
      status: "Abierto",
      creadoPor: "Enf. Ana Rodríguez",
      asignadoA: "Aura María Castillo",
      prioridad: "Media",
      area: "Urgencias - Triage",
      equipo: "Monitor Philips IntelliVue MP70"
    },
    {
      id: "14817",
      origin: "Proveedor Externo",
      tipo: "infraestructura",
      description: "Instalación de nuevo ventilador mecánico, configuración inicial y capacitación al personal",
      date: "2024-05-07",
      time: "09:20:33",
      status: "Cerrado",
      creadoPor: "Tec. Roberto Silva",
      asignadoA: "Angelica María López",
      prioridad: "Media",
      area: "Pediatría - Sala de Hospitalización",
      equipo: "Ventilador Dräger Evita V500"
    },
    {
      id: "14816",
      origin: "HUV Sistemas",
      tipo: "industrial",
      description: "Actualización de software en estación de trabajo médica, instalación de parches de seguridad",
      date: "2024-05-06",
      time: "11:30:45",
      status: "En Proceso",
      creadoPor: "Sis. Luis Herrera",
      asignadoA: "Natalia Pedrerosa",
      prioridad: "Baja",
      area: "Consulta Externa - Medicina Interna",
      equipo: "Workstation Dell Precision 3650"
    }
  ]);

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: (Math.max(...tickets.map(t => parseInt(t.id))) + 1).toString()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (updatedTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const deleteTicket = (ticketId) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const filterTickets = (searchTerm, selectedOrigin, filterField = "all") => {
    return tickets.filter(ticket => {
      let matchesSearch = true;
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        switch (filterField) {
          case "id":
            matchesSearch = ticket.id.toLowerCase().includes(searchLower);
            break;
          case "description":
            matchesSearch = ticket.description.toLowerCase().includes(searchLower);
            break;
          case "creadoPor":
            matchesSearch = ticket.creadoPor.toLowerCase().includes(searchLower);
            break;
          case "asignadoA":
            matchesSearch = ticket.asignadoA.toLowerCase().includes(searchLower);
            break;
          case "area":
            matchesSearch = ticket.area.toLowerCase().includes(searchLower);
            break;
          case "equipo":
            matchesSearch = ticket.equipo.toLowerCase().includes(searchLower);
            break;
          case "status":
            matchesSearch = ticket.status.toLowerCase().includes(searchLower);
            break;
          case "prioridad":
            matchesSearch = ticket.prioridad.toLowerCase().includes(searchLower);
            break;
          default:
            matchesSearch = 
              ticket.id.toLowerCase().includes(searchLower) ||
              ticket.description.toLowerCase().includes(searchLower) ||
              ticket.creadoPor.toLowerCase().includes(searchLower) ||
              ticket.asignadoA.toLowerCase().includes(searchLower) ||
              ticket.area.toLowerCase().includes(searchLower) ||
              ticket.equipo.toLowerCase().includes(searchLower) ||
              ticket.status.toLowerCase().includes(searchLower) ||
              ticket.prioridad.toLowerCase().includes(searchLower);
        }
      }

      const matchesOrigin = selectedOrigin === "all" || 
        (selectedOrigin === "biomedico" && ticket.tipo === "biomedico") ||
        (selectedOrigin === "industrial" && ticket.tipo === "industrial") ||
        (selectedOrigin === "infraestructura" && ticket.tipo === "infraestructura");

      return matchesSearch && matchesOrigin;
    });
  };

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  return (
    <TicketsContext.Provider value={{
      tickets,
      addTicket,
      updateTicket,
      deleteTicket,
      filterTickets,
      getTicketsByStatus
    }}>
      {children}
    </TicketsContext.Provider>
  );
};