import React, { useEffect, useRef } from 'react';
import { Trash2, X } from 'lucide-react';
import { Note, deriveNoteDisplayTitle } from '../utils/noteLogic';

interface DeleteModalProps {
  note: Note | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ note, onConfirm, onCancel }) => {
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!note) return;
    setTimeout(() => cancelBtnRef.current?.focus(), 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && document.activeElement !== cancelBtnRef.current) {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note, onConfirm, onCancel]);

  if (!note) return null;

  const title = deriveNoteDisplayTitle(note);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-[#171614]/50 backdrop-blur-[2px] transition-opacity duration-150"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#141416] p-6 shadow-xl transition-all duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-sm font-semibold text-[#171614] dark:text-[#F1EEE8]"
              >
                Delete Note
              </h2>
              <p className="mt-0.5 text-xs text-[#70685E] dark:text-[#A7A29A]">
                This action will permanently remove this note from your browser.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close delete confirmation"
            className="rounded-lg p-1 text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/70 dark:bg-[#1C1C1F] px-3.5 py-2.5">
          <p className="text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] truncate">
            {title}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8] dark:bg-[#1C1C1F] px-4 py-2 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#232327] transition-colors whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            aria-label="Confirm Delete"
            className="rounded-lg bg-rose-700 dark:bg-rose-600 px-4 py-2 text-xs font-medium text-[#FAF9F6] hover:bg-rose-800 dark:hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};
