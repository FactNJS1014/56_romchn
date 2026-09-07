import React from "react";
import type { PaginationLink } from "@/types/pagination";

interface PaginationProps {
    links: PaginationLink[];
    onNavigate: (url: string) => void;
}

// แปลง label ที่ Laravel ส่งมา (มี &laquo; / &raquo;) ให้อ่านง่ายขึ้น
function decodeLabel(label: string) {
    return label.replace("&laquo;", "«").replace("&raquo;", "»");
}

export default function Pagination({ links, onNavigate }: PaginationProps) {
    if (links.length <= 3) return null; // ไม่มีอะไรให้เพจ (มีหน้าเดียว)

    return (
        <nav className="flex flex-wrap items-center justify-center gap-1 mt-4">
            {links.map((link, index) => {
                const isDisabled = link.url === null;
                const label = decodeLabel(link.label);

                return (
                    <button
                        key={index}
                        disabled={isDisabled}
                        onClick={() => link.url && onNavigate(link.url)}
                        className={[
                            "min-w-[2.25rem] px-3 py-1.5 text-sm rounded-md border transition-colors",
                            link.active
                                ? "bg-indigo-600 border-indigo-600 text-white font-medium"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                            isDisabled
                                ? "opacity-40 cursor-not-allowed hover:bg-white"
                                : "cursor-pointer",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}
