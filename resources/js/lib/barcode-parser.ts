// resources/js/lib/barcode-parser.ts

export type ParsedBarcode = {
    raw: string;        // ค่าดิบจาก scanner
    segments: string[]; // ตัดตามช่องว่าง
    partno: string;     // ค่าที่ต้องการใช้จริง
    lot: string;        // segment[1] เผื่อใช้
    seq: string;        // segment[2] เผื่อใช้
};

/** ตัด CR/LF/Tab จาก scanner แล้วแยก segment ตามช่องว่าง */
export function splitScan(raw: string): string[] {
    return raw
        .replace(/[\r\n\t]/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

// ── เลือกใช้ "แบบใดแบบหนึ่ง" ตามที่ format จริงเป็น ──────────────

/** แบบ A (แนะนำ): regex จับ prefix-4หลัก แล้วเอา 9 หลักถัดมา */
export function extractPartNo_A(raw: string): string | null {
    const seg = splitScan(raw)[0] ?? "";
    const m = seg.match(/^[A-Z0-9]+-\d{4}(\d{9})$/i);
    return m ? m[1] : null;
}

/** แบบ B: เอา 9 ตัวท้ายของ segment แรก (ยืดหยุ่นกว่า ไม่สนรูปแบบ prefix) */
export function extractPartNo_B(raw: string, length = 9): string | null {
    const seg = splitScan(raw)[0] ?? "";
    return seg.length >= length ? seg.slice(-length) : null;
}

/** แบบ C: ตำแหน่งคงที่ (ใช้เมื่อ prefix ยาวเท่ากันทุกใบ) */
export function extractPartNo_C(raw: string): string | null {
    const seg = splitScan(raw)[0] ?? "";
    const v = seg.slice(12, 21);
    return v.length === 9 ? v : null;
}

/** ตัวหลักที่เอาไปใช้ — ลองแบบ A ก่อน ถ้าไม่เข้าค่อย fallback แบบ B */
export function parseScan(raw: string): ParsedBarcode | null {
    const segments = splitScan(raw);
    if (segments.length === 0) return null;

    const partno = extractPartNo_A(raw) ?? extractPartNo_B(raw);
    if (!partno) return null;

    return {
        raw,
        segments,
        partno,
        lot: segments[1] ?? "",
        seq: segments[2] ?? "",
    };
}