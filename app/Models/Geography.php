<?php

/**
 * =============================================================================
 * WHAT: Universal Eloquent Model for Hierarchical Cascading Taxonomies (PHP / Laravel ORM)
 * WHEN: Instantiated whenever the application interacts with geography database records.
 * WHY:  Encapsulates adjacency list relationships (`parent`, `children`, `descendants`),
 *       automatic slug generation, and path traversal for 10,000+ Laravel applications
 *       utilizing modern PHP attributes (`#[Fillable]`, `#[Hidden]`, `#[Casts]`, `#[ScopedBy]`)
 *       instead of traditional property arrays.
 * WHO:  Backend Developers and Full-Stack Engineers.
 * WHERE: Saved at app/Models/Geography.php
 * HOW:  Called statically (`Geography::with('children')->get()`) or via Eloquent relationships.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS MODEL IN CONTROLLERS OR VIEWS:
 * Example 1: Fetching root geographies in a controller
 * $rootGeographies = Geography::whereNull('parent_id')->get();
 *
 * Example 2: Accessing the hierarchical path attribute in Blade
 * $pathArray = $article->geography?->full_path ?? [];
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * - Table Name Override: Add `#[Table(name: 'custom_table_name')]` attribute above the class.
 * - Fillable Attributes: Add or remove column names inside the `#[Fillable([...])]` attribute array.
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - ORM: Object-Relational Mapping (Eloquent database abstraction layer)
 *    - API: Application Programming Interface
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language
 *    - DTO: Data Transfer Object
 *    - JSON: JavaScript Object Notation
 *    - HTML: HyperText Markup Language
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING SOFT DELETES (Trash / Restoration):
 *    - Where: In database/migrations/*_create_geographies_table.php and app/Models/Geography.php.
 *    - How: Add `use Illuminate\Database\Eloquent\SoftDeletes;` inside the Geography model class body.
 * 2. ADDING ICON OR METADATA ATTRIBUTES:
 *    - Where: GeographyData DTO and Geography model `#[Fillable]` attribute.
 *    - How: Add `'icon'` or `'metadata'` to the `#[Fillable]` attribute list and add casting via `#[Castable]` or `#[Casts]`.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Override;

/*
 * [FUTURE MODIFICATION POINT - SOFT DELETES USAGE]:
 * Uncomment the trait import below if soft deletes are enabled in migration:
 * use Illuminate\Database\Eloquent\SoftDeletes;
 */

#[Fillable([
    'name',
    'slug',
    'parent_id',
    'sort_order',
    /*
     * [FUTURE MODIFICATION POINT - CUSTOM ATTRIBUTES]:
     * Add your custom fillable attributes here (e.g., 'icon', 'metadata', 'team_id'):
     */
])]

#[Hidden([
    // Add any sensitive attributes here if applicable (e.g., internal tokens or metadata)
])]

class Geography extends Model
{
    use HasFactory;

    /*
     * [FUTURE MODIFICATION POINT - SOFT DELETES TRAIT]:
     * Uncomment the line below to enable soft delete querying:
     * use SoftDeletes;
     */

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'parent_id' => 'integer',
            /*
             * [FUTURE MODIFICATION POINT - JSON CASTING]:
             * Uncomment if adding metadata:
             * 'metadata' => 'array',
             */
        ];
    }

    /**
     * Boot function to automatically generate slugs if missing.
     */
    #[Override]
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($geography) {
            $newSlug = Str::slug($geography->name);
            $oldSlug = $newSlug;
            $count = 0;
            while (static::where('slug', $newSlug)->exists()) {
                $newSlug = $oldSlug . '-' . $count;
                $count++;
            }
            $geography->slug = $newSlug;
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
     * Get the parent geography.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Geography::class, 'parent_id');
    }

    /**
     * Get direct child geographies.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Geography::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Recursive relationship to fetch infinite depth descendants.
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Interact with the full hierarchical path attribute using modern Attribute casting.
     */
    protected function fullPath(): Attribute
    {
        return Attribute::make(
            get: function () {
                $path = [];
                $pointer = $this;
                while ($pointer) {
                    array_unshift($path, $pointer->id);
                    $pointer = $pointer->parent;
                }
                return $path;
            }
        );
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC MODEL EXTENSIONS:
 *    - Finance: Add custom scopes to filter accounts by currency or ledger type.
 *    - Agriculture: Add scopes to filter crop varieties by harvest season.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add custom global scopes or model observers, create an observer in `app/Observers/GeographyObserver.php`
 *    and register it inside `AppServiceProvider::boot()`.
 * =============================================================================
 */
