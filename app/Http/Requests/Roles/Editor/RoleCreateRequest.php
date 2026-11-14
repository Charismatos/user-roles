<?php

namespace App\Http\Requests\Roles\Editor;

use App\Http\DTOs\Roles\Editor\RoleData;
use Illuminate\Foundation\Http\FormRequest;

class RoleCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
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
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:roles,slug',
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
