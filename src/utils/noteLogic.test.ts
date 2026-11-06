import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeNoteMetrics,
  createNewNote,
  updateNoteInList,
  duplicateNoteInList,
  deleteNoteFromList,
  filterAndSortNotes,
  deriveNoteDisplayTitle,
  formatNoteForTxtExport,
  applyTextFormatting,
  validateAndSanitizeNote,
  sanitizeNoteList,
  validateAndParseImportedFile,
  INITIAL_NOTES,
} from './noteLogic';

test('computeNoteMetrics handles empty and whitespace strings accurately', () => {
  const emptyMetrics = computeNoteMetrics('');
  assert.equal(emptyMetrics.words, 0);
  assert.equal(emptyMetrics.characters, 0);
  assert.equal(emptyMetrics.charactersNoSpaces, 0);
  assert.equal(emptyMetrics.paragraphs, 0);
  assert.equal(emptyMetrics.readingTimeMinutes, 0);

  const whitespaceMetrics = computeNoteMetrics('   \n  ');
  assert.equal(whitespaceMetrics.words, 0);
  assert.equal(whitespaceMetrics.characters, 6);
  assert.equal(whitespaceMetrics.charactersNoSpaces, 0);
});

test('computeNoteMetrics counts words, characters, paragraphs, and reading time', () => {
  const text = 'Less UI. More writing.\n\nMaximum elegance in every paragraph.';
  const metrics = computeNoteMetrics(text);
  assert.equal(metrics.words, 9);
  assert.equal(metrics.characters, text.length);
  assert.equal(metrics.paragraphs, 2);
  assert.equal(metrics.lines, 3);
  assert.equal(metrics.readingTimeMinutes, 1);
});

test('createNewNote, updateNoteInList, duplicateNoteInList, and deleteNoteFromList manage notes deterministically', () => {
  const note = createNewNote({ title: 'First Draft', content: 'Hello world', category: 'Essays' }, 1000);
  assert.equal(note.title, 'First Draft');
  assert.equal(note.content, 'Hello world');
  assert.equal(note.category, 'Essays');
  assert.equal(note.pinned, false);
  assert.equal(note.createdAt, 1000);
  assert.equal(note.updatedAt, 1000);

  const list = [note];
  const updatedList = updateNoteInList(list, note.id, { content: 'Updated prose', pinned: true }, 2500);
  assert.equal(updatedList[0].content, 'Updated prose');
  assert.equal(updatedList[0].pinned, true);
  assert.equal(updatedList[0].updatedAt, 2500);

  const { notes: afterDuplicate, duplicatedNote } = duplicateNoteInList(updatedList, note.id, 3000);
  assert.equal(afterDuplicate.length, 2);
  assert.ok(duplicatedNote);
  assert.equal(duplicatedNote.title, 'First Draft (Copy)');
  assert.equal(duplicatedNote.content, 'Updated prose');

  const afterDelete = deleteNoteFromList(afterDuplicate, note.id);
  assert.equal(afterDelete.length, 1);
});

test('filterAndSortNotes filters by search query, pinned status, and category', () => {
  const pinnedOnly = filterAndSortNotes(INITIAL_NOTES, { filterMode: 'pinned' });
  assert.equal(pinnedOnly.every((n) => n.pinned), true);
  assert.equal(pinnedOnly.length, 2);

  const searchResult = filterAndSortNotes(INITIAL_NOTES, { searchQuery: 'industrial design' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 'dx12-morning-journal');

  const categoryResult = filterAndSortNotes(INITIAL_NOTES, { category: 'Essays' });
  assert.equal(categoryResult.length, 1);
  assert.equal(categoryResult[0].category, 'Essays');
});

test('deriveNoteDisplayTitle and formatNoteForTxtExport generate clean titles and filenames', () => {
  const untitledWithBody = createNewNote({ title: '', content: '# Morning Thoughts\nSome body text' });
  assert.equal(deriveNoteDisplayTitle(untitledWithBody), 'Morning Thoughts');

  const completelyBlank = createNewNote({ title: '', content: '   ' });
  assert.equal(deriveNoteDisplayTitle(completelyBlank), 'Untitled Note');

  const exported = formatNoteForTxtExport({
    ...untitledWithBody,
    title: 'Minimalist Design Notes',
    content: 'Clean typography first.',
  });
  assert.equal(exported.filename, 'minimalist-design-notes.txt');
  assert.equal(exported.body.includes('Minimalist Design Notes'), true);
  assert.equal(exported.body.includes('Clean typography first.'), true);
});

test('applyTextFormatting wraps selections accurately', () => {
  const res = applyTextFormatting('Hello world', 6, 11, 'bold');
  assert.equal(res.newContent, 'Hello **world**');
  assert.equal(res.newSelectionStart, 8);
  assert.equal(res.newSelectionEnd, 13);
});

test('validateAndSanitizeNote and sanitizeNoteList reject malformed, XSS/control-char, and prototype pollution payloads', () => {
  assert.equal(validateAndSanitizeNote(null), null);
  assert.equal(validateAndSanitizeNote('not-an-object'), null);
  assert.equal(validateAndSanitizeNote({ id: '__proto__', title: 'pollute' }), null);

  const dirty = validateAndSanitizeNote(
    {
      id: 'safe-1',
      title: 'Title\u0000With\nControlChars',
      content: '<script>alert(1)</script>\u0007Clean text',
      category: 'InvalidCategory',
      pinned: 'truthy',
      createdAt: -50,
    },
    5000
  );
  assert.ok(dirty);
  assert.equal(dirty.title, 'TitleWith ControlChars');
  assert.equal(dirty.content, '<script>alert(1)</script>Clean text');
  assert.equal(dirty.category, 'Drafts');
  assert.equal(dirty.pinned, true);
  assert.equal(dirty.createdAt, 5000);

  const deduped = sanitizeNoteList([dirty, dirty, { invalid: true }]);
  assert.ok(deduped);
  assert.equal(deduped.length, 1);
});

test('validateAndParseImportedFile enforces extension whitelist, size limits, and binary rejection', () => {
  const badExt = validateAndParseImportedFile('exploit.exe', 100, 'MZ...');
  assert.equal(badExt.ok, false);

  const binaryNull = validateAndParseImportedFile('notes.txt', 50, 'hello\u0000world');
  assert.equal(binaryNull.ok, false);

  const oversized = validateAndParseImportedFile('huge.txt', 5 * 1024 * 1024, 'text');
  assert.equal(oversized.ok, false);

  const validTxt = validateAndParseImportedFile('Manuscript Draft.txt', 42, 'Chapter 1\n\nQuiet minimalism.', 'Essays', 9000);
  assert.equal(validTxt.ok, true);
  assert.equal(validTxt.importedNotes.length, 1);
  assert.equal(validTxt.importedNotes[0].title, 'Manuscript Draft');
  assert.equal(validTxt.importedNotes[0].category, 'Essays');

  const validJsonBackup = validateAndParseImportedFile(
    'nota-backup.json',
    180,
    JSON.stringify([{ id: 'nota-1', title: 'Restored Thought', content: 'Make room for thought.', category: 'Ideas', pinned: true }]),
    'Drafts',
    9500
  );
  assert.equal(validJsonBackup.ok, true);
  assert.equal(validJsonBackup.importedNotes.length, 1);
  assert.equal(validJsonBackup.importedNotes[0].title, 'Restored Thought');
  assert.equal(validJsonBackup.importedNotes[0].pinned, true);
});

