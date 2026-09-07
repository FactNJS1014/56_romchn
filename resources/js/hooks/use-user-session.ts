import { usePage } from '@inertiajs/react';
import type { SharedData, UserSession } from '@/types';

export function useUserSession(): UserSession {
    const { userSession } = usePage<SharedData>().props;
    return userSession ?? {};
}

/** ตรวจสิทธิ์ เช่น useHasPermission(5) */
export function useHasPermission(level: number): boolean {
    const { USE_PERMISSION } = useUserSession();
    return (USE_PERMISSION ?? 0) >= level;
}