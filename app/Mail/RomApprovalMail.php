<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RomApprovalMail extends Mailable
{
    use Queueable, SerializesModels;
    public $data_mail, $link;

    /**
     * Create a new message instance.
     */
    public function __construct($data_mail, $link)
    {
        $this->data_mail  = $data_mail;
        $this->link = $link;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: 'no-reply@aoth.in.th',
            subject: ('แจ้งเตือน: มีรายการรอการอนุมัติ (' . $this->data_mail->RHREC_ID . ')'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rom_approval',
            with: [
                'data_mail' => $this->data_mail,
                'link' => $this->link,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
