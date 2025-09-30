<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para manejo de firmas digitales y documentos firmados
 * 
 * Funcionalidades:
 * - Almacenamiento de firmas digitales
 * - Generación de documentos firmados
 * - Gestión de órdenes de cierre con firmas
 * - Validación y seguridad de firmas
 */
class DigitalSignatureController extends Controller
{
    /**
     * Procesar firma digital temporalmente (sin guardar en BD)
     */
    public function processSignature(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'signature' => 'required|string',
                'name' => 'required|string|max:255',
                'title' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:100',
                'document_title' => 'nullable|string|max:255',
                'type' => 'required|in:draw,type',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de firma inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Procesar la firma en memoria sin guardar
            $signatureData = $request->signature;
            
            // Generar ID temporal único
            $tempId = 'temp_' . uniqid() . '_' . time();
            
            return response()->json([
                'success' => true,
                'message' => 'Firma procesada correctamente',
                'data' => [
                    'temp_id' => $tempId,
                    'signature_data' => $signatureData,
                    'name' => $request->name,
                    'title' => $request->title,
                    'position' => $request->position,
                    'document_title' => $request->document_title,
                    'type' => $request->type,
                    'timestamp' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error procesando firma digital: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al procesar la firma'
            ], 500);
        }
    }

    /**
     * Generar orden de cierre con firmas (solo procesamiento en memoria)
     */
    public function generateWorkOrderClosure(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_number' => 'required|string|max:100',
                'closure_date' => 'required|date',
                'work_type' => 'required|string|max:100',
                'status' => 'required|string|max:50',
                'equipment_name' => 'required|string|max:255',
                'equipment_code' => 'required|string|max:100',
                'location' => 'nullable|string|max:255',
                'service' => 'nullable|string|max:255',
                'work_description' => 'required|string',
                'observations' => 'nullable|string',
                'technician_signature' => 'required|array',
                'supervisor_signature' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de orden inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Procesar datos en memoria sin guardar en BD
            $orderData = [
                'order_number' => $request->order_number,
                'closure_date' => $request->closure_date,
                'work_type' => $request->work_type,
                'status' => $request->status,
                'equipment_name' => $request->equipment_name,
                'equipment_code' => $request->equipment_code,
                'location' => $request->location,
                'service' => $request->service,
                'work_description' => $request->work_description,
                'observations' => $request->observations,
                'generated_at' => now()->toISOString(),
            ];

            // Procesar firmas en memoria
            $signatures = [
                'technician' => $request->technician_signature,
                'supervisor' => $request->supervisor_signature,
            ];

            // Generar ID único temporal para la orden
            $tempOrderId = 'order_' . uniqid() . '_' . time();

            return response()->json([
                'success' => true,
                'message' => 'Orden de cierre generada correctamente',
                'data' => [
                    'temp_order_id' => $tempOrderId,
                    'order_data' => $orderData,
                    'signatures' => $signatures,
                    'pdf_ready' => true,
                    'download_url' => null, // Se genera en frontend
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error generando orden de cierre: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al generar la orden'
            ], 500);
        }
    }

    /**
     * Validar datos de orden de cierre
     */
    public function validateWorkOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_number' => 'required|string|max:100',
                'equipment_code' => 'required|string|max:100',
                'work_description' => 'required|string|min:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Datos válidos',
                'data' => [
                    'valid' => true,
                    'timestamp' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error validando orden: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }
}
