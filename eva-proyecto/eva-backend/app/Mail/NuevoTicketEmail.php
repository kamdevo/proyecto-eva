<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevoTicketEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $equipo;

    /**
     * Create a new message instance.
     */
    public function __construct($ticket, $equipo)
    {
        $this->ticket = $ticket;
        $this->equipo = $equipo;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Creación de Ticket Nro ' . $this->ticket->id)
                    ->view('emails.nuevo-ticket');
    }
}
