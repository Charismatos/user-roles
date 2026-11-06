<?php

namespace App\Http\Controllers\Auth\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Editor\RoleAssignmentRequest;
use App\Mails\Auth\Editor\RoleAssignmentConfirmationMail;
use App\Mails\Auth\Editor\RoleAssignmentInviteMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class RoleManagementController extends Controller
{
    /**
     * Display a listing of all users and their assigned roles.
     */
    public function assignedIndex(): View
    {
        $users = User::with('roles')->get();

        return view('auth.admin.assigned-roles-index', compact('users'));
    }

    // In RoleManagementController.php

    public function inviteView(): View
    {
        return view('auth.admin.role-invitation');
    }

    /**
     * Display role assignment details for a specific user.
     */
    public function assignedShow(User $user): View
    {
        $user->load('roles');

        return view('auth.admin.assigned-roles-show', compact('user'));
    }

    /**
     * Render the role assignment web interface where the authenticated user assigns roles to target users.
     */
    public function assignView(Request $request): View
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        // Calculate minimum level (highest authority rank) for the authenticated user making the assignment
        $minUserLevel = $currentUser->getHighestRoleLevel() ?? 99;

        // Retrieve ONLY users who:
        // 1. Were invited by the current user
        // 2. Have confirmed their invitation (invitation_confirmed_at IS NOT NULL)
        // 3. Have a lower authority rank (greater numeric level) than current user
        $users = User::with('roles')
            ->where('invited_by_id', $currentUser->id)
            ->whereNotNull('invitation_confirmed_at')
            ->get()
            ->filter(function (User $user) use ($minUserLevel) {
                $targetLevel = $user->getHighestRoleLevel() ?? 99;
                return $targetLevel > $minUserLevel;
            });

        // Retrieve roles strictly lower in authority hierarchy than the authenticated user's rank
        $assignableRoles = Role::where('level', '>', $minUserLevel)
            ->orderedByLevel()
            ->get();

        return view('auth.admin.role-assignment', compact('users', 'assignableRoles', 'minUserLevel'));
    }

    /**
     * Dispatch invitation emails to a list of target user emails/usernames.
     */
    public function sendInvitations(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'recipients' => ['required', 'string'],
        ]);

        /** @var User $currentUser */
        $currentUser = $request->user();

        // 1. Parse and sanitize input (split by commas and newlines)
        $inputs = array_unique(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $request->input('recipients')))));

        if (empty($inputs)) {
            return redirect()->back()->withErrors(['recipients' => 'No valid recipient entries were provided.']);
        }

        // 2. Fetch existing users matching entered emails/usernames
        $existingUsers = User::whereIn('email', $inputs)
            ->orWhereIn('username', $inputs)
            ->get()
            ->keyBy(fn($u) => strtolower($u->email));

        $sentCount = 0;
        $skippedMessages = [];

        $adminLevel = $currentUser->getHighestRoleLevel() ?? 99;

        foreach ($inputs as $input) {
            $inputLower = strtolower($input);

            // Check if input matches an existing user account
            $targetUser = $existingUsers->get($inputLower)
                ?? $existingUsers->firstWhere('username', $input);

            if (! $targetUser) {
                // OPTION A: If you only allow inviting existing users in your DB
                $skippedMessages[] = "'{$input}' was not found in the database system.";
                continue;

                /*
        // OPTION B: Un-comment this if you want to automatically create a pending user profile
        $targetUser = User::create([
          'name' => explode('@', $input)[0],
          'email' => $input,
          'username' => explode('@', $input)[0] . rand(100, 999),
          'password' => bcrypt(\Illuminate\Support\Str::random(16)),
          'invited_by_id' => $currentUser->id,
        ]);
        */
            }

            // Guard: Cannot invite yourself
            if ($targetUser->id === $currentUser->id) {
                $skippedMessages[] = "You cannot send a role assignment invite to yourself.";
                continue;
            }

            // Guard: Hierarchy Check (Cannot manage higher or equal authority ranks)
            $targetLevel = $targetUser->getHighestRoleLevel() ?? 99;
            if ($targetLevel <= $adminLevel && $adminLevel !== 1) {
                $skippedMessages[] = "User '{$targetUser->username}' has equal or higher authority (Level {$targetLevel}) and cannot be invited.";
                continue;
            }

            // Update user state and dispatch email
            $targetUser->update([
                'invited_by_id' => $currentUser->id,
                'invitation_confirmed_at' => null, // Reset state for fresh invitation
            ]);

            Mail::to($targetUser->email)->send(new RoleAssignmentInviteMail($targetUser, $currentUser));
            $sentCount++;
        }

        // 3. Construct response feedback
        if ($sentCount === 0) {
            return redirect()->back()
                ->withErrors($skippedMessages ?: ['No eligible recipients were found to receive invitations.'])
                ->withInput();
        }

        $successMsg = "Successfully sent invitation email(s) to {$sentCount} recipient(s).";

        if (! empty($skippedMessages)) {
            return redirect()->back()
                ->with('success', $successMsg)
                ->withErrors($skippedMessages);
        }

        return redirect()->back()->with('success', $successMsg);
    }

    /**
     * Email link landing page for recipient confirmation.
     * Handles auth verification, redirecting unauthenticated users to login before confirming.
     */
    public function confirmInvitation(Request $request, User $user): View|RedirectResponse
    {
        // 1. Verify that the URL signature is valid and hasn't expired
        if (! $request->hasValidSignature()) {
            abort(401, 'This invitation link is invalid or has expired.');
        }

        // 2. If a DIFFERENT user is currently logged in, log them out first
        if (Auth::check() && Auth::id() !== $user->id) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // 3. If the target user is NOT logged in, set intended URL and redirect to login
        if (! Auth::check()) {
            // Store full signed URL as the intended route after login
            session()->put('url.intended', $request->fullUrl());

            return redirect()
                ->route('login')
                ->with('info', "Please log in as {$user->name} to confirm your role assignment invitation.");
        }

        // 4. User is authenticated as the correct user ($user) -> Mark invitation as confirmed
        $user->update([
            'invitation_confirmed_at' => now(),
        ]);

        // 5. Render the "Confirmation Received" view
        return view('auth.admin.invitation-confirmed', compact('user'));
    }


    /**
     * Synchronize roles for a given target user and redirect to the target user's role detail view.
     */
    public function updateRoles(
        RoleAssignmentRequest $request,
        User $user
    ): JsonResponse|RedirectResponse {
        // Extract the strongly typed Data Transfer Object from the Form Request
        $dto = $request->toDTO();

        // Synchronize roles locally via the HasRoles trait
        $user->syncRoles($dto->roleIds);
        $user->load('roles');

        // Retrieve human-readable names for the newly assigned roles
        $assignedRoleNames = $user->roles->pluck('name')->toArray();

        // Dispatch confirmation email to Mailpit
        Mail::to($user->email)->send(
            new RoleAssignmentConfirmationMail($user, $assignedRoleNames)
        );

        // Return JSON response for API or AJAX requests
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User roles updated and confirmation email sent via Mailpit.',
                'data'  => $user->load('roles'),
            ]);
        }

        // Return web redirect for standard browser form submissions
        return redirect()
            ->route('users.roles.show', ['user' => $user->username])
            ->with('success', 'User roles updated and confirmation email sent via Mailpit.');
    }

    /**
     * Handle email link click: ensure target user is authenticated, otherwise invalidate existing session and redirect to login.
     */
    public function confirmShow(Request $request, User $user): View|RedirectResponse
    {
        // If someone else is logged in (e.g. administrator/assigner), log them out first so the target user can log in
        if (Auth::check() && Auth::id() !== $user->id) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // If user is not logged in at all, store target URL and redirect to login
        if (!Auth::check()) {
            session()->put('url.intended', route('users.roles.confirm', ['user' => $user->username]));

            return redirect()
                ->route('login')
                ->with('info', "Please sign in as {$user->name} to review and confirm your assigned roles.");
        }

        $user->load('roles');

        return view('auth.admin.assigned-roles-confirm', compact('user'));
    }

    /**
     * Finalize role confirmation and route user to the dashboard.
     */
    public function processConfirmation(User $user): RedirectResponse
    {
        if (Auth::id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Record timestamp or flag if tracking confirmation status in DB
        // $user->update(['roles_confirmed_at' => now()]);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Role assignments successfully acknowledged!');
    }

    /**
     * Retrieve assignable roles bounded strictly by the authenticated user's highest role level.
     */
    public function getRolesByLevel(Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $minUserLevel = $currentUser->getHighestRoleLevel() ?? 99;

        $targetLevel = max((int) $request->query('below_level', 99), $minUserLevel + 1);

        $roles = Role::where('level', '>=', $targetLevel)
            ->where('level', '>', $minUserLevel)
            ->orderedByLevel()
            ->get(['id', 'name', 'slug', 'level', 'description']);

        return response()->json($roles);
    }
}
