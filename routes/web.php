<?php

use App\Http\Controllers\Auth\Guest\HomeController;
use App\Http\Controllers\Auth\Editor\RoleController;
use App\Http\Controllers\Auth\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\Auth\ProfileSetupController;
use App\Http\Controllers\Auth\Auth\UserController;
use App\Http\Controllers\Auth\Auth\UserDashboardController;
use App\Http\Controllers\Auth\Editor\RoleManagementController;
use App\Http\Controllers\Auth\Guest\RegisterUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Guest Routes (Unauthenticated Users)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterUserController::class, 'register'])->name('register');
    Route::post('/register', [RegisterUserController::class, 'store'])->name('register.store');

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

/*
|--------------------------------------------------------------------------
| Signed Invitation Confirmation Route (Email Link Landing)
|--------------------------------------------------------------------------
*/
Route::get('/users/{user}/roles/confirm-invitation', [RoleManagementController::class, 'confirmInvitation'])
    ->name('users.roles.confirm-invitation')
    ->middleware('signed');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Basic Auth)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // User Profile Management
    Route::prefix('users')->group(function () {
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::patch('/{user}', [UserController::class, 'update'])->name('users.update');
        Route::get('/{user}/delete', [UserController::class, 'delete'])->name('users.delete-confirm');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Profile Setup
    Route::match(['get', 'post'], '/profile/setup', [ProfileSetupController::class, 'profileSetup'])->name('profile-setup');
});

/*
|--------------------------------------------------------------------------
| Admin & Access Control Management Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // 1. User Role Index, Assignment, and Invocation Management
    // (Static paths MUST be placed BEFORE wildcards like {user})
    Route::get('/users/roles', [RoleManagementController::class, 'assignedIndex'])->name('users.roles.index');
    Route::get('/users/roles/assign', [RoleManagementController::class, 'assignView'])->name('users.roles.assign');
    Route::post('/users/roles/send-invites', [RoleManagementController::class, 'sendInvitations'])->name('users.roles.send-invites');

    Route::get('/users/{user}/roles', [RoleManagementController::class, 'assignedShow'])->name('users.roles.show');
    Route::put('/users/{user}/roles', [RoleManagementController::class, 'updateRoles'])->name('users.roles.update');

    // 2. System Roles CRUD & Specialized Filters
    // (Static paths MUST be placed BEFORE wildcards like {role:slug})
    Route::get('/roles/by-level', [RoleManagementController::class, 'getRolesByLevel'])->name('roles.by-level');
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');

    // 3. System Roles Wildcard Management (Using slug binding)
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::match(['put', 'patch'], 'roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
});
