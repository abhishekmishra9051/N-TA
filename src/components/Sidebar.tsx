import React from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  FileText,
  Command,
  Files,
  Upload,
} from 'lucide-react';
import {
  Note,
  NoteCategory,
  FilterMode,
  NOTE_CATEGORIES,
  deriveNoteDisplayTitle,
  deriveNoteExcerpt,
  computeNoteMetrics,
  formatRelativeTimestamp,
} from '../utils/noteLogic';
import { GuideTab } from './AboutGuideModal';
import { NotaWordmark } from './NotaLogo';

interface SidebarProps {
  notes: Note[];
  totalNotesCount: number;
  activeNoteId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  selectedCategory: NoteCategory | 'All';
  onCategoryChange: (cat: NoteCategory | 'All') => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDuplicateNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRequestDelete: (note: Note) => void;
  onOpenCommandPalette: () => void;
  onTriggerImport: () => void;
  onOpenGuide: (tab: GuideTab) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const FILTER_TABS: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'recent', label: 'Recent' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  totalNotesCount,
  activeNoteId,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  selectedCategory,
  onCategoryChange,
  onSelectNote,
  onCreateNote,
  onDuplicateNote,
  onTogglePin,
  onRequestDelete,
  onOpenCommandPalette,
  onTriggerImport,
  onOpenGuide,
  searchInputRef,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-[#171614]/45 backdrop-blur-[2px] lg:hidden transition-opacity duration-150"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Notes navigation"
        className={`${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[86vw]'
            : 'hidden lg:flex lg:w-72'
        } shrink-0 flex-col border-r border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8] dark:bg-[#141416] transition-colors duration-200`}
      >
        {/* Top Brand Identity & Primary Actions */}
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <NotaWordmark size="sm" showTagline={false} />

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onTriggerImport}
              title="Import .TXT, .MD, or .JSON file"
              aria-label="Import file"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Command Palette (Cmd/Ctrl + K)"
              aria-label="Open command palette"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Command className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                onCreateNote();
                onCloseMobile();
              }}
              aria-label="New Note"
              className="flex items-center gap-1.5 rounded-lg bg-[#171614] dark:bg-[#F1EEE8] px-3 py-1.5 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Note</span>
            </button>
            {isMobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation drawer"
                className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quiet Editorial Tagline & Note Count Subtitle */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-[11px] font-editorial-serif italic text-[#70685E] dark:text-[#A7A29A]">
            Make room for thought.
          </p>
          <span className="text-[11px] text-[#70685E] dark:text-[#A7A29A] font-mono tabular-nums whitespace-nowrap">
            {totalNotesCount} {totalNotesCount === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Search Input */}
        <div className="px-3.5 pb-2.5">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#70685E] dark:text-[#A7A29A]" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#0B0B0D] py-1.5 pl-8 pr-7 text-xs text-[#171614] dark:text-[#F1EEE8] placeholder:text-[#70685E]/80 dark:placeholder:text-[#A7A29A]/70 focus:border-[#29251F] dark:focus:border-[#B7A895] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-2 text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Segmented Filter Control (All / Pinned / Recent) */}
        <div className="px-3.5 pb-2">
          <div
            role="tablist"
            aria-label="Filter notes by status"
            className="grid grid-cols-3 rounded-lg bg-[#E6E1D8]/80 dark:bg-[#1C1C1F] p-0.5 border border-[#DED8CF]/60 dark:border-[#303034]/60"
          >
            {FILTER_TABS.map((tab) => {
              const active = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => onFilterModeChange(tab.id)}
                  className={`relative rounded-md py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-[#171614] dark:text-[#F1EEE8]'
                      : 'text-[#70685E] dark:text-[#A7A29A] hover:text-[#171614] dark:hover:text-[#F1EEE8]'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-md bg-[#FAF9F6] dark:bg-[#0B0B0D] shadow-2xs border border-[#DED8CF]/70 dark:border-[#303034] transition-all duration-150" />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto px-3.5 pb-2.5 no-scrollbar">
          {(['All', ...NOTE_CATEGORIES] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#29251F] text-[#FAF9F6] dark:bg-[#F1EEE8] dark:text-[#171614]'
                    : 'text-[#70685E] dark:text-[#A7A29A] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] hover:text-[#171614] dark:hover:text-[#F1EEE8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-[#DED8CF] dark:bg-[#303034]" />

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <FileText className="mb-2.5 h-6 w-6 text-[#70685E] dark:text-[#A7A29A] stroke-[1.5]" />
              <p className="text-xs font-medium text-[#29251F] dark:text-[#F1EEE8]">
                {searchQuery || filterMode !== 'all' || selectedCategory !== 'All'
                  ? 'No matching notes found'
                  : 'Your studio is empty'}
              </p>
              <p className="mt-1 text-[11px] text-[#70685E] dark:text-[#A7A29A] max-w-[195px] leading-relaxed">
                {searchQuery || filterMode !== 'all' || selectedCategory !== 'All'
                  ? 'Clear your active filter or search term to view all notes.'
                  : 'Create a fresh page to begin writing without distraction.'}
              </p>
              {searchQuery || filterMode !== 'all' || selectedCategory !== 'All' ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    onFilterModeChange('all');
                    onCategoryChange('All');
                  }}
                  className="mt-3 rounded-lg border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#1C1C1F] px-3 py-1.5 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#242429] transition-colors"
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCreateNote}
                  className="mt-3 rounded-lg bg-[#171614] dark:bg-[#F1EEE8] px-3 py-1.5 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors"
                >
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-1" role="list">
              {notes.map((note) => {
                const isActive = note.id === activeNoteId;
                const displayTitle = deriveNoteDisplayTitle(note);
                const excerpt = deriveNoteExcerpt(note.content, 68);
                const { words } = computeNoteMetrics(note.content);

                return (
                  <li
                    key={note.id}
                    className="group relative transition-all duration-150"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Select note ${displayTitle}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        onSelectNote(note.id);
                        onCloseMobile();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectNote(note.id);
                          onCloseMobile();
                        }
                      }}
                      className={`w-full cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#29251F] dark:focus-visible:outline-[#B7A895] ${
                        isActive
                          ? 'bg-[#FAF9F6] dark:bg-[#1C1C1F] text-[#171614] dark:text-[#F1EEE8] ring-1 ring-[#DED8CF] dark:ring-[#303034]'
                          : 'text-[#29251F] dark:text-[#F1EEE8]/90 hover:bg-[#FAF9F6]/60 dark:hover:bg-[#1C1C1F]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-semibold leading-snug text-[#171614] dark:text-[#F1EEE8] truncate pr-14">
                          {displayTitle}
                        </h3>
                        {note.pinned && (
                          <Pin
                            className="h-3 w-3 shrink-0 text-[#70685E] dark:text-[#B7A895] fill-current mt-0.5 group-hover:opacity-0 transition-opacity"
                            aria-label="Pinned"
                          />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-[11px] text-[#70685E] dark:text-[#A7A29A]">
                        {excerpt}
                      </p>

                      {/* Unboxed Clean Metadata — Zero-Pill Discipline */}
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#70685E] dark:text-[#A7A29A] font-mono tabular-nums">
                        <span>{formatRelativeTimestamp(note.updatedAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{words}w</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans">{note.category}</span>
                      </div>
                    </div>

                    {/* Quick Hover Actions (Pin, Duplicate & Delete) */}
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(note.id);
                        }}
                        aria-label={
                          note.pinned
                            ? `Unpin '${displayTitle}'`
                            : `Pin '${displayTitle}'`
                        }
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          note.pinned
                            ? 'text-[#29251F] dark:text-[#B7A895]'
                            : 'text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#232327]'
                        }`}
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateNote(note.id);
                        }}
                        aria-label={`Duplicate '${displayTitle}'`}
                        title="Duplicate note"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#232327] transition-colors"
                      >
                        <Files className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDelete(note);
                        }}
                        aria-label={`Delete '${displayTitle}'`}
                        title="Delete note"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#70685E] hover:text-rose-700 dark:text-[#A7A29A] dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quiet Local-First Footer: Privacy Promise, Guide, FAQ, Terms & Shortcuts */}
        <div className="border-t border-[#DED8CF] dark:border-[#303034] px-4 py-2.5 flex flex-col gap-1 text-[11px] text-[#70685E] dark:text-[#A7A29A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenGuide('overview')}
                className="hover:text-[#171614] dark:hover:text-[#F1EEE8] transition-colors whitespace-nowrap"
              >
                Guide &amp; FAQ
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenGuide('privacy')}
                className="hover:text-[#171614] dark:hover:text-[#F1EEE8] transition-colors whitespace-nowrap"
              >
                Privacy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenGuide('terms')}
                className="hover:text-[#171614] dark:hover:text-[#F1EEE8] transition-colors whitespace-nowrap"
              >
                Terms
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Cmd/Ctrl + K)"
              className="hover:text-[#171614] dark:hover:text-[#F1EEE8] transition-colors font-mono tabular-nums whitespace-nowrap"
            >
              ⌘K
            </button>
          </div>
          <p className="text-[10px] text-[#70685E] dark:text-[#A7A29A]">
            Your notes stay in your browser.
          </p>
        </div>
      </aside>
    </>
  );
};
