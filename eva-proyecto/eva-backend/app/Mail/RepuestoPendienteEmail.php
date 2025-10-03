<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RepuestoPendienteEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $preventivo;
    public $equipo;

    /**
     * Create a new message instance.
     */
    public function __construct($preventivo, $equipo)
    {
        $this->preventivo = $preventivo;
        $this->equipo = $equipo;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Notificación de repuesto pendiente. ID preventivo: ' . $this->preventivo->id)
                    ->view('emails.repuesto-pendiente');
    }
}
