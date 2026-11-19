<?php

/**
 * =============================================================================
 * WHAT: Universal Geography Controller for Cascading Hierarchies (PHP / Laravel Controller)
 * WHEN: Handles HTTP requests from frontend JavaScript (geographies.js) for dynamic cascading, CRUD actions, and resource management.
 * WHY:  Provides clean endpoints for listing, creating, viewing, updating, and deleting geographies dynamically
 *       across 10,000+ Laravel applications spanning all 21 industry sectors.
 * WHO:  Full-Stack Developers and Backend Engineers.
 * WHERE: Saved at app/Http/Controllers/Web/Geographies/Editor/GeographyController.php
 * HOW:  Registered in routes/api.php or routes/web.php.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS CONTROLLER IN ROUTES:
 * use App\Http\Controllers\Web\Geographies\Editor\GeographyController;
 *
 * Route::get('/geographies', [GeographyController::class, 'index']);
 * Route::get('/geographies/create', [GeographyController::class, 'create']);
 * Route::post('/geographies', [GeographyController::class, 'store']);
 * Route::get('/geographies/{geography}', [GeographyController::class, 'show']);
 * Route::get('/geographies/{geography}/edit', [GeographyController::class, 'edit']);
 * Route::patch('/geographies/{geography}', [GeographyController::class, 'update']);
 * Route::delete('/geographies/{geography}', [GeographyController::class, 'destroy']);
 * Route::get('/geographies/{geography}/children', [GeographyController::class, 'getChildren']);
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * - Middleware Scoping: Add constructor middleware for authentication or team scoping (`$this->middleware('auth:sanctum');`).
 * - Response Formats: Customize JSON response keys or view templates to match frontend expectations.
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
 *    - FK: Foreign Key (Relational database pointer)
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING SEARCH OR PAGINATION:
 *    - Where: GeographyController and API Resource.
 *    - How: Add a `search` query parameter check inside `index()` or `getChildren()`.
 * =============================================================================
 */

namespace App\Http\Controllers\Web\Geographies\Editor;

use App\Http\Controllers\Controller;
use App\Http\DTOs\Geographies\Editor\GeographyData;
use App\Http\Requests\Geographies\Editor\StoreGeographyRequest;
use App\Http\Requests\Geographies\Editor\UpdateGeographyRequest;
use App\Http\Resources\Geographies\Editor\GeographyResource;
use App\Models\Geography;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeographyController extends Controller
{
    /**
     * Create a new controller instance and apply middleware if necessary.
     */
    public function __construct()
    {
        /*
         * [FUTURE MODIFICATION POINT - AUTHENTICATION MIDDLEWARE]:
         * Uncomment below to protect routes:
         * $this->middleware('auth:sanctum')->except(['getChildren']);
         */
    }

    /**
     * Display a listing of root geographies and render the modification Blade view.
     * Abbreviations: ID (Identifier).
     *
     * @param Request $request
     * @return \Illuminate\Contracts\View\View
     */
    public function index(Request $request)
    {
        $query = Geography::query();

        if ($request->has('q')) {
            $searchTerm = $request->input('q');
            $query->where('name', 'like', "%{$searchTerm}%");
        } else {
            $query->whereNull('parent_id'); // ID = Identifier
        }

        $geographies = $query->orderBy('name', 'asc')->get();

        // Flexible lookup: checks request attributes and route parameters for attached models
        $associateModel = $request->attributes->get('article')
            ?? $request->attributes->get('model')
            ?? $request->route('article')
            ?? $request->route('model')
            ?? null;

        return view('Groupings.geographies', compact('geographies', 'associateModel'));
    }
    /**
     * Show the form for creating a new resource (or return view template data).
     *
     * @return JsonResponse
     */
    public function create(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Provide creation payload for the new geography form.',
        ]);
    }

    /**
     * Store a newly created geography via dynamic inline input or form request.
     * Abbreviations: ID (Identifier), DTO (Data Transfer Object).
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
     * Abbreviations: ID (Identifier).
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
     * Show the form for editing the specified resource.
     * Abbreviations: ID (Identifier).
     *
     * @param Geography $geography
     * @return JsonResponse
     */
    public function edit(Geography $geography): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new GeographyResource($geography),
            'message' => 'Geography edit context retrieved successfully.',
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Abbreviations: ID (Identifier), DTO (Data Transfer Object).
     *
     * @param UpdateGeographyRequest $request
     * @param Geography $geography
     * @return JsonResponse
     */
    public function update(UpdateGeographyRequest $request, Geography $geography): JsonResponse
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
     * Abbreviations: ID (Identifier).
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

    /**
     * Fetch children geographies dynamically for AJAX cascading dropdowns.
     * Abbreviations: ID (Identifier), FK (Foreign Key).
     *
     * @param Geography $geography
     * @return JsonResponse
     */
    public function getChildren(Geography $geography): JsonResponse
    {
        $children = $geography->children()
            ->select('id', 'name', 'slug', 'parent_id', 'sort_order') // ID = Identifier
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => GeographyResource::collection($children),
        ]);
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC CONTROLLER ADAPTATIONS:
 *    - Finance: Add methods to calculate ledger balances for selected geography branches.
 *    - Agriculture: Add methods to filter crop yields or regional distribution by geography.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add a search filtering method for autocomplete dropdowns, add the following inside `GeographyController`:
 *    ```php
 *    public function search(Request $request): JsonResponse
 *    {
 *        $query =$request->get('q');
 *        $geographies = Geography::where('name', 'like', "\%{$query}%")->limit(20)->get();
 *        return response()->json(['success' => true, 'data' => GeographyResource::collection($geographies)]);
 *    }
 *    ```
 * =============================================================================
 */
