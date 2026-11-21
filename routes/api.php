<?php

use App\Http\Controllers\Api\Categories\Editor\CategoryApiController;
use App\Http\Controllers\Api\Geographies\Editor\GeographyApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --------------------------------------------------------------------------
//  API Routes
// --------------------------------------------------------------------------

//  Here is where you can register API routes for your application. These
//  routes are loaded by the RouteServiceProvider and all of them will
//  be assigned to the "api" middleware group. Make something great!

Route::prefix('v1')
    ->middleware(['api']) // Applies default API middleware (throttle, substitute bindings)
    ->group(function () {

        // Public or protected child-fetching route for cascading dropdowns
        Route::get('/categories/{category}/children', [CategoryApiController::class, 'getChildren'])
            ->name('api.v1.categories.children');

        // Store, Update (Patch), and Delete routes protected by Sanctum
        Route::post('/categories', [CategoryApiController::class, 'store'])
            ->middleware('auth:sanctum')
            ->name('api.v1.categories.store');
        Route::patch('/categories/{category}', [CategoryApiController::class, 'update'])
            ->middleware('auth:sanctum')
            ->name('api.v1.categories.update');
        Route::delete('/categories/{category}', [CategoryApiController::class, 'destroy'])
            ->middleware('auth:sanctum')
            ->name('api.v1.categories.destroy'); // <-- Crucial: This populates Auth::user();

    });

Route::prefix('v1')
    ->middleware(['api']) // Applies default API middleware (throttle, substitute bindings)
    ->group(function () {

        // Public or protected child-fetching route for cascading dropdowns
        Route::get('/geographies/{geography}/children', [GeographyApiController::class, 'getChildren'])
            ->name('api.v1.geographies.children');

        // Store, Update (Patch), and Delete routes protected by Sanctum
        Route::post('/geographies', [GeographyApiController::class, 'store'])
            ->middleware('auth:sanctum')
            ->name('api.v1.geographies.store');
        Route::patch('/geographies/{geography}', [GeographyApiController::class, 'update'])
            ->middleware('auth:sanctum')
            ->name('api.v1.geographies.update');
        Route::delete('/geographies/{geography}', [GeographyApiController::class, 'destroy'])
            ->middleware('auth:sanctum')
            ->name('api.v1.geographies.destroy'); // <-- Crucial: This populates Auth::user();

    });
