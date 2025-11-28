<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Services\ReactEmailService;

class ConfirmacionCuentaEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $usuario;
    public $token;
    public $urlConfirmacion;

    /**
     * Create a new message instance.
     */
    public function __construct($usuario, $token)
    {
        $this->usuario = $usuario;
        $this->token = $token;
        // Usar FRONTEND_URL del .env (debe estar configurado correctamente)
        $frontendUrl = env('FRONTEND_URL');
        
        if (!$frontendUrl) {
            \Log::error('FRONTEND_URL no está configurado en el archivo .env');
            throw new \Exception('FRONTEND_URL no está configurado en el archivo .env');
        }
        
        $this->urlConfirmacion = rtrim($frontendUrl, '/') . '/confirmar-cuenta/' . $token;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // Usar ReactEmailService para generar el HTML
        $reactEmailService = new ReactEmailService();
        $htmlContent = $reactEmailService->renderConfirmacionCuenta($this->usuario, $this->urlConfirmacion);
        
        return $this->subject("Confirma tu cuenta - Sistema EVA")
                    ->html($htmlContent);
    }
}
