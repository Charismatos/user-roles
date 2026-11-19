<?php

/**
 * =============================================================================
 * WHAT: Universal HTTP Form Request Validation Class for Updates (PHP / Laravel FormRequest)
 * WHEN: Intercepts incoming HTTP PUT/PATCH requests before they reach controllers.
 * WHY:  Ensures robust input validation, authorization checks, and circular reference
 *       prevention for hierarchical trees across 10,000+ Laravel applications.
 * WHO:  Backend Engineers and Security Auditors.
 * WHERE: Saved at app/Http/Requests/Categories/Editor/UpdateCategoryRequest.php
 * HOW:  Type-hinted in controller methods (`public function update(UpdateCategoryRequest $request, Category $category)`).
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS FORM REQUEST IN CONTROLLERS:
 * public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
 * {
 *     $dto = CategoryData::fromRequest($request);
 *     // ...
 * }
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * - Authorization: Modify `authorize()` to check Spatie permissions or gates (`return auth()->user()->can('manage-categories');`).
 * - Validation Rules: Add custom rules or table name overrides inside `rules()`.
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - HTTP: Hypertext Transfer Protocol
 *    - API: Application Programming Interface
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language
 *    - DTO: Data Transfer Object
 *    - ORM: Object-Relational Mapping
 *    - JSON: JavaScript Object Notation
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING MULTI-TENANCY (Project/Workspace Isolation):
 *    - Where: Migration, DTO, and Form Request.
 *    - How: Add team scoping to unique validation rules ignoring the current model ID:
 *      `'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($this->route('category'))->where('team_id', $this->team_id)]`
 * =============================================================================
 */

namespace App\Http\Requests\Categories\Editor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $user = Auth::user();

        // 1. Return false (403 Forbidden) if not authenticated
        if (! $user) {
            return false;
        }

        // 2. Safely check roles if the method exists
        if (method_exists($user, 'hasAnyRole')) {
            return $user->hasAnyRole(['admin', 'editor']);
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Retrieve the current category instance being updated from the route
        $category = $this->route('category');
        $categoryId = $category?->id ?? $category;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($categoryId)],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // Ignore the current category's ID so updating a record with its own slug doesn't trigger a unique constraint violation
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                // Prevent circular reference (a category cannot be assigned as its own parent, nor can it become a child of its descendants)
                function ($attribute, $value, $fail) use ($categoryId) {
                    if ($value && $value == $categoryId) {
                        $fail('A category cannot be assigned as its own parent.');
                    }
                },
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'icon' => ['nullable', 'string', 'max:255'],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parent_id.exists' => 'The selected parent category is invalid.',
            'slug.unique' => 'This category slug already exists. Please choose a unique name.',
        ];
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. MULTI-TENANCY SCOPING EXAMPLE:
 *    If adapting for multi-tenancy across enterprise sectors during updates:
 *    `'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($this->route('category'))->where('team_id', $this->input('team_id'))]`
 * 2. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add data sanitization before validation runs, override `prepareForValidation()`:
 *    ```php
 *    protected function prepareForValidation(): void
 *    {
 *        if ($this->has('name') && !$this->has('slug')) {
 *            $this->merge([
 *                'slug' => \Str::slug($this->name),
 *            ]);
 *        }
 *    }
 *    ```
 * =============================================================================
 */
