import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * LayeredTabs
 * -----------
 * Tab panel set styled as layered/stacked cards — the active panel sits on
 * top of a small stack of "peeking" card edges, giving a sense of depth as
 * you switch tabs.
 *
 * Colors are intentionally neutral (zinc/white) and centralized in the
 * CSS custom properties below (`--layer-accent`, `--layer-accent-fg`,
 * `--layer-surface`, `--layer-back`) — edit those to re-theme everything
 * in one place once you're ready to add color.
 *
 * Content area has no scroll: each panel sizes to its own content
 * (no fixed height / overflow), so make sure panel content fits the space
 * you give it.
 */

export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
}

interface LayeredTabsProps {
    tabs: TabItem[];
    defaultTabId?: string;
    className?: string;
}

export default function LayeredTabs({
    tabs,
    defaultTabId,
    className = "",
}: LayeredTabsProps) {
    const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const activeIndex = tabs.findIndex((t) => t.id === activeId);
    const active = tabs[activeIndex] ?? tabs[0];

    function focusTab(index: number) {
        const wrapped = (index + tabs.length) % tabs.length;
        const id = tabs[wrapped].id;
        setActiveId(id);
        tabRefs.current[id]?.focus();
    }

    function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                focusTab(index + 1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                focusTab(index - 1);
                break;
            case "Home":
                e.preventDefault();
                focusTab(0);
                break;
            case "End":
                e.preventDefault();
                focusTab(tabs.length - 1);
                break;
        }
    }

    return (
        <div
            className={`layered-tabs ${className}`}
            style={
                {
                    // ---- customize colors here ----
                    "--layer-accent": "#18181b",
                    "--layer-accent-fg": "#fafafa",
                    "--layer-surface": "#ffffff",
                    "--layer-back": "#e4e4e7",
                } as React.CSSProperties
            }
        >
            <style>{`
        .layered-tabs {
          width: 100%;
        }
        .layered-tabs .tab-btn {
          position: relative;
          transition: transform 150ms ease, background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
        }
        .layered-tabs .tab-btn[data-active="true"] {
          background-color: var(--layer-accent);
          color: var(--layer-accent-fg);
          transform: translateY(-2px);
        }
        .layered-tabs .tab-btn[data-active="false"]:hover {
          transform: translateY(-1px);
        }
        .layered-tabs .stage {
          position: relative;
        }
        .layered-tabs .back-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0.75rem;
          background-color: var(--layer-back);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .layered-tabs .back-layer-1 {
          height: 12px;
          transform: translateY(10px) scale(0.98);
          opacity: 0.9;
        }
        .layered-tabs .back-layer-2 {
          height: 10px;
          transform: translateY(20px) scale(0.94);
          opacity: 0.6;
        }
        .layered-tabs .panel-card {
          position: relative;
          z-index: 10;
          animation: layer-rise 220ms ease;
        }
        @keyframes layer-rise {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .layered-tabs .tab-btn,
          .layered-tabs .panel-card {
            transition: none;
            animation: none;
          }
        }
      `}</style>

            {/* Tab list */}
            <div
                role="tablist"
                aria-label="Content sections"
                className="flex flex-wrap gap-2 px-1"
            >
                {tabs.map((tab, index) => {
                    const isActive = tab.id === active?.id;
                    return (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                tabRefs.current[tab.id] = el;
                            }}
                            role="tab"
                            id={`tab-${tab.id}`}
                            aria-selected={isActive}
                            aria-controls={`panel-${tab.id}`}
                            tabIndex={isActive ? 0 : -1}
                            data-active={isActive}
                            onClick={() => setActiveId(tab.id)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`tab-btn rounded-t-lg px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                isActive
                                    ? "shadow-md"
                                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Layered content stage */}
            <div className="stage mt-0">
                <div
                    key={active?.id}
                    role="tabpanel"
                    id={`panel-${active?.id}`}
                    aria-labelledby={`tab-${active?.id}`}
                    tabIndex={0}
                    className="panel-card rounded-xl border border-zinc-200 bg-white p-6 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                    {active?.content}
                </div>
            </div>
        </div>
    );
}
