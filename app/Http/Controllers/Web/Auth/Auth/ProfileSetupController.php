<?php

namespace App\Http\Controllers\Web\Auth\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProfileSetupController extends Controller
{
    /**
     * Handle profile setup view or submission process.
     */
    public function profileSetup(Request $request): View|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($request->isMethod('post')) {
            $validated = $request->validate([
                'username' => ['required', 'string', 'max:255', 'unique:users,username,'.$user->id],
                'name' => ['required', 'string', 'max:255'],
            ]);

            $user->update($validated);

            return redirect()->route('dashboard')->with('success', 'Profile configuration completed successfully.');
        }

        return view('Auth.Auth.profile-setup', compact('user'));
    }
}
