<?php

namespace App\Http\Requests\Roles\Editor;

use App\Http\DTOs\Roles\Editor\RoleAssignedData;
use Illuminate\Foundation\Http\FormRequest;

class RolesAssignedUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Ensure the authenticated user has proper administrative privileges
        return $user && $user->hasAnyRole(['administrator', 'Analyst']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'roles' => [
                'required',
                'array',
                'min:1',
            ],
            'roles.*' => [
                'integer',
                'exists:roles,id',
            ],
            'user_level' => [
                'nullable',
                'integer',
                'min:0',
                'max:99',
            ],
        ];
    }

    /**
     * Custom message definitions for validation feedback.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'roles.required' => 'Please select at least one role to update for this user.',
            'roles.min' => 'Please select at least one role to update for this user.',
            'roles.*.exists' => 'One or more selected roles are invalid or do not exist in the system.',
        ];
    }



    // ... inside RolesAssignedUpdateRequest class:
    public function toDTO(): RoleAssignedData
    {
        return RoleAssignedData::fromUpdateRequest($this);
    }
}
