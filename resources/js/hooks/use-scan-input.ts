// resources/js/hooks/use-scan-input.ts
import { useCallback, useEffect, useRef } from "react";

type Options = {
    /** เรียกเมื่อยิงจบ — value = ค่าหลัง transform, raw = ค่าดิบจาก scanner */
    onScan: (value: string, raw: string) => void;
    /** แปลงค่าดิบก่อนส่งเข้า onScan — คืน null = รูปแบบไม่ถูกต้อง */
    transform?: (raw: string) => string | null;
    /** เรียกเมื่อ transform คืน null */
    onInvalidFormat?: (raw: string) => void;
    endTimeoutMs?: number;
    minLength?: number;
};

export function useScanInput({
    onScan,
    transform,
    onInvalidFormat,
    endTimeoutMs = 300,
    minLength = 1,
}: Options) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastValue = useRef<string>("");

    // ── ตรงนี้คือที่มาของ ref ทั้งสองตัว ───────────────────────
    const onScanRef = useRef(onScan);
    const onInvalidFormatRef = useRef(onInvalidFormat);
    const transformRef = useRef(transform);

    // sync ทุก render ให้ ref ถือ callback ตัวล่าสุดเสมอ
    onScanRef.current = onScan;
    onInvalidFormatRef.current = onInvalidFormat;
    transformRef.current = transform;
    // ──────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    const commit = useCallback(
        (rawInput: string) => {
            if (timer.current) clearTimeout(timer.current);

            const raw = rawInput.replace(/[\r\n]/g, "").trim();
            if (raw.length < minLength) return;

            // กัน Enter suffix ที่ตามมาหลัง timeout ยิงไปแล้ว
            if (raw === lastValue.current) return;
            lastValue.current = raw;

            const value = transformRef.current
                ? transformRef.current(raw)
                : raw;

            if (value === null) {
                onInvalidFormatRef.current?.(raw);
                return;
            }

            onScanRef.current(value, raw);
        },
        [minLength], // ไม่ต้องใส่ callback เพราะอ่านผ่าน ref แล้ว
    );

    /** ผูกกับ onKeyDown ของ input — จับ Enter/Tab จาก scanner */
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            e.stopPropagation();
            commit(e.currentTarget.value);
        }
    };

    /** เรียกใน onChange — fallback สำหรับเครื่องที่ไม่ตั้ง Enter suffix */
    const scheduleCommit = (value: string) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => commit(value), endTimeoutMs);
    };

    /** เคลียร์สถานะเมื่อเลือก master ใหม่ / reset form */
    const resetScan = () => {
        if (timer.current) clearTimeout(timer.current);
        lastValue.current = "";
    };

    return { inputRef, onKeyDown, scheduleCommit, resetScan, commit };
}