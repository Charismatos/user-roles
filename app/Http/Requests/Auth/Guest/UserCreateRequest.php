<?php

namespace App\Http\Requests\Auth\Guest;

use App\Http\DTOs\Auth\Guest\UserData;
use Illuminate\Foundation\Http\FormRequest;

class UserCreateRequest extends FormRequest
{
    protected $errorBag = 'default';
    /**
     * Prepare the data and dynamically set the error bag.
     */
    protected function prepareForValidation(): void
    {
        // Check if a custom error bag was passed via request input or route parameters,
        // otherwise gracefully fall back to Laravel's 'default' error bag.
        $this->errorBag = $this->input('error_bag') ?? $this->route('error_bag') ?? 'default';
    }

    /**
     * Determine if the user is authorized to make this request.
     * If only authenticated administrators with permissions can create users via this form:
     */
    // public function authorize(): bool
    // {
    //     return $this->user()?->can('create-users') ?? true;
    // }

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
            ],
            'username' => [
                'nullable',
                'string',
                'max:255',
                // 'unique:users,username',
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
            ],
            'roles' => [
                'nullable',
                'array',
            ],
            'roles.*' => [
                'string',
                'exists:roles,slug',
            ],
        ];
    }

    /**
     * Map validated data into the UserData DTO.
     */
    public function toDTO(): UserData
    {
        return UserData::fromArray($this->validated());
    }
}
