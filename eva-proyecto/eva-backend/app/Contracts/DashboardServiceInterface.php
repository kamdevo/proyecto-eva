<?php

namespace App\Contracts;

interface DashboardServiceInterface
{
    /**
     * Obtener estadísticas principales del dashboard
     */
    public function getMainStats(): array;

    /**
     * Obtener gráfico de mantenimientos por mes
     */
    public function getMaintenanceChart(): array;

    /**
     * Obtener equipos por servicio
     */
    public function getEquipmentByService(): array;

    /**
     * Obtener alertas del dashboard
     */
    public function getDashboardAlerts(): array;

    /**
     * Obtener resumen de actividad reciente
     */
    public function getRecentActivity(): array;

    /**
     * Limpiar cache del dashboard
     */
    public function clearCache(): void;
}
