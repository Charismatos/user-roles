<?php

/**
 * =============================================================================
 * WHAT: Universal Category Controller for Cascading Hierarchies (PHP / Laravel Controller)
 * WHEN: Handles HTTP requests from frontend JavaScript (categories.js) for dynamic cascading, CRUD actions, and resource management.
 * WHY:  Provides clean endpoints for listing, creating, viewing, updating, and deleting categories dynamically
 *       across 10,000+ Laravel applications spanning all 21 industry sectors.
 * WHO:  Full-Stack Developers and Backend Engineers.
 * WHERE: Saved at app/Http/Controllers/Web/Categories/Editor/CategoryController.php
 * HOW:  Registered in routes/api.php or routes/web.php.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS CONTROLLER IN ROUTES:
 * use App\Http\Controllers\Web\Categories\Editor\CategoryController;
 *
 * Route::get('/categories', [CategoryController::class, 'index']);
 * Route::get('/categories/create', [CategoryController::class, 'create']);
 * Route::post('/categories', [CategoryController::class, 'store']);
 * Route::get('/categories/{category}', [CategoryController::class, 'show']);
 * Route::get('/categories/{category}/edit', [CategoryController::class, 'edit']);
 * Route::patch('/categories/{category}', [CategoryController::class, 'update']);
 * Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
 * Route::get('/categories/{category}/children', [CategoryController::class, 'getChildren']);
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
 *    - Where: CategoryController and API Resource.
 *    - How: Add a `search` query parameter check inside `index()` or `getChildren()`.
 * =============================================================================
 */

namespace App\Http\Controllers\Web\Categories\Editor;

use App\Http\Controllers\Controller;
use App\Http\DTOs\Categories\Editor\CategoryData;
use App\Http\Requests\Categories\Editor\StoreCategoryRequest;
use App\Http\Requests\Categories\Editor\UpdateCategoryRequest;
use App\Http\Resources\Categories\Editor\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
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
     * Display a listing of root categories and render the modification Blade view.
     * Abbreviations: ID (Identifier).
     *
     * @param Request $request
     * @return \Illuminate\Contracts\View\View
     */
    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->has('q')) {
            $searchTerm = $request->input('q');
            $query->where('name', 'like', "%{$searchTerm}%");
        } else {
            $query->whereNull('parent_id'); // ID = Identifier
        }

        $categories = $query->orderBy('name', 'asc')->get();

        // Flexible lookup: checks request attributes and route parameters for attached models
        $associateModel = $request->attributes->get('article')
            ?? $request->attributes->get('model')
            ?? $request->route('article')
            ?? $request->route('model')
            ?? null;

        return view('Groupings.categories', compact('categories', 'associateModel'));
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
            'message' => 'Provide creation payload for the new category form.',
        ]);
    }

    /**
     * Store a newly created category via dynamic inline input or form request.
     * Abbreviations: ID (Identifier), DTO (Data Transfer Object).
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
     * Abbreviations: ID (Identifier).
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
     * Show the form for editing the specified resource.
     * Abbreviations: ID (Identifier).
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function edit(Category $category): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
            'message' => 'Category edit context retrieved successfully.',
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Abbreviations: ID (Identifier), DTO (Data Transfer Object).
     *
     * @param UpdateCategoryRequest $request
     * @param Category $category
     * @return JsonResponse
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
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
     * Abbreviations: ID (Identifier).
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

    /**
     * Fetch children categories dynamically for AJAX cascading dropdowns.
     * Abbreviations: ID (Identifier), FK (Foreign Key).
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function getChildren(Category $category): JsonResponse
    {
        $children = $category->children()
            ->select('id', 'name', 'slug', 'parent_id', 'sort_order') // ID = Identifier
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($children),
        ]);
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC CONTROLLER ADAPTATIONS:
 *    - Finance: Add methods to calculate ledger balances for selected category branches.
 *    - Agriculture: Add methods to filter crop yields or regional distribution by category.
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add a search filtering method for autocomplete dropdowns, add the following inside `CategoryController`:
 *    ```php
 *    public function search(Request $request): JsonResponse
 *    {
 *        $query =$request->get('q');
 *        $categories = Category::where('name', 'like', "\%{$query}%")->limit(20)->get();
 *        return response()->json(['success' => true, 'data' => CategoryResource::collection($categories)]);
 *    }
 *    ```
 * =============================================================================
 */
