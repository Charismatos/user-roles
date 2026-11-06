<?php

namespace App\Mails\Auth\Editor;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class RoleAssignmentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $confirmUrl;

    public function __construct(
        public User $user,
        public array $assignedRoleNames
    ) {
        // Generate temporary signed URL valid for 24 hours
        $this->confirmUrl = URL::temporarySignedRoute(
            'users.roles.confirm',
            now()->addHours(24),
            ['user' => $user->username]
        );
    }

    public function build(): self
    {
        return $this->subject('Role Assignment Request - Action Required')
            ->view('emails.admin.role-assignment-confirmation');
    }
}
