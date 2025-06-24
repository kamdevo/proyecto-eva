<?php

namespace App\Contracts;

interface EquipmentServiceInterface
{
    /**
     * Obtener equipos con filtros y paginación
     */
    public function getEquipments(array $filters = [], int $perPage = 15);

    /**
     * Crear nuevo equipo
     */
    public function createEquipment(array $data);

    /**
     * Actualizar equipo
     */
    public function updateEquipment(int $id, array $data);

    /**
     * Eliminar equipo
     */
    public function deleteEquipment(int $id);

    /**
     * Obtener estadísticas de equipos
     */
    public function getEquipmentStats(): array;

    /**
     * Buscar equipos por código
     */
    public function searchByCode(string $code);

    /**
     * Duplicar equipo
     */
    public function duplicateEquipment(int $id);
}
