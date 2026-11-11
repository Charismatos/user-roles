<?php

namespace App\Http\Controllers\Auth\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class UserDashboardController extends Controller
{
    /**
     * Display the authenticated user dashboard.
     */
    public function show(Request $request): View
    {
        $user = $request->user()->load('roles');

        return view('Auth.Auth.user-dashboard', compact('user'));
    }
}
