<?php

namespace App\Http\Requests\Auth\Auth;

use App\Http\DTOs\Auth\Guest\UserData;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User|null $currentUser */
        $currentUser = $this->user();

        if (! $currentUser) {
            return false;
        }

        // Retrieve the target user being edited from the route parameter
        $targetUser = $this->route('user');

        // Handle whether the route binds by model instance, ID, or username string
        $isSelf = false;
        if ($targetUser instanceof User) {
            $isSelf = $currentUser->id === $targetUser->id;
        } else {
            $isSelf = $currentUser->id === $targetUser || $currentUser->username === $targetUser;
        }

        // Allow if the user is updating their own profile OR has administrative permission
        return $isSelf || $currentUser->can('update-users');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');
        $userId = is_object($user) ? $user->id : $user;

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
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [
                'nullable',
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
