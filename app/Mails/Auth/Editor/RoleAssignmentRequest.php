<?php

namespace App\Http\Requests\Auth\Editor;

use App\Http\DTOs\Auth\Editor\RoleData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class RoleAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ensure the user is authenticated and authorized to perform role assignments
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_level' => [
                'nullable',
                'integer',
                'min:0',
                'max:99',
            ],
            'roles' => [
                'required',
                'array',
            ],
            'roles.*' => [
                'required',
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'user_level' => 'target hierarchy level',
            'roles' => 'assigned roles collection',
            'roles.*' => 'role identifier',
        ];
    }

    /**
     * Map validated role IDs into a structured DTO object or data collection.
     *
     * @return object{roleIds: array<int>, userLevel: ?int}
     */
    public function toDTO(): object
    {
        $validated = $this->validated();

        return (object) [
            'roleIds'   => array_map('intval', $validated['roles'] ?? []),
            'userLevel' => isset($validated['user_level']) ? (int) $validated['user_level'] : null,
        ];
    }
}
