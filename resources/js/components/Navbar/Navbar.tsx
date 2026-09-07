import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useUserSession } from "@/hooks/use-user-session";

interface NavbarProps {
    onMenuToggle: () => void;
    sidebarOpen: boolean;
}

interface UserInfo {
    username: string;
    empno: string;
    department: string;
    sec: string;
    msect_id: string;
}

function MenuIcon({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden
        >
            {open ? (
                <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </>
            ) : (
                <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                </>
            )}
        </svg>
    );
}

function initials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export default function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
    const session = useUserSession();

    // สร้างตัวแปรสำหรับกำหนด dark mode
    const [darkMode, setDarkMode] = useState(false);

    // console.log(session);

    // เพิ่ม dark mode
    useEffect(() => {
        // ตรวจสอบ system preference
        const prefersDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const savedDarkMode = localStorage.getItem("darkMode");

        // ถ้ามีค่าใน localStorage ให้ใช้ค่านั้น ไม่งั้นใช้ค่า system preference
        const isDarkMode =
            savedDarkMode !== null ? savedDarkMode === "true" : prefersDarkMode;
        setDarkMode(isDarkMode);

        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    });

    // ฟังก์ชันสำหรับเปลี่ยน mode เป็น dark/light
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        // บันทึกลง localStorage
        localStorage.setItem("darkMode", String(newDarkMode));

        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6 dark:border-gray-700 dark:bg-gray-900">
            {/* Mobile hamburger */}
            <button
                type="button"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
                onClick={onMenuToggle}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
            >
                <MenuIcon open={sidebarOpen} />
            </button>

            {/* Logo */}
            <Link href={route("home")} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <p className="text-white bg-blue-700 rounded-lg p-2 text-xs font-bold">
                        AM
                    </p>
                </div>
                <span className="text-sm font-semibold text-slate-800 hidden sm:block dark:text-white">
                    IC ROM-Model Change System
                </span>
            </Link>

            <div className="flex-1" />

            {/* User info */}
            {session && (
                <div className="flex items-center gap-2.5">
                    <div className="hidden text-right sm:block">
                        <p className="text-xs font-medium leading-tight text-slate-800 dark:text-white">
                            {session.username}
                        </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                        {initials(session.username || "")}
                    </div>
                </div>
            )}

            {/* Dark mode toggle */}
            <button
                onClick={toggleDarkMode}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
                aria-label={
                    darkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"
                }
            >
                {darkMode ? (
                    <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                )}
            </button>
        </header>
    );
}
