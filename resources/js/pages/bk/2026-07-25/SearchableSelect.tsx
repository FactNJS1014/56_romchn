import {
    useEffect,
    useRef,
    useState,
    useLayoutEffect,
    useCallback,
} from "react";
import { createPortal } from "react-dom";

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    isInvalid?: boolean;
    searchPlaceholder?: string;
    // เรียกเมื่อพิมพ์ในช่องค้นหา (debounce ให้แล้ว) — ใช้สำหรับยิง API ค้นหาฝั่งเซิร์ฟเวอร์
    onSearchChange?: (query: string) => void;
    // ดีเลย์ก่อนยิง onSearchChange (ms) ค่าเริ่มต้น 300ms
    debounceMs?: number;
    // ความยาวขั้นต่ำของ query ก่อนจะเริ่มยิง API ค่าเริ่มต้น 4 (ตรงกับเลข 4 ตัวท้าย)
    minSearchLength?: number;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "เลือก...",
    disabled = false,
    loading = false,
    isInvalid = false,
    searchPlaceholder = "ค้นหา...",
    onSearchChange,
    debounceMs = 300,
    minSearchLength = 4,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });
    };

    useLayoutEffect(() => {
        if (isOpen) updatePosition();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handle = () => updatePosition();
        window.addEventListener("scroll", handle, true);
        window.addEventListener("resize", handle);
        return () => {
            window.removeEventListener("scroll", handle, true);
            window.removeEventListener("resize", handle);
        };
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                buttonRef.current &&
                !buttonRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setHighlightIndex(0);
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    // debounce เรียก onSearchChange เมื่อ query เปลี่ยน (เฉพาะตอนความยาวถึงเกณฑ์ที่กำหนด)
    const triggerSearch = useCallback(
        (q: string) => {
            if (!onSearchChange) return;
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                if (q.length === 0 || q.length >= minSearchLength) {
                    onSearchChange(q);
                }
            }, debounceMs);
        },
        [onSearchChange, debounceMs, minSearchLength],
    );

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // ยังคง filter ฝั่ง client จาก options ที่มีอยู่ตอนนี้ไปพร้อมกัน (ให้ feedback ทันทีระหว่างรอ API)
    const filtered = query
        ? options.filter((o) =>
              o.label.toLowerCase().includes(query.toLowerCase()),
          )
        : options;

    const selected = options.find((o) => o.value === value);

    const selectOption = (opt: Option) => {
        onChange(opt.value);
        setIsOpen(false);
        setQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[highlightIndex])
                selectOption(filtered[highlightIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setQuery("");
        }
    };

    const handleQueryChange = (val: string) => {
        setQuery(val);
        setHighlightIndex(0);
        triggerSearch(val);
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                    isInvalid
                        ? "border-red-400 focus:border-red-400"
                        : "border-slate-300 hover:border-slate-400 focus:border-slate-400"
                }`}
            >
                <span
                    className={`flex-1 truncate ${
                        selected
                            ? "text-slate-700 font-medium"
                            : "text-slate-400"
                    }`}
                >
                    {selected ? selected.label : placeholder}
                </span>

                {value && !disabled && (
                    <span
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </span>
                )}

                <svg
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                            width: Math.max(coords.width, 240),
                        }}
                        className="z-[9999] rounded-lg border border-slate-200 bg-white shadow-lg"
                    >
                        <div className="border-b border-slate-100 p-2">
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                                    />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) =>
                                        handleQueryChange(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    placeholder={searchPlaceholder}
                                    className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                />
                            </div>
                            {onSearchChange &&
                                query.length > 0 &&
                                query.length < minSearchLength && (
                                    <p className="mt-1 px-1 text-[11px] text-slate-400">
                                        พิมพ์อย่างน้อย {minSearchLength} ตัว
                                        (เช่น 4 ตัวท้ายของ WO)
                                    </p>
                                )}
                        </div>

                        <ul className="max-h-56 overflow-y-auto py-1">
                            {loading && (
                                <li className="px-3 py-2 text-sm text-slate-400">
                                    กำลังโหลด...
                                </li>
                            )}
                            {!loading && filtered.length === 0 && (
                                <li className="px-3 py-2 text-sm text-slate-400">
                                    ไม่พบข้อมูล
                                </li>
                            )}
                            {!loading &&
                                filtered.map((opt, i) => (
                                    <li
                                        key={opt.value}
                                        onMouseEnter={() =>
                                            setHighlightIndex(i)
                                        }
                                        onClick={() => selectOption(opt)}
                                        className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                                            opt.value === value
                                                ? "bg-slate-100 font-medium text-slate-800"
                                                : i === highlightIndex
                                                  ? "bg-slate-50 text-slate-700"
                                                  : "text-slate-600"
                                        }`}
                                    >
                                        {opt.label}
                                    </li>
                                ))}
                        </ul>
                    </div>,
                    document.body,
                )}
        </>
    );
}
