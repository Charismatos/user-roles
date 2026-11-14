<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Override;

/**
 * Class Role
 *
 * Represents access control roles within the system.
 *
 * @property int $id
 * @property string $name Human-readable title
 * @property string $slug Machine-readable identifier (e.g. 'admin')
 * @property string|null $description Scope description
 * @property int $level Hierarchy order/weight level (default: 99)
 * @property bool $is_system Protected system status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 *
 * @package App\Models
 */
class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'level',
        'is_system',
    ];


    #[Override]
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($role) {
            $newSlug = Str::slug($role->name);
            $oldSlug = $newSlug;
            $count = 0;
            while (static::where('slug', $newSlug)->exists()) {
                $newSlug = $oldSlug . '-' . $count;
                $count++;
            }
            $role->slug = $newSlug;
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'is_system' => 'boolean',
        ];
    }

    /**
     * Users associated with this role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<\App\Models\User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('assigned_at');
    }

    /**
     * Scope query to find a role by its slug identifier.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Role>  $query
     * @param  string  $slug
     * @return \Illuminate\Database\Eloquent\Builder<Role>
     */
    public function scopeBySlug(Builder $query, string $slug): Builder
    {
        return $query->where('slug', $slug);
    }

    /**
     * Scope query to order roles by hierarchy level (ascending).
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Role>  $query
     * @return \Illuminate\Database\Eloquent\Builder<Role>
     */
    public function scopeOrderedByLevel(Builder $query): Builder
    {
        return $query->orderBy('level', 'asc');
    }

    /**
     * Scope query to filter roles at or above a specific hierarchy weight.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Role>  $query
     * @param  int  $maxLevel
     * @return \Illuminate\Database\Eloquent\Builder<Role>
     */
    public function scopeAtOrAboveLevel(Builder $query, int $maxLevel): Builder
    {
        return $query->where('level', '<=', $maxLevel);
    }
}
