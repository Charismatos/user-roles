<?php

namespace App\Http\Controllers\Auth\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Auth\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the form for editing the specified user profile.
     */
    public function edit(User $user): View
    {
        return view('Auth.Auth.user-edit', compact('user'));
    }

    /**
     * Update the specified user profile in storage.
     */
    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        $dto = $request->toDTO();
        $data = $dto->toArray();

        if (!empty($dto->password)) {
            $data['password'] = Hash::make($dto->password);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        // Sync roles if provided
        if ($request->has('roles')) {
            $user->syncRoles($request->input('roles'));
        }

        return redirect()->route('dashboard')->with('user_update_success', 'Your profile has been updated successfully.');
    }

    /**
     * Show account deletion confirmation view.
     */
    public function delete(User $user): View
    {
        return view('Auth.Auth.user-delete', compact('user'));
    }

    /**
     * Remove the specified user profile from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('register')->with('user_delete_success', 'Account Removed Successfully.');
    }
}
