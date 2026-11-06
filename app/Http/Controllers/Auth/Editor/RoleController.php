<?php

namespace App\Http\Controllers\Auth\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Editor\RoleCreateRequest;
use App\Http\Requests\Auth\Editor\RoleUpdateRequest;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class RoleController extends Controller
{
    /**
     * Display a listing of all system roles.
     */
    public function index(): JsonResponse|View
    {
        $roles = Role::orderedByLevel()->get();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data'    => $roles,
            ]);
        }

        return view('auth.editor.roles.index', compact('roles'));
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): View
    {
        return view('auth.editor.roles.create');
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(RoleCreateRequest $request): JsonResponse|RedirectResponse
    {
        // Map validated data into the RoleData DTO
        $dto = $request->toDto();

        $role = Role::create($dto->toArray());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Role created successfully.',
                'data'    => $role,
            ], 201);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role details.
     */
    public function show(Role $role): JsonResponse|View
    {
        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data'    => $role,
            ]);
        }

        return view('auth.editor.roles.show', compact('role'));
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): View
    {
        return view('auth.editor.roles.edit', compact('role'));
    }

    /**
     * Update the specified role in storage.
     */
    public function update(RoleUpdateRequest $request, Role $role): JsonResponse|RedirectResponse
    {
        // Prevent updating protected system roles status inappropriately
        if ($role->is_system && $request->boolean('is_system') === false) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Protected system status cannot be disabled for this role.',
                ], 422);
            }

            return redirect()
                ->back()
                ->withErrors(['is_system' => 'Protected system status cannot be disabled for this role.']);
        }

        $dto = $request->toDto();

        $role->update($dto->toArray());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully.',
                'data'    => $role,
            ]);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): JsonResponse|RedirectResponse
    {
        // Guard 1: Prevent deletion of core system roles
        if ($role->is_system) {
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Protected system roles cannot be deleted.',
                ], 403);
            }

            return redirect()
                ->route('roles.index')
                ->with('error', 'Protected system roles cannot be deleted.');
        }

        // Guard 2: Check if role still has active users attached
        if ($role->users()->exists()) {
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete a role that is currently assigned to active users.',
                ], 422);
            }

            return redirect()
                ->route('roles.index')
                ->with('error', 'Cannot delete a role that is currently assigned to active users.');
        }

        $role->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully.',
            ]);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
