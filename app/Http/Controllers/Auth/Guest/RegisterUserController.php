<?php

namespace App\Http\Controllers\Auth\Guest;

use App\Http\Controllers\Controller;
use App\DTOs\Auth\Guest\UserData;
use App\Http\Requests\Auth\Guest\UserCreateRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class RegisterUserController extends Controller
{
    /**
     * Show the registration view.
     */
    public function register(): View
    {
        return view('Auth.Guest.user-register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(UserCreateRequest $request): RedirectResponse
    {
        // Use your FormRequest's built-in DTO mapper or validated data
        $validatedData = $request->validated();

        $userData = UserData::fromArray([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        $user = User::create($userData->toArray());

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Registration successful.');
    }
}
