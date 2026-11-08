<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in([User::ROLE_ARTIST, User::ROLE_ADMIN])],
        ]);

        if ($request->user()->is($user) && $validated['role'] !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'نمی‌توانید نقش مدیر حساب خود را حذف کنید.',
            ], 422);
        }

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'نقش کاربر به‌روزرسانی شد.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
