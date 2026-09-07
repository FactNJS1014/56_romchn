<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class Usercontroller extends Controller
{
    /** endpoint สำหรับอ่านค่าแบบ JSON (ถ้าต้องใช้) */
    public function show(Request $request)
    {
        return response()->json($request->session()->get('user_session', []));
    }

    public function clear(Request $request): RedirectResponse
    {
        $request->session()->forget('user_session');

        return back();
    }
}
