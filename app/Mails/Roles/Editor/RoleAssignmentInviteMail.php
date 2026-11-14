<?php

namespace App\Mails\Roles\Editor;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class RoleAssignmentInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $updateConfirmedRolesUrl;

    public function __construct(
        public User $user,
        public User $inviter,
        public array $assignedRoleNames = []
    ) {
        // Generate a temporary signed route link for secure agreement confirmation
        $this->updateConfirmedRolesUrl = URL::temporarySignedRoute(
            'users.roles.confirm-agreement',
            now()->addHours(48),
            ['user' => $user->username]
        );
    }

    public function build(): self
    {
        $rolesListHtml = '';
        if (!empty($this->assignedRoleNames)) {
            foreach ($this->assignedRoleNames as $roleName) {
                $rolesListHtml .= "<li>" . htmlspecialchars($roleName, ENT_QUOTES, 'UTF-8') . "</li>";
            }
        } else {
            $rolesListHtml = "<li>No specific roles listed.</li>";
        }

        return $this->subject('Action Required: Confirm Role Assignment Invitation')
            ->html("
                <h2>Hello {$this->user->name},</h2>
                <p>{$this->inviter->name} has assigned you with the following roles:</p>
                <ul>
                    {$rolesListHtml}
                </ul>
                <p>Please click the button below to agree that you will take on the above listed responsibilities with diligence, commitment and availability.</p>
                <p><a href='{$this->updateConfirmedRolesUrl}' style='padding: 10px 18px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 4px;'>Agree To Take On The Responsibilities</a></p>
            ");
    }
}
