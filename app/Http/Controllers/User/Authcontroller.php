<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class Authcontroller extends Controller
{
    private const SESSION_EXPIRE_MINUTES = 60;

    public function GetUserInfo(Request $request)
    {
        if ($request->filled('username')) {
            $existing = $request->session()->get('user_session');

            $isSameUser = $existing
                && ($existing['empno'] ?? null) === $request->query('empno')
                && (now()->timestamp - $existing['created_at']) <= (self::SESSION_EXPIRE_MINUTES * 60);

            if (!$isSameUser) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                $request->session()->put('user_session', [
                    'username'       => $request->query('username'),
                    'empno'          => $request->query('empno'),
                    'department'     => $request->query('department'),
                    'use_permission' => $request->query('USE_PERMISSION'),
                    'sec'            => $request->query('sec'),
                    'msect_id'       => $request->query('MSECT_ID'),
                    'created_at'     => now()->timestamp,
                ]);

                $request->session()->flash('just_logged_in', true);
            }

            return redirect()->route('report');
        }

        $userSession = $request->session()->get('user_session');

        if (!$userSession) {
            abort(403, 'กรุณาเข้าผ่าน URL ที่กำหนดเท่านั้น');
        }

        if (now()->timestamp - $userSession['created_at'] > (self::SESSION_EXPIRE_MINUTES * 60)) {
            $request->session()->forget('user_session');
            abort(403, 'Session หมดอายุ กรุณาเข้าใหม่อีกครั้ง');
        }

        return response()->json($userSession);
    }
}
