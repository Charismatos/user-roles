<?php

namespace App\Http\Controllers\Auth\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        return view('Auth.Guest.home');
    }
}
