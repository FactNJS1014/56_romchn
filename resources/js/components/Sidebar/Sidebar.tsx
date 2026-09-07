import { Link, usePage } from "@inertiajs/react";
import { useUserSession } from "@/hooks/use-user-session";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    routeName: string;
    icon: React.ReactNode;
    badge?: number;
    permission: number[];
}

interface NavSection {
    section: string;
    items: NavItem[];
}

// ── Heroicons (outline) ──────────────────────────────────────────
const icons = {
    Register: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
        >
            <path
                fillRule="evenodd"
                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                clipRule="evenodd"
            />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
    ),
    Approve: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
        >
            <path
                fillRule="evenodd"
                d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd"
            />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
    ),
    Report: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
        >
            <path
                fillRule="evenodd"
                d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z"
                clipRule="evenodd"
            />
            <path
                fillRule="evenodd"
                d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z"
                clipRule="evenodd"
            />
        </svg>
    ),

    settings: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
};

const NAV: NavSection[] = [
    {
        section: "Form",
        items: [
            {
                label: "Master Record",
                routeName: "master-reg",
                icon: icons.Register,
                permission: [0, 7, 9],
            },
            {
                label: "Model Record",
                routeName: "model-rec",
                icon: icons.Register,
                permission: [1, 8, 9],
            },
        ],
    },
    {
        section: "Leader or Manager",
        items: [
            {
                label: "อนุมัติแบบฟอร์ม",
                routeName: "app-page",
                icon: icons.Approve,
                permission: [6, 7, 8, 9],
            },
            {
                label: "รายงาน",
                routeName: "report",
                icon: icons.Report,
                permission: [1, 6, 7, 8, 9],
            },
            {
                label: "Settings",
                routeName: "master-appr",
                icon: icons.settings,
                permission: [7, 9],
            },
        ],
    },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
    // 1. เรียกใช้ href ผ่าน route() ปกติ
    let href = "#";
    let active = false;

    try {
        href = route(item.routeName);

        // 2. ใช้ route().current() ของ Ziggy ในการเช็ก active state
        // รองรับทั้งชื่อตรงๆ หรือ sub-routes เช่น 'approval.*'
        active =
            route().current(item.routeName) ||
            route().current(`${item.routeName}.*`);
    } catch {
        href = "#";
        active = false;
    }

    return (
        <Link
            href={href}
            onClick={onClick}
            className={[
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
        >
            <span className={active ? "text-blue-600" : "text-slate-400"}>
                {item.icon}
            </span>
            <span className="flex-1 dark:text-slate-300">{item.label}</span>
        </Link>
    );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const { USE_PERMISSION } = useUserSession();
    // กรองเมนูตาม permission ของ user ปัจจุบัน
    // - เก็บเฉพาะ item ที่ item.permission มีค่า USE_PERMISSION รวมอยู่ด้วย
    // - เก็บเฉพาะ section ที่ยังเหลือ item อย่างน้อย 1 รายการหลังกรอง
    const filteredNav: NavSection[] = NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
            item.permission.includes(Number(USE_PERMISSION)),
        ),
    })).filter((group) => group.items.length > 0);

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/30 lg:hidden"
                    aria-hidden
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={[
                    "fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto dark:bg-slate-900 dark:border-slate-700",
                    open ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                aria-label="Sidebar navigation"
            >
                {/* Sidebar top spacer (aligns with navbar height 56px) */}
                <div className="flex h-14 shrink-0 items-center px-4 lg:hidden">
                    <span className="text-sm font-semibold text-slate-800">
                        Navigation
                    </span>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 dark:bg-slate-900">
                    {filteredNav.map((group) => (
                        <div key={group.section}>
                            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {group.section}
                            </p>
                            <ul
                                className="space-y-0.5 dark:bg-slate-900"
                                role="list"
                            >
                                {group.items.map((item) => (
                                    <li key={item.routeName}>
                                        <NavLink
                                            item={item}
                                            onClick={() => {
                                                if (window.innerWidth < 1024)
                                                    onClose();
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
