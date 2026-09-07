import { useState, useRef, useEffect, useMemo } from "react";

export interface MultiSelectOption {
    label: string;
    value: string | number;
}

interface MultiSelectProps {
    /** รายการตัวเลือกทั้งหมด (มักมาจาก API) */
    options?: MultiSelectOption[];
    /** ค่าที่ถูกเลือกอยู่ (array ของ value) */
    value?: (string | number)[];
    /** callback เมื่อค่าที่เลือกเปลี่ยน */
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    label?: string;
    /** แสดงสถานะกำลังโหลดข้อมูลจาก API */
    isLoading?: boolean;
    disabled?: boolean;
    error?: string;
}

export default function MultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = "เลือกรายการ...",
    label,
    isLoading = false,
    disabled = false,
    error,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // ปิด dropdown เมื่อคลิกนอกกล่อง
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase()),
        );
    }, [options, search]);

    const selectedOptions = useMemo(
        () => options.filter((opt) => value.includes(opt.value)),
        [options, value],
    );

    function toggleOption(optValue: string | number) {
        if (value.includes(optValue)) {
            onChange(value.filter((v) => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    }

    function removeOption(optValue: string | number, e: React.MouseEvent) {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optValue));
    }

    function clearAll(e: React.MouseEvent) {
        e.stopPropagation();
        onChange([]);
    }

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    disabled={disabled || isLoading}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`flex min-h-[42px] w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition
            ${error ? "border-red-400" : "border-slate-300"}
            ${
                disabled || isLoading
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-white hover:border-slate-400"
            }
            ${isOpen ? "border-indigo-500 ring-2 ring-indigo-500" : ""}
          `}
                >
                    <div className="flex flex-1 flex-wrap gap-1">
                        {isLoading ? (
                            <span className="text-slate-400">
                                กำลังโหลดข้อมูล...
                            </span>
                        ) : selectedOptions.length === 0 ? (
                            <span className="text-slate-400">
                                {placeholder}
                            </span>
                        ) : (
                            selectedOptions.map((opt) => (
                                <span
                                    key={opt.value}
                                    className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                                >
                                    {opt.label}
                                    <span
                                        role="button"
                                        aria-label={`ลบ ${opt.label}`}
                                        onClick={(e) =>
                                            removeOption(opt.value, e)
                                        }
                                        className="cursor-pointer text-indigo-400 hover:text-indigo-700"
                                    >
                                        ×
                                    </span>
                                </span>
                            ))
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        {selectedOptions.length > 0 && !disabled && (
                            <span
                                role="button"
                                onClick={clearAll}
                                className="px-1 text-xs text-slate-400 hover:text-slate-600"
                                title="ล้างทั้งหมด"
                            >
                                ล้าง
                            </span>
                        )}
                        <svg
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                                isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </button>

                {isOpen && !disabled && !isLoading && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="border-b border-slate-100 p-2">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหา..."
                                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                            />
                        </div>

                        <ul className="max-h-56 overflow-y-auto py-1">
                            {filteredOptions.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-slate-400">
                                    ไม่พบข้อมูล
                                </li>
                            ) : (
                                filteredOptions.map((opt) => {
                                    const checked = value.includes(opt.value);
                                    return (
                                        <li
                                            key={opt.value}
                                            onClick={() =>
                                                toggleOption(opt.value)
                                            }
                                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                readOnly
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span
                                                className={
                                                    checked
                                                        ? "font-medium text-slate-800"
                                                        : "text-slate-600"
                                                }
                                            >
                                                {opt.label}
                                            </span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
