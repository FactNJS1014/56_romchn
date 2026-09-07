// resources/js/hooks/use-device-type.ts
import { useEffect, useState } from "react";

export type DeviceType = "desktop" | "tablet" | "mobile";

/**
 * ตรวจแบบ heuristic — ไม่มี API ไหนบอก "นี่คือคอมหรือแท็บเล็ต" ตรง ๆ 100%
 * ใช้ร่วมกัน 3 สัญญาณ: touch points, user agent, ขนาดจอ
 */
function detectDeviceType(): DeviceType {
    if (typeof window === "undefined") return "desktop";

    const ua = navigator.userAgent;
    const hasTouch = navigator.maxTouchPoints > 0;
    const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet|SM-X|SM-T/i.test(ua);
    const isMobileUA = /Mobile|iPhone|Android.*Mobile/i.test(ua);

    if (isMobileUA && !isTabletUA) return "mobile";
    if (isTabletUA || (hasTouch && !isMobileUA)) return "tablet";
    return "desktop";
}

export function useDeviceType() {
    const [deviceType, setDeviceType] = useState<DeviceType>(() =>
        detectDeviceType(),
    );

    useEffect(() => {
        setDeviceType(detectDeviceType());
    }, []);

    return deviceType;
}
