import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { Plus, AlertTriangle, Download, RotateCw } from 'lucide-react';
import {
  Note,
  NoteCategory,
  EditorFont,
  FilterMode,
  InlineFormatType,
  INITIAL_NOTES,
  computeNoteMetrics,
  createNewNote,
  updateNoteInList,
  duplicateNoteInList,
  deleteNoteFromList,
  filterAndSortNotes,
  formatNoteForTxtExport,
  applyTextFormatting,
  formatRelativeTimestamp,
  sanitizeNoteList,
  validateAndParseImportedFile,
} from './utils/noteLogic';
import { Sidebar } from './components/Sidebar';
import { EditorToolbar, SaveStatus } from './components/EditorToolbar';
import { NotaWordmark } from './components/NotaLogo';
import type { GuideTab } from './components/AboutGuideModal';

const DeleteModal = lazy(() =>
  import('./components/DeleteModal').then((m) => ({ default: m.DeleteModal }))
);
const ShortcutsModal = lazy(() =>
  import('./components/ShortcutsModal').then((m) => ({ default: m.ShortcutsModal }))
);
const AboutGuideModal = lazy(() =>
  import('./components/AboutGuideModal').then((m) => ({ default: m.AboutGuideModal }))
);

/**
 * Local-First Storage Keys:
 * Preserves existing 'dx12_notes_v1' and preference keys so existing user data is never lost.
 */
const STORAGE_KEYS = {
  NOTES: 'dx12_notes_v1',
  ACTIVE_NOTE_ID: 'dx12_active_note_id_v1',
  THEME: 'dx12_theme_v1',
  FONT: 'dx12_editor_font_v1',
  WIDE: 'dx12_wide_measure_v1',
};

function loadInitialNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return INITIAL_NOTES;
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeNoteList(parsed);
    if (sanitized !== null) return sanitized;
    return INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export default function App() {
  // Notes state with validated localStorage persistence
  const [notes, setNotes] = useState<Note[]>(() => loadInitialNotes());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
      const initialList = loadInitialNotes();
      if (savedId && initialList.some((n) => n.id === savedId)) {
        return savedId;
      }
      return initialList[0]?.id ?? null;
    } catch {
      return INITIAL_NOTES[0]?.id ?? null;
    }
  });

  // Theme state (Light / Dark)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false;
    } catch {
      return false;
    }
  });

  // Editor preferences
  const [editorFont, setEditorFont] = useState<EditorFont>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FONT) as EditorFont | null;
      if (saved === 'serif' || saved === 'sans' || saved === 'mono') return saved;
      return 'serif';
    } catch {
      return 'serif';
    }
  });

  const [isWideMeasure, setIsWideMeasure] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WIDE) === 'true';
    } catch {
      return false;
    }
  });

  // UI & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'All'>('All');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<GuideTab>('overview');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [copiedRecently, setCopiedRecently] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const isFirstMountRef = useRef<boolean>(true);

  // Sync theme with <html class="dark">
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage quota errors on theme preference
    }
  }, [isDark]);

  /**
   * Truthful localStorage persistence:
   * Never transitions to 'saved' unless localStorage.setItem succeeds.
   */
  const persistNotesToStorage = useCallback((notesToSave: Note[], isRetry: boolean = false) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    if (isRetry) {
      setSaveStatus('retrying');
    } else if (!isFirstMountRef.current) {
      setSaveStatus('saving');
    }

    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notesToSave));
      setStorageWarning(null);
      if (isFirstMountRef.current && !isRetry) {
        setSaveStatus('saved');
      } else {
        saveTimeoutRef.current = window.setTimeout(() => {
          setSaveStatus('saved');
        }, 260);
      }
    } catch {
      setSaveStatus('error');
      setStorageWarning(
        'Unable to save to browser storage (quota full or restricted). Download an emergency backup to protect your work.'
      );
    }
  }, []);

  useEffect(() => {
    persistNotesToStorage(notes, false);
    isFirstMountRef.current = false;
  }, [notes, persistNotesToStorage]);

  const handleRetrySave = useCallback(() => {
    persistNotesToStorage(notes, true);
  }, [notes, persistNotesToStorage]);

  // Persist activeNoteId
  useEffect(() => {
    try {
      if (activeNoteId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE_ID, activeNoteId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
      }
    } catch {
      // Ignore
    }
  }, [activeNoteId]);

  // Persist typography & width preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT, editorFont);
      localStorage.setItem(STORAGE_KEYS.WIDE, String(isWideMeasure));
    } catch {
      // Ignore
    }
  }, [editorFont, isWideMeasure]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(notes, {
        searchQuery,
        filterMode,
        category: selectedCategory,
      }),
    [notes, searchQuery, filterMode, selectedCategory]
  );

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) ?? notes[0] ?? null,
    [notes, activeNoteId]
  );

  // Keep activeNoteId aligned if activeNote fallback was used
  useEffect(() => {
    if (activeNote && activeNote.id !== activeNoteId) {
      setActiveNoteId(activeNote.id);
    } else if (!activeNote && activeNoteId !== null) {
      setActiveNoteId(null);
    }
  }, [activeNote, activeNoteId]);

  const handleCreateNote = useCallback(() => {
    const defaultCategory: NoteCategory =
      selectedCategory !== 'All' ? selectedCategory : 'Drafts';
    const newNote = createNewNote({
      title: '',
      content: '',
      category: defaultCategory,
      pinned: filterMode === 'pinned',
    });
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setSearchQuery('');
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 30);
  }, [selectedCategory, filterMode]);

  const handleUpdateActiveNote = useCallback(
    (changes: Partial<Pick<Note, 'title' | 'content' | 'category' | 'pinned'>>) => {
      if (!activeNote) return;
      setNotes((prev) => updateNoteInList(prev, activeNote.id, changes));
    },
    [activeNote]
  );

  const handleDuplicateNoteById = useCallback(
    (id: string) => {
      const { notes: nextNotes, duplicatedNote } = duplicateNoteInList(notes, id);
      if (!duplicatedNote) return;
      setNotes(nextNotes);
      setActiveNoteId(duplicatedNote.id);
      showToast('Note duplicated');
    },
    [notes, showToast]
  );

  const handleTogglePinById = useCallback(
    (id: string) => {
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const nextPinned = !target.pinned;
      setNotes((prev) => updateNoteInList(prev, id, { pinned: nextPinned }));
      showToast(nextPinned ? 'Note pinned to top' : 'Note unpinned');
    },
    [notes, showToast]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!noteToDelete) return;
    const deletedId = noteToDelete.id;
    setNotes((prev) => {
      const remaining = deleteNoteFromList(prev, deletedId);
      if (activeNoteId === deletedId) {
        setActiveNoteId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
    setNoteToDelete(null);
    showToast('Note deleted');
  }, [noteToDelete, activeNoteId, showToast]);

  const handleCopyActiveNote = useCallback(async () => {
    if (!activeNote) return;
    const fullText = activeNote.title.trim()
      ? `${activeNote.title.trim()}\n\n${activeNote.content}`
      : activeNote.content;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      }
      setCopiedRecently(true);
      showToast('Copied entire note to clipboard');
      window.setTimeout(() => setCopiedRecently(false), 1800);
    } catch {
      showToast('Clipboard access requires user permission');
    }
  }, [activeNote, showToast]);

  const handleExportTxt = useCallback(() => {
    if (!activeNote) return;
    const { filename, body } = formatNoteForTxtExport(activeNote);
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}`);
  }, [activeNote, showToast]);

  const handleDownloadBackupJson = useCallback(() => {
    try {
      const payload = JSON.stringify(notes, null, 2);
      const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nota-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded JSON backup');
    } catch {
      showToast('Could not generate backup file');
    }
  }, [notes, showToast]);

  const handleTriggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImportChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;

      try {
        const text = await file.text();
        const defaultCat: NoteCategory =
          selectedCategory !== 'All' ? selectedCategory : 'Drafts';
        const result = validateAndParseImportedFile(
          file.name,
          file.size,
          text,
          defaultCat
        );

        if (!result.ok || result.importedNotes.length === 0) {
          showToast(result.error || 'Could not import file');
          return;
        }

        setNotes((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const dedupedNew = result.importedNotes.map((item) =>
            existingIds.has(item.id)
              ? { ...item, id: `${item.id}-${Math.random().toString(36).slice(2, 6)}` }
              : item
          );
          return [...dedupedNew, ...prev];
        });
        setActiveNoteId(result.importedNotes[0].id);
        showToast(
          result.importedNotes.length === 1
            ? `Imported "${result.importedNotes[0].title || 'Untitled Note'}"`
            : `Imported ${result.importedNotes.length} notes`
        );
      } catch {
        showToast('Failed to read selected file');
      }
    },
    [selectedCategory, showToast]
  );

  const handleApplyFormat = useCallback(
    (format: InlineFormatType) => {
      if (!activeNote) return;
      const textarea = bodyTextareaRef.current;
      const start = textarea ? textarea.selectionStart : activeNote.content.length;
      const end = textarea ? textarea.selectionEnd : activeNote.content.length;

      const { newContent, newSelectionStart, newSelectionEnd } = applyTextFormatting(
        activeNote.content,
        start,
        end,
        format
      );

      handleUpdateActiveNote({ content: newContent });
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }
      }, 15);
    },
    [activeNote, handleUpdateActiveNote]
  );

  const handleOpenGuide = useCallback((tab: GuideTab) => {
    setGuideTab(tab);
    setIsGuideOpen(true);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K or Cmd/Ctrl + / -> Command Palette & Shortcuts
      if (isMod && (e.key.toLowerCase() === 'k' || e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + \ -> Toggle Zen Focus Mode
      if (isMod && e.key === '\\') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + Alt + N -> Create New Note
      if (isMod && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
        return;
      }

      // Cmd/Ctrl + Shift + D -> Duplicate Current Note
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeNote) handleDuplicateNoteById(activeNote.id);
        return;
      }

      // Cmd/Ctrl + F -> Focus Sidebar Search (when sidebar is visible)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'f' && !isFocusMode) {
        if (document.activeElement !== bodyTextareaRef.current) {
          e.preventDefault();
          searchInputRef.current?.focus();
          return;
        }
      }

      // Cmd/Ctrl + Shift + C -> Copy Entire Note
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyActiveNote();
        return;
      }

      // Cmd/Ctrl + Shift + E -> Export Note as TXT
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportTxt();
        return;
      }

      // Formatting shortcuts inside the editor textarea
      if (isMod && document.activeElement === bodyTextareaRef.current) {
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          handleApplyFormat('bold');
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          handleApplyFormat('italic');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isFocusMode,
    activeNote,
    handleCreateNote,
    handleDuplicateNoteById,
    handleCopyActiveNote,
    handleExportTxt,
    handleApplyFormat,
  ]);

  const metrics = useMemo(
    () => computeNoteMetrics(activeNote ? activeNote.content : ''),
    [activeNote]
  );

  const fontClass =
    editorFont === 'serif'
      ? 'font-editorial-serif'
      : editorFont === 'mono'
      ? 'font-editorial-mono'
      : 'font-editorial-sans';

  const footerSaveLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'retrying'
      ? 'Retrying...'
      : saveStatus === 'error'
      ? 'Unable to save'
      : 'Saved';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F6] dark:bg-[#0B0B0D] text-[#171614] dark:text-[#F1EEE8] transition-colors">
      {/* WCAG 2.2 AA Skip Navigation Link */}
      <a
        href="#note-body-textarea"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#171614] focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:text-[#FAF9F6] dark:focus:bg-[#F1EEE8] dark:focus:text-[#171614]"
      >
        Skip to writing canvas
      </a>

      {/* Hidden Secure File Input for .TXT, .MD, and .JSON Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.json,text/plain,text/markdown,application/json"
        onChange={handleFileImportChange}
        className="hidden"
        aria-label="Import note file"
      />

      {/* Collapsible Sidebar (Hidden in Zen Focus Mode on desktop) */}
      {!isFocusMode && (
        <Sidebar
          notes={filteredNotes}
          totalNotesCount={notes.length}
          activeNoteId={activeNote?.id ?? null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelectNote={(id) => setActiveNoteId(id)}
          onCreateNote={handleCreateNote}
          onDuplicateNote={handleDuplicateNoteById}
          onTogglePin={handleTogglePinById}
          onRequestDelete={(note) => setNoteToDelete(note)}
          onOpenCommandPalette={() => setIsShortcutsOpen(true)}
          onTriggerImport={handleTriggerImport}
          onOpenGuide={handleOpenGuide}
          searchInputRef={searchInputRef}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Writing Workspace */}
      <div className="relative flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {storageWarning && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 bg-amber-500/15 border-b border-amber-600/30 px-4 py-2 text-xs text-[#29251F] dark:text-[#F1EEE8]"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <span>{storageWarning}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetrySave}
                className="flex items-center gap-1 rounded-md border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#1C1C1F] px-2.5 py-1 text-[11px] font-medium hover:bg-[#F1EEE8] dark:hover:bg-[#232327] transition-colors"
              >
                <RotateCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadBackupJson}
                className="flex items-center gap-1 rounded-md bg-[#171614] dark:bg-[#F1EEE8] px-2.5 py-1 text-[11px] font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Emergency Backup (.JSON)</span>
              </button>
            </div>
          </div>
        )}

        {activeNote ? (
          <>
            <EditorToolbar
              activeNote={activeNote}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              editorFont={editorFont}
              onChangeEditorFont={setEditorFont}
              isWideMeasure={isWideMeasure}
              onToggleWideMeasure={() => setIsWideMeasure((prev) => !prev)}
              onUpdateCategory={(category) => handleUpdateActiveNote({ category })}
              onTogglePin={() => handleTogglePinById(activeNote.id)}
              onDuplicateNote={() => handleDuplicateNoteById(activeNote.id)}
              onTriggerImport={handleTriggerImport}
              onCopyNote={handleCopyActiveNote}
              copiedRecently={copiedRecently}
              onExportTxt={handleExportTxt}
              onRequestDelete={() => setNoteToDelete(activeNote)}
              isDark={isDark}
              onToggleTheme={() => setIsDark((prev) => !prev)}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              saveStatus={saveStatus}
              onRetrySave={handleRetrySave}
              onApplyFormat={handleApplyFormat}
            />

            {/* Primary Distraction-Free Writing Surface */}
            <main className="flex-1 overflow-y-auto px-5 sm:px-10 md:px-16 pt-7 sm:pt-12 pb-24">
              <div
                key={activeNote.id}
                className={`mx-auto flex min-h-full flex-col ${
                  isWideMeasure ? 'max-w-[86ch]' : 'max-w-[68ch]'
                } transition-all duration-200`}
              >
                {/* Quiet Metadata Header */}
                <div className="mb-3 flex items-center gap-2 text-xs text-[#70685E] dark:text-[#A7A29A] font-mono tabular-nums">
                  <span>Edited {formatRelativeTimestamp(activeNote.updatedAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeNote.category}</span>
                  {metrics.readingTimeMinutes > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{metrics.readingTimeMinutes} min read</span>
                    </>
                  )}
                </div>

                {/* Note Title Input (Auto-wrapping for mobile & desktop legibility) */}
                <label htmlFor="note-title-input" className="sr-only">
                  Note Title
                </label>
                <textarea
                  id="note-title-input"
                  ref={titleInputRef}
                  rows={1}
                  maxLength={300}
                  value={activeNote.title}
                  onChange={(e) => {
                    handleUpdateActiveNote({ title: e.target.value.replace(/\n/g, ' ') });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      bodyTextareaRef.current?.focus();
                    }
                  }}
                  placeholder="Untitled Note"
                  aria-label="Note Title"
                  className={`w-full resize-none overflow-hidden [field-sizing:content] bg-transparent text-2xl sm:text-3xl md:text-[34px] font-semibold tracking-tight text-[#171614] dark:text-[#F1EEE8] placeholder:text-[#B7A895] dark:placeholder:text-[#70685E] focus:outline-none leading-tight ${fontClass}`}
                />

                {/* Hairline Editorial Separator */}
                <div className="my-5 h-px w-full bg-[#DED8CF] dark:bg-[#303034]" />

                {/* Large Distraction-Free Manuscript Textarea */}
                <label htmlFor="note-body-textarea" className="sr-only">
                  Note Content
                </label>
                <textarea
                  id="note-body-textarea"
                  ref={bodyTextareaRef}
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Make room for thought..."
                  aria-label="Note Content"
                  spellCheck
                  className={`w-full flex-1 resize-none bg-transparent text-base sm:text-[17px] leading-[1.8] text-[#29251F] dark:text-[#F1EEE8]/95 placeholder:text-[#70685E]/70 dark:placeholder:text-[#A7A29A]/60 focus:outline-none min-h-[58vh] ${fontClass}`}
                />
              </div>
            </main>

            {/* Whisper-Quiet Bottom Writing Bar (Word Count, Character Count, Autosave Status) */}
            <footer className="sticky bottom-0 z-10 flex items-center justify-between border-t border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6]/92 dark:bg-[#0B0B0D]/92 backdrop-blur-md px-4 sm:px-6 py-2 text-xs text-[#70685E] dark:text-[#A7A29A]">
              <div
                aria-label="Document statistics"
                className="flex items-center gap-2 font-mono tabular-nums"
              >
                <span>
                  <strong className="font-medium text-[#171614] dark:text-[#F1EEE8]">
                    {metrics.words}
                  </strong>{' '}
                  {metrics.words === 1 ? 'word' : 'words'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-medium text-[#171614] dark:text-[#F1EEE8]">
                    {metrics.characters}
                  </strong>{' '}
                  {metrics.characters === 1 ? 'char' : 'chars'}
                </span>
                <span className="hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                <span className="hidden sm:inline">
                  {metrics.paragraphs} {metrics.paragraphs === 1 ? 'paragraph' : 'paragraphs'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 font-mono tabular-nums text-[11px] text-[#70685E] dark:text-[#A7A29A]">
                <span className="hidden md:inline font-sans text-[#70685E] dark:text-[#A7A29A]">
                  Your notes stay in your browser
                </span>
                <span className="hidden md:inline" aria-hidden="true">
                  ·
                </span>
                <span className="capitalize">{editorFont}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    saveStatus === 'error'
                      ? 'text-rose-700 dark:text-rose-400 font-medium'
                      : ''
                  }
                >
                  {footerSaveLabel}
                </span>
              </div>
            </footer>
          </>
        ) : (
          /* Empty Workspace State when all notes have been deleted */
          <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="mb-5">
              <NotaWordmark size="lg" showTagline={false} />
            </div>
            <h1 className="font-nota-display text-2xl sm:text-3xl text-[#171614] dark:text-[#F1EEE8]">
              Make room for thought.
            </h1>
            <p className="mt-2 max-w-sm text-xs text-[#70685E] dark:text-[#A7A29A] leading-relaxed">
              Your writing studio is currently empty. Create a fresh page or import a plain text file to begin writing. Your notes stay in your browser.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleCreateNote}
                className="flex items-center gap-2 rounded-xl bg-[#171614] dark:bg-[#F1EEE8] px-4 py-2.5 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Note</span>
              </button>
              <button
                type="button"
                onClick={handleTriggerImport}
                className="rounded-xl border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8] dark:bg-[#141416] px-4 py-2.5 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#1C1C1F] transition-colors"
              >
                Import .TXT / .MD / .JSON
              </button>
            </div>
          </main>
        )}

        {/* Subtle Floating Toast Feedback */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed bottom-12 right-6 z-40 rounded-xl border border-[#DED8CF] dark:border-[#303034] bg-[#171614] dark:bg-[#F1EEE8] px-3.5 py-2 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] shadow-lg transition-all duration-150"
          >
            {toastMessage}
          </div>
        )}
      </div>

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {noteToDelete && (
          <DeleteModal
            note={noteToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => setNoteToDelete(null)}
          />
        )}

        {isShortcutsOpen && (
          <ShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
            notes={notes}
            onSelectNote={(id) => setActiveNoteId(id)}
            onCreateNote={handleCreateNote}
            onDuplicateNote={() => activeNote && handleDuplicateNoteById(activeNote.id)}
            onTriggerImport={handleTriggerImport}
            onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onExportTxt={handleExportTxt}
            onDownloadBackupJson={handleDownloadBackupJson}
            onCopyNote={handleCopyActiveNote}
            onTogglePin={() => activeNote && handleTogglePinById(activeNote.id)}
            onChangeFont={setEditorFont}
            onOpenGuide={handleOpenGuide}
          />
        )}

        {isGuideOpen && (
          <AboutGuideModal
            isOpen={isGuideOpen}
            activeTab={guideTab}
            onTabChange={setGuideTab}
            onClose={() => setIsGuideOpen(false)}
            onStartWriting={() => bodyTextareaRef.current?.focus()}
            onDownloadBackupJson={handleDownloadBackupJson}
          />
        )}
      </Suspense>
    </div>
  );
}
