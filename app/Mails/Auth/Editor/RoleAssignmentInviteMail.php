<?php

namespace App\Mails\Auth\Editor;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class RoleAssignmentInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $confirmUrl;

    public function __construct(public User $user, public User $inviter)
    {
        $this->confirmUrl = URL::temporarySignedRoute(
            'users.roles.confirm-invitation',
            now()->addHours(48),
            ['user' => $user->username]
        );
    }

    public function build(): self
    {
        return $this->subject('Action Required: Confirm Role Assignment Invitation')
            ->html("
            <h2>Hello {$this->user->name},</h2>
            <p>{$this->inviter->name} wants to assign new roles to your account.</p>
            <p>Please click the button below to confirm receipt and allow the administrator to complete your role setup:</p>
            <p><a href='{$this->confirmUrl}' style='padding: 10px 18px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 4px;'>Confirm Readiness</a></p>
          ");
    }
}
