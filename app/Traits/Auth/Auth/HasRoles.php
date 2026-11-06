<?php

namespace App\Traits\Auth\Auth;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

/**
 * Trait HasRoles
 *
 * Provides role management and hierarchy checks for Eloquent models.
 *
 * @mixin \Illuminate\Database\Eloquent\Model
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Role> $roles
 */
trait HasRoles
{
    /**
     * Define the belongs-to-many relationship with roles.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        /** @var \Illuminate\Database\Eloquent\Model $this */
        return $this->belongsToMany(Role::class)
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    /**
     * Determine if the model possesses the specified role slug.
     *
     * @param string $roleSlug
     * @return bool
     */
    public function hasRole(string $roleSlug): bool
    {
        return $this->roles->contains('slug', $roleSlug);
    }

    /**
     * Determine if the model possesses any of the given role slugs.
     *
     * @param array<int, string> $roleSlugs
     * @return bool
     */
    public function hasAnyRole(array $roleSlugs): bool
    {
        return $this->roles->contains(fn(Role $role) => in_array($role->slug, $roleSlugs, true));
    }

    /**
     * Determine if the model possesses all of the given role slugs.
     *
     * @param array<int, string> $roleSlugs
     * @return bool
     */
    public function hasAllRoles(array $roleSlugs): bool
    {
        $userSlugs = $this->roles->pluck('slug')->all();

        return count(array_diff($roleSlugs, $userSlugs)) === 0;
    }

    /**
     * Get the highest hierarchy level among all assigned roles (lowest numeric value = highest priority).
     *
     * @return int|null
     */
    public function getHighestRoleLevel(): ?int
    {
        return $this->roles->min('level');
    }

    /**
     * Determine if the user has a role level at or above a given weight threshold.
     * (e.g., level <= $maxLevel threshold)
     *
     * @param int $maxLevel
     * @return bool
     */
    public function hasLevelAtOrAbove(int $maxLevel): bool
    {
        $highest = $this->getHighestRoleLevel();

        return $highest !== null && $highest <= $maxLevel;
    }

    /**
     * Assign one or multiple roles to the current model without detaching existing ones.
     *
     * @param string|Role|int|array<int, string|Role|int> ...$roles
     * @return static
     */
    public function assignRole(...$roles): static
    {
        $roleIds = $this->resolveRoleIds($roles);

        if ($roleIds->isNotEmpty()) {
            $syncData = $roleIds->mapWithKeys(fn(int $id) => [
                $id => ['assigned_at' => now()]
            ])->all();

            $this->roles()->syncWithoutDetaching($syncData);

            /** @var \Illuminate\Database\Eloquent\Model $this */
            $this->load('roles');
        }

        return $this;
    }

    /**
     * Synchronize model roles completely.
     *
     * @param array<int, string|Role|int> $roles
     * @return static
     */
    public function syncRoles(array $roles): static
    {
        $roleIds = $this->resolveRoleIds($roles);

        $syncData = $roleIds->mapWithKeys(fn(int $id) => [
            $id => ['assigned_at' => now()]
        ])->all();

        $this->roles()->sync($syncData);

        /** @var \Illuminate\Database\Eloquent\Model $this */
        $this->load('roles');

        return $this;
    }

    /**
     * Remove one or multiple roles from the model.
     *
     * @param string|Role|int|array<int, string|Role|int> ...$roles
     * @return static
     */
    public function detachRole(...$roles): static
    {
        $roleIds = $this->resolveRoleIds($roles);

        if ($roleIds->isNotEmpty()) {
            $this->roles()->detach($roleIds->all());

            /** @var \Illuminate\Database\Eloquent\Model $this */
            $this->load('roles');
        }

        return $this;
    }

    /**
     * Helper method to map mixed role representations (objects, slugs, IDs) into integer IDs.
     *
     * @param array<mixed> $roles
     * @return Collection<int, int>
     */
    protected function resolveRoleIds(array $roles): Collection
    {
        return collect($roles)
            ->flatten()
            ->map(function ($role) {
                if ($role instanceof Role) {
                    return $role->id;
                }
                if (is_numeric($role)) {
                    return (int) $role;
                }
                if (is_string($role)) {
                    return Role::where('slug', $role)->value('id');
                }
                return null;
            })
            ->filter()
            ->unique()
            ->values();
    }
}
