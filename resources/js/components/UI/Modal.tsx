import React, {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

/**
 * Preset sizes map to a max-width. All presets are still fully
 * responsive: on small screens the modal spans the viewport with
 * a margin, and grows to its max-width as the viewport allows.
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "custom";

const SIZE_MAP: Record<Exclude<ModalSize, "custom">, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-4xl",
  full: "sm:max-w-[calc(100vw-2rem)] sm:h-[calc(100vh-2rem)]",
};

export interface ModalProps {
  /** Controls visibility. Modal unmounts its content when false. */
  open: boolean;
  /** Called when the modal requests to close (backdrop click, Esc, close button). */
  onClose: () => void;
  /** Optional title rendered in the header. Omit to render a bare header with just the close button. */
  title?: ReactNode;
  /** Body content. */
  children: ReactNode;
  /** Optional footer, e.g. action buttons. */
  footer?: ReactNode;
  /**
   * Size preset. Use "custom" together with `className` (and/or `style`)
   * to set an exact width/height, e.g. className="w-[720px] max-w-[90vw]".
   */
  size?: ModalSize;
  /** Extra classes applied to the modal panel — required when size="custom". */
  className?: string;
  /** Inline styles applied to the modal panel, e.g. { width: 640, height: 480 }. */
  style?: React.CSSProperties;
  /** Disable closing via backdrop click. Defaults to false. */
  disableBackdropClose?: boolean;
  /** Disable closing via the Escape key. Defaults to false. */
  disableEscapeClose?: boolean;
  /** Hide the built-in close (×) button. Defaults to false. */
  hideCloseButton?: boolean;
  /** id used for aria-labelledby; auto-generated if omitted but title is provided. */
  id?: string;
}

/**
 * Modal / dialog with a responsive backdrop-and-panel layout.
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Invite teammates" size="md">
 *     ...
 *   </Modal>
 *
 * Custom size:
 *   <Modal open={open} onClose={close} size="custom" className="w-[900px] max-w-[95vw] h-[600px]">
 *     ...
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
  style,
  disableBackdropClose = false,
  disableEscapeClose = false,
  hideCloseButton = false,
  id = "modal-title",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape key handling
  useEffect(() => {
    if (!open || disableEscapeClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, disableEscapeClose, onClose]);

  // Lock body scroll + basic focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (disableBackdropClose) return;
      if (e.target === e.currentTarget) onClose();
    },
    [disableBackdropClose, onClose]
  );

  if (!open) return null;

  const sizeClasses = size === "custom" ? "" : SIZE_MAP[size];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? id : undefined}
        tabIndex={-1}
        className={[
          "relative flex w-full flex-col overflow-hidden bg-white shadow-xl outline-none",
          "rounded-t-2xl sm:rounded-2xl",
          "max-h-[90vh] sm:max-h-[85vh]",
          "animate-[slideUp_200ms_ease-out] sm:animate-[scaleIn_150ms_ease-out]",
          sizeClasses,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
            {title ? (
              <h2 id={id} className="text-base font-semibold text-neutral-900 sm:text-lg">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-neutral-700 sm:text-base">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;