// resources/js/hooks/use-camera-scanner.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Options = {
    onDecode: (text: string) => void;
    onError?: (message: string) => void;
};

export function useCameraScanner({ onDecode, onError }: Options) {
    const elementIdRef = useRef(
        `qr-reader-${Math.random().toString(36).slice(2)}`,
    );
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const onDecodeRef = useRef(onDecode);
    const onErrorRef = useRef(onError);
    onDecodeRef.current = onDecode;
    onErrorRef.current = onError;

    const start = useCallback(async () => {
        if (isRunning || isStarting) return;
        setIsStarting(true);

        try {
            const scanner = new Html5Qrcode(elementIdRef.current, {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.DATA_MATRIX,
                ],
                verbose: false,
            });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" }, // กล้องหลัง
                { fps: 10, qrbox: { width: 280, height: 160 } },
                (decodedText) => {
                    onDecodeRef.current(decodedText);
                },
                () => {
                    // เรียกทุกเฟรมที่ยังไม่เจอ — เงียบไว้ ไม่ต้อง log
                },
            );

            setIsRunning(true);
        } catch (err) {
            onErrorRef.current?.(
                err instanceof Error ? err.message : "เปิดกล้องไม่สำเร็จ",
            );
        } finally {
            setIsStarting(false);
        }
    }, [isRunning, isStarting]);

    const stop = useCallback(async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;
        try {
            if (scanner.isScanning) await scanner.stop();
            scanner.clear();
        } catch {
            // เพิกเฉย error ตอนปิดกล้อง
        } finally {
            scannerRef.current = null;
            setIsRunning(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            void stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        elementId: elementIdRef.current,
        start,
        stop,
        isRunning,
        isStarting,
    };
}
