import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Maximize2,
  Sun,
  Download,
  Upload,
  Files,
  Copy,
  Pin,
  FileText,
  X,
  Type,
  BookOpen,
  Archive,
} from 'lucide-react';
import {
  Note,
  EditorFont,
  deriveNoteDisplayTitle,
  formatRelativeTimestamp,
} from '../utils/noteLogic';
import { GuideTab } from './AboutGuideModal';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDuplicateNote: () => void;
  onTriggerImport: () => void;
  onToggleFocusMode: () => void;
  onToggleTheme: () => void;
  onExportTxt: () => void;
  onDownloadBackupJson: () => void;
  onCopyNote: () => void;
  onTogglePin: () => void;
  onChangeFont: (font: EditorFont) => void;
  onOpenGuide: (tab: GuideTab) => void;
}

const KEYBOARD_SHORTCUTS = [
  { label: 'Command Palette & Shortcuts', keys: '⌘ K' },
  { label: 'Create New Note', keys: '⌘ ⌥ N' },
  { label: 'Duplicate Current Note', keys: '⌘ ⇧ D' },
  { label: 'Toggle Zen Focus Mode', keys: '⌘ \\' },
  { label: 'Search Notes in Sidebar', keys: '⌘ F' },
  { label: 'Copy Entire Note', keys: '⌘ ⇧ C' },
  { label: 'Export Note as .TXT', keys: '⌘ ⇧ E' },
  { label: 'Bold Selection', keys: '⌘ B' },
  { label: 'Italic Selection', keys: '⌘ I' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onCreateNote,
  onDuplicateNote,
  onTriggerImport,
  onToggleFocusMode,
  onToggleTheme,
  onExportTxt,
  onDownloadBackupJson,
  onCopyNote,
  onTogglePin,
  onChangeFont,
  onOpenGuide,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingNotes = notes
    .filter((n) => {
      if (!q) return true;
      return (
        deriveNoteDisplayTitle(n).toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const quickActions = [
    {
      id: 'new-note',
      label: 'Create New Note',
      shortcut: '⌘ ⌥ N',
      icon: Plus,
      run: () => {
        onCreateNote();
        onClose();
      },
    },
    {
      id: 'duplicate-note',
      label: 'Duplicate Current Note',
      shortcut: '⌘ ⇧ D',
      icon: Files,
      run: () => {
        onDuplicateNote();
        onClose();
      },
    },
    {
      id: 'import-file',
      label: 'Import .TXT, .MD, or .JSON File',
      shortcut: 'Import',
      icon: Upload,
      run: () => {
        onClose();
        onTriggerImport();
      },
    },
    {
      id: 'focus-mode',
      label: 'Toggle Zen Focus Mode',
      shortcut: '⌘ \\',
      icon: Maximize2,
      run: () => {
        onToggleFocusMode();
        onClose();
      },
    },
    {
      id: 'copy-note',
      label: 'Copy Entire Note to Clipboard',
      shortcut: '⌘ ⇧ C',
      icon: Copy,
      run: () => {
        onCopyNote();
        onClose();
      },
    },
    {
      id: 'export-txt',
      label: 'Export Current Note as .TXT',
      shortcut: '⌘ ⇧ E',
      icon: Download,
      run: () => {
        onExportTxt();
        onClose();
      },
    },
    {
      id: 'backup-json',
      label: 'Download All Notes Backup (.JSON)',
      shortcut: 'Backup',
      icon: Archive,
      run: () => {
        onDownloadBackupJson();
        onClose();
      },
    },
    {
      id: 'pin-note',
      label: 'Pin / Unpin Current Note',
      shortcut: 'Pin',
      icon: Pin,
      run: () => {
        onTogglePin();
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      label: 'Switch Warm Ivory / Obsidian Dark Theme',
      shortcut: 'Theme',
      icon: Sun,
      run: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'font-serif',
      label: 'Typography: Editorial Serif (Newsreader)',
      shortcut: 'Font',
      icon: Type,
      run: () => {
        onChangeFont('serif');
        onClose();
      },
    },
    {
      id: 'font-sans',
      label: 'Typography: Refined Sans (Inter)',
      shortcut: 'Font',
      icon: Type,
      run: () => {
        onChangeFont('sans');
        onClose();
      },
    },
    {
      id: 'font-mono',
      label: 'Typography: Technical Mono (JetBrains)',
      shortcut: 'Font',
      icon: Type,
      run: () => {
        onChangeFont('mono');
        onClose();
      },
    },
    {
      id: 'open-guide',
      label: 'Open NŌTA Guide, FAQ & Privacy Policy',
      shortcut: 'Docs',
      icon: BookOpen,
      run: () => {
        onClose();
        onOpenGuide('overview');
      },
    },
  ].filter((item) => !q || item.label.toLowerCase().includes(q));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette and Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171614]/50 backdrop-blur-[2px] transition-opacity duration-150"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#141416] shadow-2xl transition-all duration-150">
        {/* Search Input Header */}
        <div className="flex items-center border-b border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/60 dark:bg-[#1C1C1F]/60 px-4 py-3">
          <Search className="mr-3 h-4 w-4 text-[#70685E] dark:text-[#A7A29A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to a note in NŌTA..."
            aria-label="Filter commands or notes"
            className="w-full bg-transparent text-sm text-[#171614] dark:text-[#F1EEE8] placeholder:text-[#70685E] dark:placeholder:text-[#A7A29A] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="ml-2 rounded-lg p-1 text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-2.5 pb-1.5 text-[11px] font-medium text-[#70685E] dark:text-[#A7A29A]">
                Studio Commands
              </div>
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.run}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
                        <Icon className="h-3.5 w-3.5 text-[#70685E] dark:text-[#A7A29A]" />
                        <span>{action.label}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#70685E] dark:text-[#A7A29A] tabular-nums">
                        {action.shortcut}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jump to Note */}
          {matchingNotes.length > 0 && (
            <div>
              <div className="px-2.5 pb-1.5 text-[11px] font-medium text-[#70685E] dark:text-[#A7A29A]">
                Jump to Note
              </div>
              <div className="space-y-0.5">
                {matchingNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => {
                      onSelectNote(note.id);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 truncate pr-4">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#70685E] dark:text-[#A7A29A]" />
                      <span className="truncate font-medium">
                        {deriveNoteDisplayTitle(note)}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-[#70685E] dark:text-[#A7A29A] tabular-nums">
                      {note.category} · {formatRelativeTimestamp(note.updatedAt)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Reference Table */}
          {!q && (
            <div className="border-t border-[#DED8CF] dark:border-[#303034] pt-3">
              <div className="px-2.5 pb-2 text-[11px] font-medium text-[#70685E] dark:text-[#A7A29A]">
                Keyboard Shortcuts Reference
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 px-2.5 pb-1">
                {KEYBOARD_SHORTCUTS.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1 text-xs text-[#29251F] dark:text-[#A7A29A]"
                  >
                    <span>{item.label}</span>
                    <kbd className="font-mono text-[11px] text-[#70685E] dark:text-[#F1EEE8] tabular-nums">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
