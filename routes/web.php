<?php

use App\Http\Controllers\Auth\Guest\HomeController;
use App\Http\Controllers\Auth\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\Auth\ProfileSetupController;
use App\Http\Controllers\Auth\Auth\UserController;
use App\Http\Controllers\Auth\Auth\UserDashboardController;
use App\Http\Controllers\Auth\Guest\RegisterUserController;
use App\Http\Controllers\Roles\Editor\RoleController;
use App\Http\Controllers\Roles\Editor\RoleManagementController;
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
Route::get('/users/{user}/roles/confirm-agreement', [RoleManagementController::class, 'confirmAgreement'])
    ->name('users.roles.confirm-agreement');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Basic Auth)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'show'])->name('dashboard');
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
    Route::get('/users/roles', [RoleManagementController::class, 'assignedIndex'])->name('roles.assigned.index');
    Route::get('/users/roles/assign', [RoleManagementController::class, 'assignView'])->name('users.roles.assign');
    Route::get('/users/roles/invite', [RoleManagementController::class, 'inviteView'])->name('users.roles.invite');
    Route::post('/users/roles/send-invites', [RoleManagementController::class, 'sendInvitations'])->name('users.roles.send-invites');

    // Specific User Role Form Edit & Show/Update Routes
    Route::get('/users/{user}/roles/edit', [RoleManagementController::class, 'editRolesAssigned'])->name('users.roles.edit');
    Route::get('/users/{user}/roles', [RoleManagementController::class, 'assignedShow'])->name('users.roles.show');
    Route::match(['put', 'patch'], '/users/{user}/roles', [RoleManagementController::class, 'updateRolesAssigned'])->name('users.roles.update');

    // 2. System Roles CRUD & Specialized Filters
    // (Static paths MUST be placed BEFORE wildcards like {role:slug})
    Route::get('/roles/by-level/create', [RoleManagementController::class, 'rolesByLevelCreate'])->name('roles.by-level.create');
    Route::get('/users/{user}/roles/by-level/update', [RoleManagementController::class, 'rolesByLevelUpdate'])->name('roles.by-level.update');
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');

    // 3. System Roles Wildcard Management (Using slug binding)
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::match(['put', 'patch'], 'roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
});
