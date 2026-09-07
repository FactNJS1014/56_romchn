<?php

namespace App\Http\Middleware\User;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserRequire
{
    protected array $keys = [
        'username',
        'empno',
        'department',
        'USE_PERMISSION',
        'sec',
        'MSECT_ID',
    ];

    protected array $requiredKeys = [
        'username',
        'empno',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // ===== กรณีที่ 1: มี query string เข้ามา (entry point จริง) =====
        if ($request->hasAny($this->keys)) {

            $missing = collect($this->requiredKeys)
                ->filter(fn($key) => ! $request->filled($key))
                ->values();

            if ($missing->isNotEmpty()) {
                $request->session()->forget('user_session');
                abort(403, 'ไม่พบข้อมูล username หรือ empno ใน URL ไม่สามารถเข้าใช้งานได้');
            }

            $data = [];
            foreach ($this->keys as $key) {
                if ($request->filled($key)) {
                    $data[$key] = $request->query($key);
                }
            }

            // ทับ session เก่าด้วยข้อมูลใหม่เสมอ
            session(['user_session' => $data]);

            return redirect()->to($request->url());
        }

        // ===== กรณีที่ 2: ไม่มี query string =====

        $sessionData = session('user_session');
        $hasValidSession = ! empty($sessionData['username']) && ! empty($sessionData['empno']);

        // เช็คว่า request นี้คือหน้า "index / base path" ของระบบหรือไม่
        // รองรับทั้ง http://localhost:8000/ และ http://172.22.64.11/56_romchn/
        if ($this->isBasePath($request)) {

            if ($hasValidSession) {
                // มี session อยู่แล้ว (มาจากการกดเมนูอื่นแล้ววนกลับมา index) -> เข้าได้
                return $next($request);
            }

            // ไม่มี query และไม่มี session เลย -> เข้าตรงๆ ครั้งแรกโดยไม่มีสิทธิ์ -> 403
            $request->session()->forget('user_session');
            abort(403, 'กรุณาเข้าใช้งานผ่านลิงก์ที่ถูกต้อง (ไม่พบ username หรือ empno)');
        }

        // ===== path อื่น ๆ ในแอป (เช่น กดเมนู /dashboard, /report ฯลฯ) =====
        if (! $hasValidSession) {
            abort(403, 'ไม่พบสิทธิ์การเข้าใช้งาน กรุณาเข้าผ่านลิงก์ที่ถูกต้อง');
        }

        return $next($request);
    }

    /**
     * เช็คว่า request path ปัจจุบัน ตรงกับ "base path" ของระบบหรือไม่
     * เช่น base_path = '/'         -> ตรงกับ localhost:8000/
     * เช่น base_path = '/56_romchn' -> ตรงกับ 172.22.64.11/56_romchn หรือ /56_romchn/
     */
    protected function isBasePath(Request $request): bool
    {
        $basePath = trim(config('app.base_path', '/'), '/'); // เอา / หน้า-หลังออก
        $currentPath = trim($request->path(), '/');           // request->path() ไม่มี / นำหน้าอยู่แล้ว

        // ถ้า base_path ตั้งเป็น root ('') ให้เทียบว่า currentPath ว่างเปล่าด้วย (คือ '/')
        return $currentPath === $basePath;
    }
}
