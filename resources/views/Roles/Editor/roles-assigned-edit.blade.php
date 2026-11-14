{{--
  =============================================================================
  WHAT: Enterprise User Role Modification View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the role update interface for a specific target user across projects.
  WHY:  Enables fine-tuning, upgrading, or revoking specific roles assigned to an individual user account with dynamic level filtering and role level synchronization.
  WHO:  Backend engineers, full-stack developers, and system administrators.
  WHERE: Saved as resources/views/Roles/Editor/roles-assigned-update.blade.php
  HOW:  Integrates Vite asset hooks, top-error containers, level threshold filters, and secure PUT routing bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW FIELDS: Insert additional form components inside the form wrapper before actions.
  - MODIFYING ROUTE BINDINGS: Update the route parameters inside `action` attributes to match project specs.
  =============================================================================
--}}

@php
    $assignerLevel = Auth::user()->getHighestRoleLevel() ?? 99;
    $targetUserLevel = $user->getHighestRoleLevel() ?? $assignerLevel + 1;
    $selectedRoleIds = old('roles', $user->roles->pluck('id')->toArray());
@endphp

{{-- Feed selected role IDs into global scope --}}
<script>
    /** @type {any} */
    window.appAssignedRoleIds = @json($selectedRoleIds);
</script>

@vite(['resources/css/Roles/Editor/roles-assigned-edit.css', 'resources/js/Roles/Editor/roles-assigned-edit.js'])

<main class="plb-screen-center" data-assigner-level="{{ $assignerLevel }}" data-target-user-level="{{ $targetUserLevel }}"
    data-user-username="{{ $user->username }}">
    <div class="pf-card" style="max-width: 700px; margin: 0 auto; padding: 2rem;">

        <header style="margin-bottom: 1.5rem;">
            <h1>Manage User Roles: {{ $user->name }}</h1>
            <p style="color: #6b7280; font-size: 0.875rem;">
                Update system access levels and role associations for <strong>{{ $user->email }}</strong>.
            </p>
            <x-links.link href="{{ route('users.roles.show', $user->username) }}" label="Back to User Details"
                class="pl-link pl-muted" />
        </header>

        <form id="ra-role-assignment-form" action="{{ route('users.roles.update', $user->username) }}" method="POST"
            novalidate>
            @csrf
            @method('PUT')

            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            <div
                style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #374151;">
                    <strong>Current Target User Highest Rank:</strong> Level
                    {{ $user->getHighestRoleLevel() ?? 'None' }}
                </p>
            </div>

            {{-- Level Threshold Filter Dropdown (Submits 'user_level' along with roles for re-assignment/filtering) --}}
            <div style="margin-bottom: 1rem;">
                <label for="assigned_user_level" class="pl-required">Filter Roles by Target Level Threshold</label>
                <select id="assigned_user_level" name="user_level" class="pdef-pill"
                    style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
                    <option value="" disabled>-- Select Level Threshold --</option>
                    @for ($i = $assignerLevel + 1; $i <= 99; $i++)
                        <option value="{{ $i }}" {{ $i == $targetUserLevel ? 'selected' : '' }}>
                            Level {{ $i }} and Above
                        </option>
                    @endfor
                </select>
            </div>

            {{-- Available Roles Selection Container (Pre-populated via PHP, re-rendered via AJAX on change) --}}
            <div style="margin-bottom: 1.5rem;">
                <label class="pl-required" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                    Select Active Roles for User
                </label>
                <div id="ra-role-selection-box"
                    style="border: 1px solid #d1d5db; border-radius: 6px; padding: 1rem; background: #fff; max-height: 250px; overflow-y: auto;">

                    @forelse($assignableRoles ?? [] as $role)
                        <div class="ra-checkbox-item"
                            style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <input type="checkbox" name="roles[]" value="{{ $role->id }}"
                                id="role_{{ $role->id }}"
                                {{ in_array($role->id, old('roles', $selectedRoleIds)) ? 'checked' : '' }}
                                style="margin-top: 0.25rem; width: 1rem; height: 1rem;">
                            <div class="ra-role-details">
                                <label for="role_{{ $role->id }}"
                                    style="cursor: pointer; font-weight: 600; font-size: 0.875rem; color: #111827;">
                                    {{ $role->name }} ({{ $role->slug }}) - Level {{ $role->level }}
                                </label>
                                @if ($role->description)
                                    <span
                                        style="display: block; color: #6b7280; font-size: 0.75rem;">{{ $role->description }}</span>
                                @endif
                            </div>
                        </div>
                    @empty
                        <p class="ra-placeholder-text" style="color: #6b7280; margin: 0; font-style: italic;">
                            Please select a level threshold above to load and display eligible roles.
                        </p>
                    @endforelse
                </div>
            </div>

            <div
                style="display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
                <x-buttons.button id="update-user-roles-btn" type="submit" variant="primary"
                    label="Update Assigned Roles" icon="💾"
                    buttonRole="Securely synchronize and update user roles and level threshold"
                    class="pb-btn pb-primary pb-pill" />
            </div>
        </form>

    </div>
</main>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS VIEW ACROSS PROJECTS:
  - Facilitates modifying individual user role states securely via checked lists with dynamic level filtering.
  =============================================================================
--}}
