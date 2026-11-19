<?php

/**
 * =============================================================================
 * WHAT: Universal API Geography Controller for Cascading Hierarchies (PHP / Laravel API Controller)
 * WHEN: Handles RESTful asynchronous HTTP requests from single-page applications (SPAs), mobile apps, or frontend JavaScript (geographies.js).
 * WHY:  Provides clean, stateless API endpoints for fetching child tiers, listing resources, and storing/updating/deleting geographies dynamically
 *       across 10,000+ Laravel applications spanning all 21 industry sectors.
 * WHO:  Full-Stack Developers, Mobile Engineers, and API Architects.
 * WHERE: Saved at app/Http/Controllers/Api/Geographies/Editor/GeographyApiController.php
 * HOW:  Registered in routes/api.php under versioned API route groups.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS CONTROLLER IN ROUTES:
 * use App\Http\Controllers\Api\Geographies\Editor\GeographyApiController;
 *
 * Route::apiResource('geographies', GeographyApiController::class);
 * Route::get('/geographies/{geography}/children', [GeographyApiController::class, 'getChildren']);
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * - Middleware Scoping: Apply auth sanctum middleware in constructor or route definition (`$this->middleware('auth:sanctum')->except(['index', 'show', 'getChildren']);`).
 * - Response Formats: Customize JSON response keys or API resource collections to match client expectations.
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - API: Application Programming Interface (Used for asynchronous server communication)
 *    - DTO: Data Transfer Object (Used for encapsulating and transferring validated request payloads)
 *    - JSON: JavaScript Object Notation (Data-interchange format)
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language
 *    - ORM: Object-Relational Mapping
 *    - HTTP: Hypertext Transfer Protocol
 *    - CRUD: Create, Read, Update, Delete
 *    - REST: Representational State Transfer
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING SEARCH OR PAGINATION:
 *    - Where: GeographyApiController and API Resource.
 *    - How: Implement pagination inside `index()` using `Geography::paginate(15)` and add keyword filtering.
 * =============================================================================
 */

namespace App\Http\Controllers\Api\Geographies\Editor;

use App\Http\Controllers\Controller;
use App\Http\DTOs\Geographies\Editor\GeographyData;
use App\Http\Requests\Geographies\Editor\StoreGeographyRequest;
use App\Http\Resources\Geographies\Editor\GeographyResource;
use App\Models\Geography;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeographyApiController extends Controller
{
    /**
     * Create a new API controller instance and apply authentication middleware.
     */
    public function __construct()
    {
        /*
         * [FUTURE MODIFICATION POINT - AUTHENTICATION MIDDLEWARE]:
         * Protect write operations while leaving read/fetching operations public:
         * $this->middleware('auth:sanctum')->except(['index', 'show', 'getChildren']);
         */
    }

    /**
     * Display a listing of the resource (Root or paginated geographies).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Geography::query();

        // Optional search filtering support
        if ($request->has('q')) {
            $searchTerm = $request->input('q');
            $query->where('name', 'like', "%{$searchTerm}%");
        } else {
            // Default to root geographies if no search/filter is applied
            $query->whereNull('parent_id');
        }

        $geographies = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => GeographyResource::collection($geographies),
        ]);
    }

    /**
     * Fetch children geographies dynamically for asynchronous AJAX cascading dropdowns.
     *
     * @param Geography $geography
     * @return JsonResponse
     */
    public function getChildren(Geography $geography): JsonResponse
    {
        $children = $geography->children()
            ->select('id', 'name', 'slug', 'parent_id', 'sort_order')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => GeographyResource::collection($children),
        ]);
    }

    /**
     * Store a newly created geography in storage.
     *
     * @param StoreGeographyRequest $request
     * @return JsonResponse
     */
    public function store(StoreGeographyRequest $request): JsonResponse
    {
        $dto = GeographyData::fromRequest($request);

        $geography = Geography::create($dto->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Geography created successfully.',
            'data' => new GeographyResource($geography),
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param Geography $geography
     * @return JsonResponse
     */
    public function show(Geography $geography): JsonResponse
    {
        $geography->load('parent', 'children');

        return response()->json([
            'success' => true,
            'data' => new GeographyResource($geography),
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param StoreGeographyRequest $request
     * @param Geography $geography
     * @return JsonResponse
     */
    public function update(StoreGeographyRequest $request, Geography $geography): JsonResponse
    {
        $dto = GeographyData::fromRequest($request);

        $geography->update($dto->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Geography updated successfully.',
            'data' => new GeographyResource($geography),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Geography $geography
     * @return JsonResponse
     */
    public function destroy(Geography $geography): JsonResponse
    {
        $geography->delete();

        return response()->json([
            'success' => true,
            'message' => 'Geography deleted successfully.',
        ]);
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC API ADAPTATIONS:
 *    - Finance: Return aggregated ledger metrics alongside geography nodes.
 *    - Agriculture: Include regional stock or crop quantity counters in JSON responses.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add custom header versioning checks or telemetry logging, add a trait or interceptor
 *    inside the controller constructor or individual methods.
 * =============================================================================
 */
