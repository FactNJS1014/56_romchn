// Document.tsx
// ไม่ใช่ React component ที่ render ปกติ แต่เป็น "ตัวสร้างเอกสาร" ที่รับรายการ field
// (label/value ที่ผู้เรียกกำหนดเอง) แล้วเปิดแท็บใหม่ จัดหน้าเป็นขนาด A4
// ตัดขึ้นหน้าใหม่อัตโนมัติเมื่อเนื้อหาเกิน ดีไซน์ด้วย Tailwind CSS (โหลดผ่าน CDN)
// รองรับ: value ที่เป็น URL รูปภาพ (หรือ array ของ URL รูปภาพ) -> แสดงเป็นรูปจริง

import axios from "axios";

// Ziggy โหลด route() ไว้เป็น global function อยู่แล้ว (จาก @routes ใน Blade)
declare const route: (name: string, params?: Record<string, any>) => string;

type FieldType = "text" | "image" | "images";

// ขนาดรูปภาพแบบ custom (ใส่เป็น CSS length ได้เลย เช่น "80mm", "300px", "5cm")
export interface ImageSize {
    width?: string;
    height?: string;
}

// field ดิบที่ผู้เรียกกำหนด label/value เอง (value รับ any shape ได้)
// imageSize ใช้เฉพาะตอน value เป็นรูปภาพ (เดี่ยวหรือหลายรูป) เท่านั้น
export interface RawField {
    label: string;
    value: any;
    imageSize?: ImageSize;
}

interface DocumentField {
    label: string;
    type: FieldType;
    value: string | string[];
    imageSize?: ImageSize;
}

export interface EmployeeName {
    FName: string;
    LName: string;
}

// @page ใช้กำหนดขนาดกระดาษตอนพิมพ์ (ไม่มี utility class ของ Tailwind สำหรับส่วนนี้
// จึงต้องเขียน CSS ตรงๆ ที่จุดนี้จุดเดียว ส่วนที่เหลือใช้ Tailwind ทั้งหมด)
const PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: #ffffff !important; }
  }
`;

// escape ให้ปลอดภัยทั้งตอนใช้เป็น text content และตอนใช้ใน attribute (src, alt)
function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function isImageUrl(value: string): boolean {
    const v = value.trim();
    if (v.startsWith("data:image/")) return true;
    return /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(v);
}

/**
 * ดึงชื่อ-นามสกุลพนักงานจาก EmpID ผ่าน API route "api.user-master-appr-settings"
 * (Ziggy route() helper resolve URL ให้ตาม route ที่ตั้งชื่อไว้ฝั่ง Laravel)
 * ใช้ประกอบตอนสร้าง fields เอง ก่อนเรียก openInfoDocument
 *
 * ปรับ path การอ่านค่าใน payload ให้ตรงกับ response จริงของ API ถ้าจำเป็น
 */
export async function fetchEmployeeName(
    empId: string,
): Promise<EmployeeName | null> {
    try {
        const url = route("api.user-master-appr-settings", { EmpID: empId });
        const { data } = await axios.get(url);

        const payload = data?.data ?? data;
        const FName = payload?.FName ?? "";
        const LName = payload?.LName ?? "";

        if (!FName && !LName) return null;
        return { FName, LName };
    } catch (err) {
        console.error("fetchEmployeeName error:", err);
        return null;
    }
}

// รับ field ที่ผู้เรียก custom label/value มาเองแล้ว -> จัดประเภท (text/image/images)
// เพื่อเลือกวิธี render ให้ถูกแบบ
function toFields(fields: RawField[]): DocumentField[] {
    return fields.map(({ label, value, imageSize }) => {
        if (typeof value === "string" && isImageUrl(value)) {
            return { label, type: "image", value, imageSize };
        }

        if (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((v) => typeof v === "string" && isImageUrl(v))
        ) {
            return { label, type: "images", value, imageSize };
        }

        const text =
            value === null || value === undefined
                ? ""
                : typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value);
        return { label, type: "text", value: text };
    });
}

// รูปเดียว: มี fallback ถ้าโหลดรูปไม่สำเร็จ, กำหนดขนาดเองได้ผ่าน size (default: max-h-[100mm])
function renderImage(url: string, label: string, size?: ImageSize): string {
    const safeUrl = escapeHtml(url);
    const safeLabel = escapeHtml(label);

    const sizeClasses = [
        size?.width ? `w-[${size.width}]` : "max-w-full",
        size?.height ? `h-[${size.height}]` : "max-h-[100mm]",
    ].join(" ");

    return `
    <div class="relative inline-block">
      <img
        src="${safeUrl}"
        alt="${safeLabel}"
        class="${sizeClasses} rounded-md border border-gray-200 object-contain bg-gray-50"
        onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
      />
      <span class="hidden text-xs text-red-500">ไม่สามารถโหลดรูปภาพได้</span>
    </div>
  `;
}

// รูปหลายรูป: แสดงเป็น gallery ย่อๆ เรียงต่อกัน, กำหนดขนาดเองได้ผ่าน size (default: 60mm x 60mm)
function renderImages(urls: string[], label: string, size?: ImageSize): string {
    const width = size?.width ?? "60mm";
    const height = size?.height ?? "60mm";

    const thumbs = urls
        .map(
            (url) => `
        <div class="relative inline-block">
          <img
            src="${escapeHtml(url)}"
            alt="${escapeHtml(label)}"
            class="w-[${width}] h-[${height}] rounded-md border border-gray-200 object-cover bg-gray-50"
            onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
          />
          <span class="hidden text-xs text-red-500">โหลดไม่สำเร็จ</span>
        </div>`,
        )
        .join("");
    return `<div class="flex flex-wrap gap-3">${thumbs}</div>`;
}

function renderFieldValue(f: DocumentField): string {
    if (f.type === "image")
        return renderImage(f.value as string, f.label, f.imageSize);
    if (f.type === "images")
        return renderImages(f.value as string[], f.label, f.imageSize);
    return `<span class="whitespace-pre-wrap break-words">${escapeHtml(f.value as string)}</span>`;
}

function buildDocumentHtml(
    title: string,
    fields: DocumentField[],
    fieldsPerPage: number,
): string {
    const pages: DocumentField[][] = [];
    for (let i = 0; i < fields.length; i += fieldsPerPage) {
        pages.push(fields.slice(i, i + fieldsPerPage));
    }
    if (pages.length === 0) pages.push([]);

    const pagesHtml = pages
        .map((pageFields, pageIndex) => {
            const isLast = pageIndex === pages.length - 1;

            const rows = pageFields
                .map(
                    (f) => `
            <div class="grid grid-cols-3 break-inside-avoid odd:bg-gray-50">
              <div class="col-span-1 px-4 py-2.5 text-sm font-medium text-gray-600 border-b border-gray-200">
                ${escapeHtml(f.label)}
              </div>
              <div class="col-span-2 px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                ${renderFieldValue(f)}
              </div>
            </div>`,
                )
                .join("");

            return `
        <section
          class="w-[210mm] min-h-[297mm] mx-auto my-[10mm] bg-white shadow-lg p-[15mm]
                 print:shadow-none print:my-0
                 ${isLast ? "break-after-auto" : "break-after-page"}"
        >
          <header class="mb-6 flex items-end justify-between border-b border-gray-300 pb-3">
            <h1 class="text-xl font-bold text-gray-900">${escapeHtml(title)}</h1>
            <span class="text-xs text-gray-500">หน้า ${pageIndex + 1} จาก ${pages.length}</span>
          </header>

          <div class="rounded-lg border border-gray-200 overflow-hidden">
            ${rows}
          </div>
        </section>
      `;
        })
        .join("");

    return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>${PRINT_STYLES}</style>
</head>
<body class="bg-gray-200 print:bg-white">
${pagesHtml}
</body>
</html>`;
}

/**
 * openInfoDocument
 * ------------------
 * รับ "fields" ที่ผู้เรียก custom label/value เองแล้ว (ไม่ auto-derive จาก data object)
 * เปิดแท็บใหม่ แสดงเป็นเอกสารขนาด A4 ตัดขึ้นหน้าใหม่อัตโนมัติเมื่อฟิลด์เยอะเกิน 1 หน้า
 * value ไหนเป็น URL รูปภาพ (หรือ array ของ URL รูปภาพ) จะถูก render เป็นรูปจริงให้อัตโนมัติ
 *
 * ใช้งาน:
 *   const employee = await fetchEmployeeName(String(data.EmpID));
 *   openInfoDocument("ข้อมูลรายการ", [
 *     { label: "รหัสพนักงาน", value: data.EmpID },
 *     { label: "ชื่อ-นามสกุล", value: employee ? `${employee.FName} ${employee.LName}` : "-" },
 *     { label: "แผนก", value: data.Department },
 *     { label: "รูปภาพ", value: data.Photo, imageSize: { width: "80mm", height: "80mm" } },
 *   ]);
 */
export function openInfoDocument(
    title: string,
    fields: RawField[],
    fieldsPerPage = 20,
): void {
    const documentFields = toFields(fields);
    const html = buildDocumentHtml(title, documentFields, fieldsPerPage);

    // ต้องเรียก window.open ทันทีใน click handler (synchronous)
    // ไม่งั้น popup blocker จะบล็อกแท็บใหม่
    const win = window.open("", "_blank");
    if (!win) {
        alert("กรุณาอนุญาต popup สำหรับเว็บไซต์นี้ เพื่อเปิดดูเอกสาร");
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}
