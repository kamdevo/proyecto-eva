<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Services\ReactEmailService;

class NuevoTicketEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $equipo;

    /**
     * Create a new message instance.
     */
    public function __construct($ticket, $equipo = null)
    {
        $this->ticket = $ticket;
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
            $htmlContent = $reactEmailService->renderNuevoTicket($this->ticket);
            
            return $this->subject("Creación de Ticket Nro {$this->ticket->id}")
                        ->html($htmlContent);
                        
        } catch (\Exception $e) {
            \Log::error('Error en NuevoTicketEmail: ' . $e->getMessage());
            
            // Fallback a HTML básico si React Email falla
            return $this->subject("Creación de Ticket Nro {$this->ticket->id}")
                        ->view('emails.nuevo-ticket-fallback')
                        ->with([
                            'ticket' => $this->ticket,
                            'equipo' => $this->equipo
                        ]);
        }
    }
}
