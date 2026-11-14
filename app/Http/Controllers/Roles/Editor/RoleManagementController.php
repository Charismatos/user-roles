<?php

namespace App\Http\Controllers\Roles\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\Editor\RolesAssignRequest;
use App\Http\Requests\Roles\Editor\RolesAssignedUpdateRequest;
use App\Mails\Roles\Editor\RoleAssignmentInviteMail;
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

        return view('Roles.Admin.roles-assigned-index', compact('users'));
    }

    /**
     * Display role assignment details for a specific user.
     */
    public function assignedShow(User $user): View
    {
        $user->load('roles');

        return view('Roles.Editor.roles-assigned-show', compact('user'));
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

        // Retrieve roles strictly lower in authority hierarchy than the authenticated user's rank
        $assignableRoles = Role::where('level', '>', $minUserLevel)
            ->orderedByLevel()
            ->get();

        return view('Roles.Editor.roles-assign', compact('assignableRoles', 'minUserLevel'));
    }

    /**
     * Render the role modification interface for a specific target user.
     */
    public function editRolesAssigned(Request $request, User $user): View
    {
        $currentUser = $request->user();
        $assignerLevel = $currentUser->getHighestRoleLevel() ?? 99;

        // Initial target level defaults to target user's rank, or assigner level + 1 as safety fallback
        $targetUserLevel = $user->getHighestRoleLevel() ?? ($assignerLevel + 1);

        // Fetch initial assignable roles matching or exceeding the initial target level threshold
        $assignableRoles = Role::where('level', '>=', $targetUserLevel)
            ->orderedByLevel()
            ->get(['id', 'name', 'slug', 'level', 'description']);

        $user->load('roles');

        return view('Roles.Editor.roles-assigned-edit', compact('user', 'assignableRoles', 'assignerLevel', 'targetUserLevel'));
    }

    /**
     * Dispatch invitation emails to a list of target user emails/usernames using RolesAssignRequest.
     */
    /**
     * Dispatch invitation emails to a list of target user emails/usernames using RolesAssignRequest.
     */
    public function sendInvitations(RolesAssignRequest $request): JsonResponse|RedirectResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        // Extract validated data via DTO
        $dto = $request->toDTO();

        // 1. Parse and sanitize input recipients
        $inputs = array_unique(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $dto->recipients))));

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
            $targetUser = $existingUsers->get($inputLower)
                ?? $existingUsers->firstWhere('username', $input);

            if (! $targetUser) {
                $skippedMessages[] = "'{$input}' was not found in the database system.";
                continue;
            }

            if ($targetUser->id === $currentUser->id) {
                $skippedMessages[] = "You cannot send a role assignment invite to yourself.";
                continue;
            }

            $targetLevel = $targetUser->getHighestRoleLevel() ?? 99;
            if ($targetLevel <= $adminLevel && $adminLevel !== 1) {
                $skippedMessages[] = "User '{$targetUser->username}' has equal or higher authority (Level {$targetLevel}) and cannot be invited.";
                continue;
            }

            $assignedRoleNames = Role::whereIn('id', $dto->roleIds)->pluck('name')->toArray();

            // Update user state and save sanitized pending roles
            $targetUser->update([
                'invited_by_id' => $currentUser->id,
                'invitation_confirmed_at' => null,
                'pending_roles' => $dto->roleIds,
            ]);

            Mail::to($targetUser->email)->send(
                new RoleAssignmentInviteMail($targetUser, $currentUser, $assignedRoleNames)
            );
            $sentCount++;
        }

        if ($sentCount === 0) {
            return redirect()->back()
                ->withErrors($skippedMessages ?: ['No eligible recipients were found to receive invitations.'])
                ->withInput();
        }

        $successMsg = "Successfully sent invitation email(s) to {$sentCount} recipient(s).";

        if (! empty($skippedMessages)) {
            return redirect()->back()
                ->with('roles_assigned_success', $successMsg)
                ->withErrors($skippedMessages);
        }

        return redirect()->route('dashboard')->with('roles_assigned_sent_email_success', $successMsg);
    }

    /**
     * Synchronize roles for a given target user and redirect to the target user's role detail view.
     */
    public function updateRolesAssigned(
        RolesAssignedUpdateRequest $request,
        User $user
    ): JsonResponse|RedirectResponse {
        // Extract the strongly typed DTO with automated level-boundary security filtering
        $dto = $request->toDTO();

        // Synchronize roles locally via the HasRoles trait using sanitized role IDs
        $user->syncRoles($dto->roleIds);
        $user->load('roles');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User roles updated',
                'data'  => $user->load('roles'),
            ]);
        }

        return redirect()
            ->route('users.roles.show', ['user' => $user->username])
            ->with('confirmed_assigned_update_success', 'User roles Updated.');
    }

    /**
     * Handle the recipient clicking "Agree To Take On The Responsibilities" from Mailpit.
     */
    public function confirmAgreement(Request $request, User $user): RedirectResponse
    {
        // 1. Verify that the signed URL is valid and unexpired
        if (! $request->hasValidSignature()) {
            abort(401, 'This invitation link is invalid or has expired.');
        }

        // 2. Ensure the correct user is logged in (or handle authentication guard)
        if (Auth::check() && Auth::id() !== $user->id) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if (! Auth::check()) {
            session()->put('url.intended', $request->fullUrl());
            return redirect()
                ->route('login')
                ->with('info', "Please sign in as {$user->name} to confirm your role assignments.");
        }

        // 3. Read pending roles from the JSON column
        $pendingRoleIds = $user->pending_roles ?? [];

        if (!empty($pendingRoleIds)) {
            // Synchronize roles permanently using your HasRoles trait
            $user->syncRoles($pendingRoleIds);
        }

        // 4. Mark confirmation timestamp and clear the pending_roles column
        $user->update([
            'roles_confirmed_at' => now(),
            'pending_roles' => null, // Clear pending column
        ]);

        $user->load('roles');

        // 5. Redirect user to dashboard with success feedback
        return redirect()
            ->route('users.roles.show', ['user' => $user])
            ->with('roles_assigned_agreed_success', 'You have successfully agreed to take on the assigned responsibilities and roles.');
    }

    /**
     * Retrieve assignable roles bounded strictly by the authenticated user's highest role level
     * and filtered dynamically by the selected level threshold.
     */
    public function rolesByLevelCreate(Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $minUserLevel = $currentUser->getHighestRoleLevel() ?? 99;

        $targetLevel = (int) $request->query('target_level', $minUserLevel + 1);

        // Security check: Target level must exceed the assigner's rank
        if ($targetLevel <= $minUserLevel) {
            return response()->json(['error' => 'Unauthorized level threshold.'], 403);
        }

        // Retrieve roles equal to or below the target level threshold (higher integer rank)
        $roles = Role::where('level', '>=', $targetLevel)
            ->orderedByLevel()
            ->get(['id', 'name', 'slug', 'level', 'description']);

        return response()->json($roles);
    }


    /**
     * Retrieve assignable roles bounded strictly by the authenticated user's highest role level
     * and filtered dynamically by the selected level threshold.
     */
    public function rolesByLevelUpdate(Request $request, User $user): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $assignerLevel = $currentUser->getHighestRoleLevel() ?? 99;

        $targetLevel = (int) $request->query('target_level', $assignerLevel + 1);

        // Security check: Target level must be higher than the logged-in admin's rank (lower integer number)
        // Or adjust this condition depending on your project's hierarchical rules
        if ($targetLevel <= $assignerLevel) {
            return response()->json(['error' => 'Unauthorized level threshold.'], 403);
        }

        // Retrieve roles equal to or above the target level threshold
        $roles = Role::where('level', '>=', $targetLevel)
            ->orderedByLevel()
            ->get(['id', 'name', 'slug', 'level', 'description']);

        return response()->json($roles);
    }
}
