<?php

namespace App\Http\DTOs\Roles\Editor;

use App\Http\Requests\Roles\Editor\RolesAssignRequest;
use App\Http\Requests\Roles\Editor\RolesAssignedUpdateRequest;
use App\Models\Role;

class RoleAssignedData
{
    /**
     * Create a new RoleAssignedData instance.
     *
     * @param array<int> $roleIds
     * @param int|null $userLevel
     * @param string|null $recipients
     */
    public function __construct(
        public readonly array $roleIds,
        public readonly ?int $userLevel = null,
        public readonly ?string $recipients = null
    ) {}

    /**
     * Instantiate DTO from RolesAssignedUpdateRequest with boundary security filtering.
     */
    public static function fromUpdateRequest(RolesAssignedUpdateRequest $request): self
    {
        $inputRoleIds = array_map('intval', $request->input('roles', []));
        $selectedLevelThreshold = (int) $request->input('user_level', 0);

        // Security Guard: Automatically filter out roles that violate the selected level threshold boundary
        if ($selectedLevelThreshold > 0) {
            $validRoleIds = Role::whereIn('id', $inputRoleIds)
                ->where('level', '>=', $selectedLevelThreshold)
                ->pluck('id')
                ->toArray();
        } else {
            $validRoleIds = $inputRoleIds;
        }

        return new self(
            roleIds: $validRoleIds,
            userLevel: $request->filled('user_level') ? (int) $request->input('user_level') : null,
            recipients: null
        );
    }

    /**
     * Instantiate DTO from RolesAssignRequest for batch invitation workflows.
     */
    public static function fromAssignRequest(RolesAssignRequest $request): self
    {
        $inputRoleIds = array_map('intval', $request->input('roles', []));
        $selectedLevelThreshold = (int) $request->input('user_level', 0);

        if ($selectedLevelThreshold > 0) {
            $validRoleIds = Role::whereIn('id', $inputRoleIds)
                ->where('level', '>=', $selectedLevelThreshold)
                ->pluck('id')
                ->toArray();
        } else {
            $validRoleIds = $inputRoleIds;
        }

        return new self(
            roleIds: $validRoleIds,
            userLevel: $request->filled('user_level') ? (int) $request->input('user_level') : null,
            recipients: $request->input('recipients')
        );
    }

    /**
     * Convert DTO properties into an array format.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'role_ids' => $this->roleIds,
            'user_level' => $this->userLevel,
            'recipients' => $this->recipients,
        ];
    }
}
