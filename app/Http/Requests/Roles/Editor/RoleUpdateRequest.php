<?php

namespace App\Http\Requests\Roles\Editor;

use App\Http\DTOs\Roles\Editor\RoleData;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Authorized if the user is authenticated and the target role's hierarchy level
     * is greater in integer value than the user's own highest role level
     * (e.g., a user at level 3 can only update roles at level 4, 5, 6, etc.).
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user->hasAnyRole(['administrator', 'Analyst', 'Researcher']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $role = $this->route('role');
        $roleId = is_object($role) ? $role->id : $role;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('roles', 'slug')->ignore($roleId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'level' => [
                'required',
                'integer',
                'min:0',
                'max:999',
            ],
            'is_system' => [
                'nullable',
                'boolean',
            ],
            'permissions' => [
                'nullable',
                'array',
            ],
            'permissions.*' => [
                'string',
                'exists:permissions,name',
            ],
        ];
    }

    /**
     * Map validated data into the RoleData DTO.
     */
    public function toDto(): RoleData
    {
        return RoleData::fromArray($this->validated());
    }
}
