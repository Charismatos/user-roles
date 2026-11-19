<?php

/**
 * =============================================================================
 * WHAT: Universal Data Transfer Object (DTO) for Geography Payload Encapsulation (PHP)
 * WHEN: Instantiated in controllers when receiving validated HTTP form requests.
 * WHY:  Provides strict type safety, clean separation of concerns, and immutable data structures
 *       across 10,000+ Laravel projects spanning all 21 enterprise sectors.
 * WHO:  Backend Engineers and Enterprise Architects.
 * WHERE: Saved at app/Http/DTOs/Geographies/Editor/GeographyData.php
 * HOW:  Called via `GeographyData::fromRequest($request)` inside controllers.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS DTO IN CONTROLLERS:
 * $dto = GeographyData::fromRequest($request);
 * $geography = Geography::create($dto->toArray());
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * Add additional public readonly properties to the constructor and map them
 * inside `fromRequest()` and `toArray()` (e.g., adding `?string $icon` or `?string $metadata`).
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - DTO: Data Transfer Object (Used for encapsulating and transferring validated request payloads)
 *    - HTTP: Hypertext Transfer Protocol
 *    - API: Application Programming Interface
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language
 *    - ORM: Object-Relational Mapping
 *    - JSON: JavaScript Object Notation
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING ICON OR METADATA ATTRIBUTES:
 *    - Where: GeographyData DTO and Geography model fillable attributes.
 *    - How: Add `public readonly ?string $icon` or `public readonly ?array $metadata` to the constructor.
 * =============================================================================
 */

namespace App\Http\DTOs\Geographies\Editor;

use App\Http\Requests\Geographies\Editor\StoreGeographyRequest;
use App\Http\Requests\Geographies\Editor\UpdateGeographyRequest;
use App\Models\Geography;
use Illuminate\Support\Str;

class GeographyData
{
    /**
     * Create a new GeographyData DTO instance.
     *
     * @param string $name
     * @param string|null $slug
     * @param int|null $parentId
     * @param int $sortOrder
     * @param string|null $icon [FUTURE MODIFICATION POINT: Optional icon attribute]
     */
    public function __construct(
        public readonly string $name,
        public readonly ?string $slug,
        public readonly ?int $parentId,
        public readonly int $sortOrder = 0,
        public readonly ?string $icon = null
    ) {}

    /**
     * Create a DTO instance from an HTTP Form Request.
     * Abbreviations: ID (Identifier).
     *
     * @param StoreGeographyRequest|UpdateGeographyRequest $request
     * @return self
     */
    public static function fromRequest(StoreGeographyRequest|UpdateGeographyRequest $request): self
    {

        $parentId = $request->input('parent_id');
        $parentSlug = $request->input('parent_slug');

        // If a parent slug is submitted instead of an ID, resolve it to the database ID
        if (empty($parentId) && !empty($parentSlug)) {
            $parentGeography = Geography::where('slug', $parentSlug)->first();
            $parentId = $parentGeography?->id;
        }

        return new self(
            name: $request->validated('name'),
            slug: $request->validated('slug'),
            parentId: $parentId ? (int) $parentId : null, // <--- Use the resolved local variable here
            sortOrder: (int) $request->validated('sort_order', 0),
            icon: $request->validated('icon'),
        );
    }

    /**
     * Convert DTO to an associative array for database persistence.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [
            'name' => $this->name,
            'slug' => $this->slug ?? Str::slug($this->name),
            'parent_id' => $this->parentId,
            'sort_order' => $this->sortOrder,
        ];

        // Include optional attributes if provided
        if ($this->icon !== null) {
            $data['icon'] = $this->icon;
        }

        return $data;
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC CUSTOMIZATIONS:
 *    - In Real Estate projects, you might map `property_type_id` or `zoning_code`.
 *    - In Finance projects, you might map `currency_code` or `ledger_type`.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add validation or sanitization before building the DTO, add methods inside `fromRequest()`:
 *    `name: trim(strip_tags($request->validated('name')))`
 * =============================================================================
 */
