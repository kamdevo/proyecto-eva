<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Services\ReactEmailService;

class RepuestoPendienteEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $preventivo;
    public $equipo;

    /**
     * Create a new message instance.
     */
    public function __construct($preventivo, $equipo = null)
    {
        $this->preventivo = $preventivo;
        $this->equipo = $equipo;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        try {
            // Usar ReactEmailService para generar el HTML
            $reactEmailService = new ReactEmailService();
            $htmlContent = $reactEmailService->renderRepuestoPendiente($this->preventivo);
            
            return $this->subject("Notificación de repuesto pendiente. ID preventivo: {$this->preventivo->id}")
                        ->html($htmlContent);
                        
        } catch (\Exception $e) {
            \Log::error('Error en RepuestoPendienteEmail: ' . $e->getMessage());
            
            // Fallback a HTML básico si React Email falla
            return $this->subject("Notificación de repuesto pendiente. ID preventivo: {$this->preventivo->id}")
                        ->view('emails.repuesto-pendiente-fallback')
                        ->with([
                            'preventivo' => $this->preventivo,
                            'equipo' => $this->equipo
                        ]);
        }
    }
}
