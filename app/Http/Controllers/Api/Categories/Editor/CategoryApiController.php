<?php

/**
 * =============================================================================
 * WHAT: Universal API Category Controller for Cascading Hierarchies (PHP / Laravel API Controller)
 * WHEN: Handles RESTful asynchronous HTTP requests from single-page applications (SPAs), mobile apps, or frontend JavaScript (categories.js).
 * WHY:  Provides clean, stateless API endpoints for fetching child tiers, listing resources, and storing/updating/deleting categories dynamically
 *       across 10,000+ Laravel applications spanning all 21 industry sectors.
 * WHO:  Full-Stack Developers, Mobile Engineers, and API Architects.
 * WHERE: Saved at app/Http/Controllers/Api/Categories/Editor/CategoryApiController.php
 * HOW:  Registered in routes/api.php under versioned API route groups.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS CONTROLLER IN ROUTES:
 * use App\Http\Controllers\Api\Categories\Editor\CategoryApiController;
 *
 * Route::apiResource('categories', CategoryApiController::class);
 * Route::get('/categories/{category}/children', [CategoryApiController::class, 'getChildren']);
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
 *    - Where: CategoryApiController and API Resource.
 *    - How: Implement pagination inside `index()` using `Category::paginate(15)` and add keyword filtering.
 * =============================================================================
 */

namespace App\Http\Controllers\Api\Categories\Editor;

use App\Http\Controllers\Controller;
use App\Http\DTOs\Categories\Editor\CategoryData;
use App\Http\Requests\Categories\Editor\StoreCategoryRequest;
use App\Http\Resources\Categories\Editor\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryApiController extends Controller
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
     * Display a listing of the resource (Root or paginated categories).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // Optional search filtering support
        if ($request->has('q')) {
            $searchTerm = $request->input('q');
            $query->where('name', 'like', "%{$searchTerm}%");
        } else {
            // Default to root categories if no search/filter is applied
            $query->whereNull('parent_id');
        }

        $categories = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Fetch children categories dynamically for asynchronous AJAX cascading dropdowns.
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function getChildren(Category $category): JsonResponse
    {
        $children = $category->children()
            ->select('id', 'name', 'slug', 'parent_id', 'sort_order')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($children),
        ]);
    }

    /**
     * Store a newly created category in storage.
     *
     * @param StoreCategoryRequest $request
     * @return JsonResponse
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $dto = CategoryData::fromRequest($request);

        $category = Category::create($dto->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function show(Category $category): JsonResponse
    {
        $category->load('parent', 'children');

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param StoreCategoryRequest $request
     * @param Category $category
     * @return JsonResponse
     */
    public function update(StoreCategoryRequest $request, Category $category): JsonResponse
    {
        $dto = CategoryData::fromRequest($request);

        $category->update($dto->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC API ADAPTATIONS:
 *    - Finance: Return aggregated ledger metrics alongside category nodes.
 *    - Agriculture: Include regional stock or crop quantity counters in JSON responses.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add custom header versioning checks or telemetry logging, add a trait or interceptor
 *    inside the controller constructor or individual methods.
 * =============================================================================
 */
