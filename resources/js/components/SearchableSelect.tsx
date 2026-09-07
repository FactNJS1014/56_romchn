import React, { useState, useEffect, useRef, useMemo } from "react";

/**
 * SearchableSelect
 * -------------------------------------------------------
 * Controlled combobox: รับ options ที่แม็พไว้แล้วจากภายนอก
 * (ไม่ fetch เอง), ค้นหาแบบไม่สนตัวพิมพ์เล็กใหญ่/อักขระพิเศษ
 * และรองรับการ "พิมพ์ท้ายคำ" เช่นพิมพ์ 3 ตัวท้ายของรหัสรุ่น
 * ก็ยังหาเจอ เพราะใช้ includes() ไม่ใช่ startsWith()
 *
 * ตัวอย่างการใช้งาน:
 * <SearchableSelect
 *   options={modelName.map((item) => ({ id: item, label: item }))}
 *   value={data.modelname}
 *   onChange={(val) => setData("modelname", val)}
 *   minSearchLength={3}
 *   searchPlaceholder="พิมพ์ 3 ตัวท้าย.."
 * />
 * -------------------------------------------------------
 */

export interface SelectOption {
    id: string;
    label: string;
    description?: string;
}

export interface SearchableSelectProps {
    options: SelectOption[];
    /** ค่าที่เลือกอยู่ (อ้างอิงตาม option.id) */
    value?: string;
    onChange: (value: string) => void;
    /** จำนวนตัวอักษรขั้นต่ำก่อนเริ่มค้นหา/กรองผลลัพธ์ (default 0 = กรองทันที) */
    minSearchLength?: number;
    searchPlaceholder?: string;
    label?: string;
    disabled?: boolean;
    /** จำนวนผลลัพธ์สูงสุดที่แสดงในดรอปดาวน์ */
    maxResults?: number;
    /** อนุญาตให้ล้างค่าที่เลือกได้ */
    clearable?: boolean;
}

const normalize = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9ก-๙]/gi, "");

export default function SearchableSelect({
    options,
    value,
    onChange,
    minSearchLength = 0,
    searchPlaceholder = "พิมพ์เพื่อค้นหา...",
    label,
    disabled = false,
    maxResults = 20,
    clearable = true,
}: SearchableSelectProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(
        () => options.find((opt) => opt.id === value) ?? null,
        [options, value],
    );

    // sync ค่าที่แสดงในช่อง input กับ value ภายนอก เมื่อผู้ใช้ไม่ได้กำลังพิมพ์อยู่
    useEffect(() => {
        if (!isEditing) {
            setQuery(selectedOption ? selectedOption.label : "");
        }
    }, [selectedOption, isEditing]);

    // ปิด dropdown เมื่อคลิกนอกกล่อง แล้วคืนค่าช่อง input ให้ตรงกับ value เดิม
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setIsEditing(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const reachedMinLength = query.trim().length >= minSearchLength;

    const filteredOptions = useMemo(() => {
        if (!reachedMinLength) return [];
        const q = normalize(query);
        if (!q) return options.slice(0, maxResults);
        return options
            .filter((opt) => normalize(opt.label).includes(q))
            .slice(0, maxResults);
    }, [options, query, maxResults, reachedMinLength]);

    const handleSelect = (option: SelectOption) => {
        onChange(option.id);
        setQuery(option.label);
        setIsOpen(false);
        setIsEditing(false);
        setActiveIndex(-1);
    };

    const handleClear = () => {
        onChange("");
        setQuery("");
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") setIsOpen(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                handleSelect(filteredOptions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setIsEditing(false);
            setQuery(selectedOption ? selectedOption.label : "");
            setActiveIndex(-1);
        }
    };

    const renderHighlighted = (labelText: string) => {
        const q = normalize(query);
        if (!q) return labelText;
        const normLabel = normalize(labelText);
        const idx = normLabel.indexOf(q);
        if (idx === -1) return labelText;

        let normPos = 0;
        let start = -1;
        let end = -1;
        for (let i = 0; i < labelText.length; i++) {
            const charNorm = normalize(labelText[i]);
            if (charNorm) {
                if (normPos === idx) start = i;
                normPos += charNorm.length;
                if (normPos === idx + q.length) {
                    end = i + 1;
                    break;
                }
            }
        }
        if (start === -1 || end === -1) return labelText;

        return (
            <>
                {labelText.slice(0, start)}
                <span className="bg-yellow-200 text-gray-900 font-semibold rounded-sm">
                    {labelText.slice(start, end)}
                </span>
                {labelText.slice(end)}
            </>
        );
    };

    const remaining = Math.max(minSearchLength - query.trim().length, 0);

    return (
        <div ref={wrapperRef} className="w-full max-w-md relative">
            {label && (
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                <input
                    type="text"
                    disabled={disabled}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsEditing(true);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => {
                        setIsEditing(true);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    className="w-full py-2.5 px-4 pl-9 pr-9 text-sm rounded-lg border border-gray-300
                     bg-white text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                     transition-colors"
                />

                {clearable && query && !disabled && (
                    <button
                        type="button"
                        aria-label="ล้างค่า"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-lg
                     border border-gray-200 bg-white shadow-lg py-1"
                >
                    {!reachedMinLength && (
                        <li className="px-4 py-2 text-sm text-gray-400">
                            พิมพ์อีก {remaining} ตัวอักษรเพื่อค้นหา
                        </li>
                    )}

                    {reachedMinLength && filteredOptions.length === 0 && (
                        <li className="px-4 py-2 text-sm text-gray-400">
                            ไม่พบข้อมูลที่ตรงกับ "{query}"
                        </li>
                    )}

                    {reachedMinLength &&
                        filteredOptions.map((opt, index) => (
                            <li
                                key={opt.id}
                                role="option"
                                aria-selected={value === opt.id}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(opt);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`px-4 py-2 text-sm cursor-pointer flex flex-col
                  ${
                      index === activeIndex
                          ? "bg-blue-50 text-blue-700"
                          : value === opt.id
                            ? "bg-blue-50/50 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                  }`}
                            >
                                <span>{renderHighlighted(opt.label)}</span>
                                {opt.description && (
                                    <span className="text-xs text-gray-400">
                                        {opt.description}
                                    </span>
                                )}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
