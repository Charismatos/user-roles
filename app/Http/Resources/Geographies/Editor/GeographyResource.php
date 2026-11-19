<?php

/**
 * =============================================================================
 * WHAT: Universal API Resource for Standardized JSON Responses (PHP / Laravel JsonResource)
 * WHEN: Serializes Geography Eloquent models into structured JSON payloads for AJAX clients.
 * WHY:  Ensures consistent API contract formatting across 10,000+ Laravel applications
 *       spanning all 21 industry sectors.
 * WHO:  Frontend Engineers, Mobile App Developers, and API Consumers.
 * WHERE: Saved at app/Http/Resources/GeographyResource.php
 * HOW:  Called in controllers: `return new GeographyResource($geography);` or `GeographyResource::collection($geographies);`.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS API RESOURCE IN CONTROLLERS:
 * public function getChildren(Geography $geography): JsonResponse
 * {
 *     $children = $geography->children()->get();
 *     return response()->json([
 *         'success' => true,
 *         'data' => GeographyResource::collection($children),
 *     ]);
 * }
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * Add or remove attributes inside the returned array (e.g., adding `'icon' => $this->icon` or `'metadata' => $this->metadata`).
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - API: Application Programming Interface (Used for asynchronous server communication)
 *    - JSON: JavaScript Object Notation (Data-interchange format)
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language
 *    - DTO: Data Transfer Object
 *    - ORM: Object-Relational Mapping
 *    - HTML: HyperText Markup Language
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING ICON OR METADATA ATTRIBUTES:
 *    - Where: GeographyData DTO and Geography model $fillable array.
 *    - How: Add `'icon' => $this->whenNotNull($this->icon)` or `'metadata' => $this->whenLoaded('metadata')` inside the `toArray()` method below.
 * =============================================================================
 */

namespace App\Http\Resources\Geographies\Editor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeographyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // ID = Identifier
            'name' => $this->name,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'sort_order' => $this->sort_order,
            'full_path' => $this->whenLoaded('parent', fn() => $this->full_path),
            'children' => GeographyResource::collection($this->whenLoaded('children')),

            /*
             * [FUTURE MODIFICATION POINT - ADDITIONAL ATTRIBUTES]:
             * Add custom attributes here if needed for specific sectors (e.g., icon, metadata):
             * 'icon' => $this->whenNotNull($this->icon),
             * 'metadata' => $this->whenNotNull($this->metadata),
             */

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC CUSTOMIZATIONS:
 *    - In Financial API responses, you can include computed balances or currency symbols.
 *    - In Educational API responses, you can include course counts or credit units.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To include conditional fields based on authenticated user permissions, use:
 *    `'secret_meta' => $this->when($request->user()?->isAdmin(), $this->secret_data)`
 * =============================================================================
 */
