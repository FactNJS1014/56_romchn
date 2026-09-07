// resources/js/components/QrScannerModal.tsx
import { useEffect } from "react";
import Modal from "@/components/UI/Modal";
import { useCameraScanner } from "@/hooks/use-camera-scanner";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
    open: boolean;
    title?: string;
    onClose: () => void;
    /** ส่งค่าดิบที่สแกนได้กลับไป — ให้ผู้เรียกจัดการ transform/validate เอง */
    onDecoded: (text: string) => void;
};

export default function QrScannerModal({
    open,
    title = "สแกนบาร์โค้ด",
    onClose,
    onDecoded,
}: Props) {
    const { elementId, start, stop, isStarting } = useCameraScanner({
        onDecode: (text) => {
            onDecoded(text);
            onClose(); // ปิด modal ทันทีที่ได้ค่า กันสแกนซ้ำรัว ๆ
        },
        onError: (msg) => {
            console.error(msg);
        },
    });

    useEffect(() => {
        if (open) {
            void start();
        } else {
            void stop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} size="md" title={title}>
            <div className="space-y-3">
                <div
                    id={elementId}
                    className="w-full overflow-hidden rounded-lg border border-slate-300 bg-black"
                    style={{ minHeight: 260 }}
                />
                {isStarting && (
                    <p className="text-center text-sm text-slate-500">
                        กำลังเปิดกล้อง...
                    </p>
                )}
                <p className="text-center text-xs text-slate-400">
                    เล็งกล้องไปที่บาร์โค้ด / QR code ให้อยู่ในกรอบ
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-slate-600 hover:bg-slate-50"
                >
                    <XMarkIcon className="h-4 w-4" />
                    ปิดกล้อง
                </button>
            </div>
        </Modal>
    );
}
