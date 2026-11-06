export type NoteCategory = 'Essays' | 'Journal' | 'Drafts' | 'Ideas';
export type EditorFont = 'serif' | 'sans' | 'mono';
export type FilterMode = 'all' | 'pinned' | 'recent';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteMetrics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export const NOTE_CATEGORIES: NoteCategory[] = ['Essays', 'Journal', 'Drafts', 'Ideas'];

export const MAX_TITLE_LENGTH = 300;
export const MAX_NOTE_CONTENT_LENGTH = 500_000;
export const MAX_NOTES_COUNT = 500;
export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

export const INITIAL_NOTES: Note[] = [
  {
    id: 'dx12-welcome-note',
    title: 'On Quiet Tools & Distraction-Free Writing',
    content: `A great writing instrument disappears the moment you begin to think.

Most modern software competes for your attention with stacked toolbars, notification badges, and nested menus. NŌTA is built on the opposite conviction: when the frame recedes, clarity emerges. Make room for thought.

Here is how this studio is structured:

- Write freely in the central canvas. Every keystroke is preserved automatically to local storage in your browser.
- Switch between Editorial Serif (Newsreader), Refined Sans (Inter), or Technical Mono (JetBrains Mono) depending on what you are drafting.
- Enter Zen Focus Mode (Cmd/Ctrl + \\) to hide the navigation drawer and let the page breathe.
- Open the Command & Shortcut Palette (Cmd/Ctrl + K) to jump between notes, duplicate, import/export plain text (.txt), or copy your manuscript in one keystroke.

Begin typing anywhere, or press Cmd/Ctrl + Alt + N to start a fresh page.`,
    category: 'Essays',
    pinned: true,
    createdAt: 1730800000000,
    updatedAt: 1730820000000,
  },
  {
    id: 'dx12-design-notes',
    title: 'Principles of Minimalist Interface Architecture',
    content: `1. Typography is the primary interface. Line measure should remain between 60 and 72 characters for effortless eye tracking across long passages.

2. Surface hierarchy should whisper rather than shout. Warm Ivory (#F1EEE8), Soft Paper (#FAF9F6), and Charcoal (#29251F) in daylight—paired with deep obsidian carbon (#0B0B0D) at night—prevent visual fatigue during long writing sessions.

3. Frictionless capture. When an idea arrives, there should be zero modal dialogs between thought and text.`,
    category: 'Ideas',
    pinned: true,
    createdAt: 1730750000000,
    updatedAt: 1730790000000,
  },
  {
    id: 'dx12-morning-journal',
    title: 'November Field Notes & Reading Log',
    content: `Currently reading through notes on industrial design and architectural restraint.

Key takeaway from this morning's session:
"Simplicity is about subtracting the obvious and adding the meaningful."

Tasks for the afternoon manuscript revision:
- Refine opening thesis in section one
- Trim redundant adjectives from the conclusion
- Export final draft as plain text for archival`,
    category: 'Journal',
    pinned: false,
    createdAt: 1730680000000,
    updatedAt: 1730710000000,
  },
];

/**
 * Strips non-printable ASCII control characters (except \n and \t) and normalizes line endings.
 */
export function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';
  const normalized = input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Strip control chars \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

export function isValidCategory(val: unknown): val is NoteCategory {
  return typeof val === 'string' && (NOTE_CATEGORIES as string[]).includes(val);
}

/**
 * Validates and sanitizes an untrusted object into a safe Note or returns null.
 * Protects against prototype pollution, missing fields, and oversized payloads.
 */
export function validateAndSanitizeNote(raw: unknown, fallbackNow: number = Date.now()): Note | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const rawId = typeof record.id === 'string' ? sanitizeText(record.id, 120).trim() : '';
  if (!rawId || rawId === '__proto__' || rawId === 'constructor' || rawId === 'prototype') {
    return null;
  }

  const title = sanitizeText(record.title ?? '', MAX_TITLE_LENGTH).replace(/\n/g, ' ');
  const content = sanitizeText(record.content ?? '', MAX_NOTE_CONTENT_LENGTH);
  const category: NoteCategory = isValidCategory(record.category) ? record.category : 'Drafts';
  const pinned = Boolean(record.pinned);

  const createdAt =
    typeof record.createdAt === 'number' && Number.isFinite(record.createdAt) && record.createdAt > 0
      ? record.createdAt
      : fallbackNow;

  const updatedAt =
    typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt) && record.updatedAt > 0
      ? record.updatedAt
      : createdAt;

  return {
    id: rawId,
    title,
    content,
    category,
    pinned,
    createdAt,
    updatedAt,
  };
}

/**
 * Sanitizes an array of notes from localStorage or JSON import, deduplicating IDs.
 */
export function sanitizeNoteList(rawList: unknown): Note[] | null {
  if (!Array.isArray(rawList)) return null;
  const seenIds = new Set<string>();
  const sanitized: Note[] = [];

  for (const item of rawList) {
    if (sanitized.length >= MAX_NOTES_COUNT) break;
    const valid = validateAndSanitizeNote(item);
    if (valid && !seenIds.has(valid.id)) {
      seenIds.add(valid.id);
      sanitized.push(valid);
    }
  }

  return sanitized;
}

export function computeNoteMetrics(text: string): NoteMetrics {
  const normalized = text.replace(/\r\n/g, '\n');
  const characters = normalized.length;
  const charactersNoSpaces = normalized.replace(/\s/g, '').length;

  const trimmed = normalized.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters,
      charactersNoSpaces: 0,
      lines: characters > 0 ? normalized.split('\n').length : 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    };
  }

  const wordsArray = trimmed.split(/\s+/).filter(Boolean);
  const words = wordsArray.length;
  const lines = normalized.split('\n').length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    readingTimeMinutes,
  };
}

export function createNewNote(
  partial?: Partial<Pick<Note, 'title' | 'content' | 'category' | 'pinned'>>,
  now: number = Date.now()
): Note {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    id: `note-${now}-${randomSuffix}`,
    title: sanitizeText(partial?.title ?? '', MAX_TITLE_LENGTH).replace(/\n/g, ' '),
    content: sanitizeText(partial?.content ?? '', MAX_NOTE_CONTENT_LENGTH),
    category: isValidCategory(partial?.category) ? partial.category : 'Drafts',
    pinned: Boolean(partial?.pinned),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateNoteInList(
  notes: Note[],
  id: string,
  changes: Partial<Pick<Note, 'title' | 'content' | 'category' | 'pinned'>>,
  now: number = Date.now()
): Note[] {
  return notes.map((note) => {
    if (note.id !== id) return note;
    const sanitizedTitle =
      changes.title !== undefined
        ? sanitizeText(changes.title, MAX_TITLE_LENGTH).replace(/\n/g, ' ')
        : note.title;
    const sanitizedContent =
      changes.content !== undefined
        ? sanitizeText(changes.content, MAX_NOTE_CONTENT_LENGTH)
        : note.content;
    const sanitizedCategory =
      changes.category !== undefined && isValidCategory(changes.category)
        ? changes.category
        : note.category;
    const sanitizedPinned =
      changes.pinned !== undefined ? Boolean(changes.pinned) : note.pinned;

    const contentChanged =
      sanitizedTitle !== note.title ||
      sanitizedContent !== note.content ||
      sanitizedCategory !== note.category;

    return {
      ...note,
      title: sanitizedTitle,
      content: sanitizedContent,
      category: sanitizedCategory,
      pinned: sanitizedPinned,
      updatedAt: contentChanged ? now : note.updatedAt,
    };
  });
}

export function duplicateNoteInList(
  notes: Note[],
  id: string,
  now: number = Date.now()
): { notes: Note[]; duplicatedNote: Note | null } {
  const source = notes.find((n) => n.id === id);
  if (!source) return { notes, duplicatedNote: null };

  const baseTitle = deriveNoteDisplayTitle(source);
  const copyTitle = sanitizeText(`${baseTitle} (Copy)`, MAX_TITLE_LENGTH);
  const duplicatedNote = createNewNote(
    {
      title: copyTitle,
      content: source.content,
      category: source.category,
      pinned: source.pinned,
    },
    now
  );

  return {
    notes: [duplicatedNote, ...notes],
    duplicatedNote,
  };
}

export function deleteNoteFromList(notes: Note[], id: string): Note[] {
  return notes.filter((n) => n.id !== id);
}

export interface FilterNotesOptions {
  searchQuery?: string;
  filterMode?: FilterMode;
  category?: NoteCategory | 'All';
  now?: number;
}

export function filterAndSortNotes(notes: Note[], options: FilterNotesOptions = {}): Note[] {
  const {
    searchQuery = '',
    filterMode = 'all',
    category = 'All',
  } = options;

  const query = searchQuery.trim().toLowerCase();

  const filtered = notes.filter((note) => {
    if (category !== 'All' && note.category !== category) {
      return false;
    }
    if (filterMode === 'pinned' && !note.pinned) {
      return false;
    }
    if (!query) return true;

    const titleMatch = note.title.toLowerCase().includes(query);
    const contentMatch = note.content.toLowerCase().includes(query);
    const categoryMatch = note.category.toLowerCase().includes(query);
    return titleMatch || contentMatch || categoryMatch;
  });

  return [...filtered].sort((a, b) => {
    if (filterMode === 'recent') {
      return b.updatedAt - a.updatedAt;
    }
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export function deriveNoteDisplayTitle(note: Pick<Note, 'title' | 'content'>): string {
  const cleanTitle = note.title.trim();
  if (cleanTitle.length > 0) return cleanTitle;

  const firstNonEmptyLine = note.content
    .split('\n')
    .map((line) => line.replace(/^[#>*-\s]+/, '').trim())
    .find((line) => line.length > 0);

  if (firstNonEmptyLine) {
    return firstNonEmptyLine.length > 48
      ? `${firstNonEmptyLine.slice(0, 48)}...`
      : firstNonEmptyLine;
  }

  return 'Untitled Note';
}

export function deriveNoteExcerpt(content: string, maxLength: number = 90): string {
  const cleaned = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');

  if (!cleaned) return 'Empty note — start writing...';
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}

export function formatNoteForTxtExport(note: Note): { filename: string; body: string } {
  const displayTitle = deriveNoteDisplayTitle(note);
  const slug =
    displayTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-note';

  const filename = `${slug}.txt`;
  const hasTitle = note.title.trim().length > 0;
  const body = hasTitle
    ? `${note.title.trim()}\n${'='.repeat(Math.min(60, note.title.trim().length))}\n\n${note.content}`
    : note.content;

  return { filename, body };
}

export interface FileImportResult {
  ok: boolean;
  error?: string;
  importedNotes: Note[];
}

/**
 * Safely validates and parses an imported .txt, .md, or .json file.
 * Enforces file extension whitelist, byte size limit, binary null-byte rejection, and schema sanitization.
 */
export function validateAndParseImportedFile(
  fileName: string,
  fileSize: number,
  rawText: string,
  defaultCategory: NoteCategory = 'Drafts',
  now: number = Date.now()
): FileImportResult {
  const lowerName = fileName.trim().toLowerCase();
  const allowedExtensions = ['.txt', '.md', '.markdown', '.json'];
  const hasAllowedExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));

  if (!hasAllowedExtension) {
    return {
      ok: false,
      error: 'Unsupported file type. Only .txt, .md, and .json files are permitted.',
      importedNotes: [],
    };
  }

  if (fileSize > MAX_IMPORT_FILE_BYTES || rawText.length > MAX_IMPORT_FILE_BYTES) {
    return {
      ok: false,
      error: 'File exceeds the 2 MB security limit.',
      importedNotes: [],
    };
  }

  // Reject binary payloads containing null bytes
  if (rawText.includes('\u0000')) {
    return {
      ok: false,
      error: 'Binary or corrupted file detected. Please import valid UTF-8 plain text.',
      importedNotes: [],
    };
  }

  if (lowerName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(rawText);
      const listCandidate = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).notes)
        ? (parsed as Record<string, unknown>).notes
        : [parsed];

      const sanitized = sanitizeNoteList(listCandidate);
      if (!sanitized || sanitized.length === 0) {
        return {
          ok: false,
          error: 'No valid note records found in JSON file.',
          importedNotes: [],
        };
      }
      return { ok: true, importedNotes: sanitized };
    } catch {
      return {
        ok: false,
        error: 'Malformed JSON file.',
        importedNotes: [],
      };
    }
  }

  // Plain text (.txt / .md) import
  const baseName = fileName.replace(/\.(txt|md|markdown)$/i, '').trim();
  const sanitizedContent = sanitizeText(rawText, MAX_NOTE_CONTENT_LENGTH);
  const sanitizedTitle = sanitizeText(baseName || 'Imported Note', MAX_TITLE_LENGTH);

  const note = createNewNote(
    {
      title: sanitizedTitle,
      content: sanitizedContent,
      category: defaultCategory,
      pinned: false,
    },
    now
  );

  return {
    ok: true,
    importedNotes: [note],
  };
}

export type InlineFormatType = 'bold' | 'italic' | 'code' | 'heading' | 'quote' | 'bullet' | 'divider';

export function applyTextFormatting(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: InlineFormatType
): { newContent: string; newSelectionStart: number; newSelectionEnd: number } {
  const start = Math.max(0, Math.min(selectionStart, content.length));
  const end = Math.max(start, Math.min(selectionEnd, content.length));
  const selected = content.slice(start, end);
  const before = content.slice(0, start);
  const after = content.slice(end);

  if (format === 'bold') {
    const replacement = `**${selected || 'bold text'}**`;
    const innerStart = start + 2;
    const innerEnd = innerStart + (selected ? selected.length : 'bold text'.length);
    return {
      newContent: `${before}${replacement}${after}`,
      newSelectionStart: innerStart,
      newSelectionEnd: innerEnd,
    };
  }

  if (format === 'italic') {
    const replacement = `*${selected || 'italic text'}*`;
    const innerStart = start + 1;
    const innerEnd = innerStart + (selected ? selected.length : 'italic text'.length);
    return {
      newContent: `${before}${replacement}${after}`,
      newSelectionStart: innerStart,
      newSelectionEnd: innerEnd,
    };
  }

  if (format === 'code') {
    const replacement = `\`${selected || 'code'}\``;
    const innerStart = start + 1;
    const innerEnd = innerStart + (selected ? selected.length : 'code'.length);
    return {
      newContent: `${before}${replacement}${after}`,
      newSelectionStart: innerStart,
      newSelectionEnd: innerEnd,
    };
  }

  if (format === 'divider') {
    const prefix = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
    const suffix = after.startsWith('\n') ? '\n' : '\n\n';
    const insertion = `${prefix}---${suffix}`;
    const cursor = start + insertion.length;
    return {
      newContent: `${before}${insertion}${after}`,
      newSelectionStart: cursor,
      newSelectionEnd: cursor,
    };
  }

  const prefixMap: Record<'heading' | 'quote' | 'bullet', string> = {
    heading: '## ',
    quote: '> ',
    bullet: '- ',
  };
  const prefix = prefixMap[format];
  const targetText =
    selected ||
    (format === 'heading'
      ? 'Section Heading'
      : format === 'quote'
      ? 'Quoted reflection'
      : 'List item');
  const formattedLines = targetText
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join('\n');

  return {
    newContent: `${before}${formattedLines}${after}`,
    newSelectionStart: start,
    newSelectionEnd: start + formattedLines.length,
  };
}

export function formatRelativeTimestamp(timestamp: number, now: number = Date.now()): string {
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
