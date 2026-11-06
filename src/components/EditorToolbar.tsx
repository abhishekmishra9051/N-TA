import React from 'react';
import {
  PanelLeft,
  Pin,
  Copy,
  Check,
  Download,
  Upload,
  Files,
  Trash2,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Keyboard,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  Code,
  Minus,
  RotateCw,
} from 'lucide-react';
import {
  Note,
  NoteCategory,
  EditorFont,
  NOTE_CATEGORIES,
  InlineFormatType,
  deriveNoteDisplayTitle,
} from '../utils/noteLogic';
import { NotaMark } from './NotaLogo';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'retrying';

interface EditorToolbarProps {
  activeNote: Note;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onOpenMobileSidebar: () => void;
  editorFont: EditorFont;
  onChangeEditorFont: (font: EditorFont) => void;
  isWideMeasure: boolean;
  onToggleWideMeasure: () => void;
  onUpdateCategory: (cat: NoteCategory) => void;
  onTogglePin: () => void;
  onDuplicateNote: () => void;
  onTriggerImport: () => void;
  onCopyNote: () => void;
  copiedRecently: boolean;
  onExportTxt: () => void;
  onRequestDelete: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  onApplyFormat: (format: InlineFormatType) => void;
}

const FONT_OPTIONS: { id: EditorFont; label: string }[] = [
  { id: 'serif', label: 'Serif' },
  { id: 'sans', label: 'Sans' },
  { id: 'mono', label: 'Mono' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeNote,
  isFocusMode,
  onToggleFocusMode,
  onOpenMobileSidebar,
  editorFont,
  onChangeEditorFont,
  isWideMeasure,
  onToggleWideMeasure,
  onUpdateCategory,
  onTogglePin,
  onDuplicateNote,
  onTriggerImport,
  onCopyNote,
  copiedRecently,
  onExportTxt,
  onRequestDelete,
  isDark,
  onToggleTheme,
  onOpenShortcuts,
  saveStatus,
  onRetrySave,
  onApplyFormat,
}) => {
  const displayTitle = deriveNoteDisplayTitle(activeNote);

  const saveStatusText =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'retrying'
      ? 'Retrying...'
      : saveStatus === 'error'
      ? 'Unable to save'
      : 'Saved';

  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6]/92 dark:bg-[#0B0B0D]/92 backdrop-blur-md transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-6">
        {/* Left Zone: Mobile Drawer / Focus toggle + Note Category & Pin */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open notes drawer"
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Compact Brand Mark visible on mobile or when sidebar is hidden in Focus Mode */}
          <div className={`${isFocusMode ? 'flex' : 'flex lg:hidden'} items-center pr-1 shrink-0`}>
            <NotaMark size={22} />
          </div>

          <button
            type="button"
            onClick={onToggleFocusMode}
            title={
              isFocusMode
                ? 'Exit Zen Focus Mode (Cmd/Ctrl + \\)'
                : 'Enter Zen Focus Mode (Cmd/Ctrl + \\)'
            }
            aria-label={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            className={`hidden lg:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isFocusMode
                ? 'bg-[#171614] text-[#FAF9F6] dark:bg-[#F1EEE8] dark:text-[#171614]'
                : 'text-[#70685E] dark:text-[#A7A29A] hover:text-[#171614] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F]'
            }`}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Focus</span>
              </>
            )}
          </button>

          <span className="hidden lg:inline text-[#DED8CF] dark:text-[#303034]" aria-hidden="true">
            /
          </span>

          <label className="sr-only" htmlFor="note-category-select">
            Note Collection
          </label>
          <select
            id="note-category-select"
            aria-label="Note collection"
            value={activeNote.category}
            onChange={(e) => onUpdateCategory(e.target.value as NoteCategory)}
            className="rounded-lg bg-transparent px-2 py-1 text-xs font-medium text-[#29251F] dark:text-[#A7A29A] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] focus:outline-none cursor-pointer transition-colors"
          >
            {NOTE_CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat}
                className="bg-[#FAF9F6] dark:bg-[#141416] text-[#171614] dark:text-[#F1EEE8]"
              >
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onTogglePin}
            aria-label={activeNote.pinned ? 'Unpin current note' : 'Pin current note'}
            title={activeNote.pinned ? 'Pinned note (Click to unpin)' : 'Pin note to top'}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeNote.pinned
                ? 'text-[#29251F] dark:text-[#B7A895] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F]'
                : 'text-[#70685E] dark:text-[#A7A29A] hover:text-[#171614] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F]'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${activeNote.pinned ? 'fill-current' : ''}`} />
            <span className="hidden 2xl:inline">{activeNote.pinned ? 'Pinned' : 'Pin'}</span>
          </button>
        </div>

        {/* Center Zone: Typography & Formatting Bar */}
        <div className="hidden md:flex items-center gap-1 rounded-xl border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/85 dark:bg-[#141416]/90 p-1">
          {/* Font Family Switcher */}
          <div className="flex items-center pr-1 border-r border-[#DED8CF] dark:border-[#303034]">
            {FONT_OPTIONS.map((font) => {
              const active = editorFont === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onChangeEditorFont(font.id)}
                  aria-label={`Use ${font.label} typography`}
                  className={`relative rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-[#171614] dark:text-[#F1EEE8]'
                      : 'text-[#70685E] dark:text-[#A7A29A] hover:text-[#171614] dark:hover:text-[#F1EEE8]'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-lg bg-[#FAF9F6] dark:bg-[#1C1C1F] shadow-2xs border border-[#DED8CF]/80 dark:border-[#303034] transition-all duration-150" />
                  )}
                  <span className="relative z-10">{font.label}</span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Markdown Formatting Actions */}
          <div className="flex items-center gap-0.5 pl-0.5">
            <button
              type="button"
              onClick={() => onApplyFormat('heading')}
              title="Heading"
              aria-label="Format Heading"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('bold')}
              title="Bold (Cmd/Ctrl + B)"
              aria-label="Format Bold"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('italic')}
              title="Italic (Cmd/Ctrl + I)"
              aria-label="Format Italic"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('quote')}
              title="Blockquote"
              aria-label="Format Quote"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('bullet')}
              title="Bullet List"
              aria-label="Format Bullet List"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('code')}
              title="Inline Code"
              aria-label="Format Inline Code"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onApplyFormat('divider')}
              title="Insert Horizontal Rule"
              aria-label="Insert Divider"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/70 dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Zone: Truthful Autosave Status + Productivity Utilities + Theme Switch */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Save Status Indicator */}
          <div
            aria-live="polite"
            className="hidden sm:flex items-center gap-1 pr-1.5 text-xs font-mono tabular-nums"
          >
            {saveStatus === 'error' ? (
              <button
                type="button"
                onClick={onRetrySave}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Click to retry saving to browser storage"
              >
                <span>Unable to save</span>
                <RotateCw className="h-3 w-3" />
              </button>
            ) : (
              <span className="text-[#70685E] dark:text-[#A7A29A] transition-opacity duration-150">
                {saveStatusText}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleWideMeasure}
            title={
              isWideMeasure
                ? 'Switch to standard reading width (68ch)'
                : 'Switch to wide canvas width (86ch)'
            }
            aria-label={isWideMeasure ? 'Standard width' : 'Wide width'}
            className="hidden xl:flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors whitespace-nowrap shrink-0"
          >
            {isWideMeasure ? 'Wide' : 'Standard'}
          </button>

          {/* Duplicate Note */}
          <button
            type="button"
            onClick={onDuplicateNote}
            aria-label="Duplicate Note"
            title="Duplicate current note (Cmd/Ctrl + Shift + D)"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
          >
            <Files className="h-3.5 w-3.5" />
          </button>

          {/* Import File */}
          <button
            type="button"
            onClick={onTriggerImport}
            aria-label="Import TXT or MD"
            title="Import .txt, .md, or .json file"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>

          {/* Copy Entire Note */}
          <button
            type="button"
            onClick={onCopyNote}
            aria-label="Copy Note"
            title="Copy entire note (Cmd/Ctrl + Shift + C)"
            className="flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors whitespace-nowrap shrink-0"
          >
            {copiedRecently ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Export as TXT */}
          <button
            type="button"
            onClick={onExportTxt}
            aria-label="Export TXT"
            title="Export note as .txt file (Cmd/Ctrl + Shift + E)"
            className="flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export TXT</span>
          </button>

          {/* Delete Current Note */}
          <button
            type="button"
            onClick={onRequestDelete}
            aria-label={`Delete active note '${displayTitle}'`}
            title="Delete current note"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-rose-700 dark:text-[#A7A29A] dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-[#DED8CF] dark:bg-[#303034] mx-0.5" aria-hidden="true" />

          {/* Shortcuts Reference */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            aria-label="Keyboard Shortcuts"
            title="Keyboard shortcuts & command palette (Cmd/Ctrl + K)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to Warm Ivory Light theme' : 'Switch to Obsidian Dark theme'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#F1EEE8] dark:hover:bg-[#1C1C1F] transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Typography & Formatting Strip (visible on < md screens) */}
      <div className="flex md:hidden items-center justify-between gap-2 overflow-x-auto border-t border-[#DED8CF]/60 dark:border-[#303034]/60 bg-[#F1EEE8]/60 dark:bg-[#141416]/70 px-3.5 py-1.5 no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          {FONT_OPTIONS.map((font) => {
            const active = editorFont === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onChangeEditorFont(font.id)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#29251F] text-[#FAF9F6] dark:bg-[#F1EEE8] dark:text-[#171614]'
                    : 'text-[#70685E] dark:text-[#A7A29A]'
                }`}
              >
                {font.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onApplyFormat('heading')}
            aria-label="Mobile Format Heading"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#70685E] dark:text-[#A7A29A]"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('bold')}
            aria-label="Mobile Format Bold"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#70685E] dark:text-[#A7A29A]"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('italic')}
            aria-label="Mobile Format Italic"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#70685E] dark:text-[#A7A29A]"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('bullet')}
            aria-label="Mobile Format Bullet List"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#70685E] dark:text-[#A7A29A]"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
