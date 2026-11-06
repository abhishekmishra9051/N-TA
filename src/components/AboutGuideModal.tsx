import React, { useEffect } from 'react';
import { X, Shield, BookOpen, HelpCircle, FileCheck, ArrowRight, Download } from 'lucide-react';
import { NotaWordmark } from './NotaLogo';

export type GuideTab = 'overview' | 'faq' | 'privacy' | 'terms';

interface AboutGuideModalProps {
  isOpen: boolean;
  activeTab: GuideTab;
  onTabChange: (tab: GuideTab) => void;
  onClose: () => void;
  onStartWriting: () => void;
  onDownloadBackupJson: () => void;
}

const TABS: { id: GuideTab; label: string }[] = [
  { id: 'overview', label: 'Studio Guide' },
  { id: 'faq', label: 'FAQ' },
  { id: 'privacy', label: 'Privacy & Security' },
  { id: 'terms', label: 'Terms of Use' },
];

export const AboutGuideModal: React.FC<AboutGuideModalProps> = ({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onStartWriting,
  onDownloadBackupJson,
}) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171614]/55 backdrop-blur-[2px] transition-opacity duration-150"
        aria-hidden="true"
      />

      <article className="relative z-10 flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DED8CF] dark:border-[#303034] bg-[#FAF9F6] dark:bg-[#141416] text-[#171614] dark:text-[#F1EEE8] shadow-2xl">
        {/* Top Modal Header */}
        <header className="flex items-center justify-between border-b border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/65 dark:bg-[#1C1C1F]/65 px-6 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <NotaWordmark size="sm" showTagline={false} />
              <span className="text-[#88877D] dark:text-[#A7A29A]" aria-hidden="true">
                —
              </span>
              <h2 id="about-guide-title" className="text-sm font-semibold tracking-tight text-[#29251F] dark:text-[#F1EEE8]">
                Minimalist Online Notepad &amp; Writing Studio
              </h2>
            </div>
            <p className="text-xs text-[#70685E] dark:text-[#A7A29A]">
              Make room for thought. · Your notes stay in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close documentation dialog"
            className="rounded-lg p-1.5 text-[#70685E] hover:text-[#171614] dark:text-[#A7A29A] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#232327] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav
          aria-label="Documentation sections"
          className="flex items-center gap-1 border-b border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/40 dark:bg-[#141416] px-6 py-2 overflow-x-auto no-scrollbar"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#171614] text-[#FAF9F6] dark:bg-[#F1EEE8] dark:text-[#171614]'
                    : 'text-[#70685E] dark:text-[#A7A29A] hover:text-[#171614] dark:hover:text-[#F1EEE8] hover:bg-[#E6E1D8]/60 dark:hover:bg-[#1C1C1F]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm leading-relaxed text-[#29251F] dark:text-[#F1EEE8]/90">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-2 text-[#171614] dark:text-[#F1EEE8] font-semibold text-base mb-2">
                  <BookOpen className="h-4 w-4 text-[#70685E] dark:text-[#B7A895]" />
                  <h3>NŌTA — Make room for thought.</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#70685E] dark:text-[#A7A29A] leading-relaxed">
                  NŌTA is a minimalist digital writing studio designed to give thoughts a quiet place to exist. Built for writers, essayists, researchers, and thinkers who value typographic calm, NŌTA opens directly into a distraction-free writing canvas with no account required. Your notes stay in your browser.
                </p>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/45 dark:bg-[#1C1C1F]/60">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    1. Truthful Local-First Autosave
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Write immediately. Every note is validated and saved in your browser&apos;s local storage, displaying &ldquo;Saved&rdquo; only after the write is confirmed.
                  </p>
                </div>
                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/45 dark:bg-[#1C1C1F]/60">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    2. Editorial Typography &amp; Zen Focus
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Switch seamlessly between Newsreader (Editorial Serif), Inter (Refined Sans), and JetBrains Mono, or press Cmd/Ctrl + \ for Zen Focus Mode.
                  </p>
                </div>
                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/45 dark:bg-[#1C1C1F]/60">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    3. Live Word &amp; Character Counts
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Monitor live word count, character count, paragraph count, and reading time in quiet tabular numerals along the bottom bar.
                  </p>
                </div>
                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/45 dark:bg-[#1C1C1F]/60">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    4. Portable Plain Text &amp; JSON Backups
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Import existing .txt, .md, or validated .json files from your computer and export any note as UTF-8 plain text at any time.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#171614] dark:text-[#F1EEE8] mb-2">
                  Writing Workflow in NŌTA
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#70685E] dark:text-[#A7A29A]">
                  <li>
                    <strong className="text-[#29251F] dark:text-[#F1EEE8]">Create or Select a Note:</strong> Click <em>New Note</em> in the sidebar (or press <code className="font-mono">⌘ ⌥ N</code>) to open a fresh sheet.
                  </li>
                  <li>
                    <strong className="text-[#29251F] dark:text-[#F1EEE8]">Organize &amp; Pin:</strong> Assign notes to <em>Essays</em>, <em>Journal</em>, <em>Drafts</em>, or <em>Ideas</em>, and pin active manuscripts to keep them anchored at the top.
                  </li>
                  <li>
                    <strong className="text-[#29251F] dark:text-[#F1EEE8]">Format &amp; Customize:</strong> Use the top bar or keyboard shortcuts (<code className="font-mono">⌘ B</code>, <code className="font-mono">⌘ I</code>) for clean Markdown formatting and toggle between Standard (68ch) and Wide (86ch) reading widths.
                  </li>
                  <li>
                    <strong className="text-[#29251F] dark:text-[#F1EEE8]">Import, Duplicate, or Export:</strong> Open the Command Palette (<code className="font-mono">⌘ K</code>) to duplicate a note, import a <code className="font-mono">.txt</code>/<code className="font-mono">.md</code>/<code className="font-mono">.json</code> file, or export your work.
                  </li>
                </ol>
              </section>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#171614] dark:text-[#F1EEE8] font-semibold text-base mb-1">
                <HelpCircle className="h-4 w-4 text-[#70685E] dark:text-[#B7A895]" />
                <h3>Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/30 dark:bg-[#1C1C1F]/40">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    Where are my notes stored in NŌTA?
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Your notes stay in your browser. All notes are stored locally in your web browser&apos;s <code className="font-mono">localStorage</code> on your device. They are never uploaded to any external server, never shared with third parties, and never indexed by search engines.
                  </p>
                </div>

                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/30 dark:bg-[#1C1C1F]/40">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    Does NŌTA save notes automatically?
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Yes. Every keystroke is validated and written to persistent browser storage automatically. NŌTA only displays &ldquo;Saved&rdquo; after the browser storage write succeeds.
                  </p>
                </div>

                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/30 dark:bg-[#1C1C1F]/40">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    Can I export or import plain text (.txt) and Markdown (.md) files?
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    Yes. You can export any note as a UTF-8 <code className="font-mono">.txt</code> file via the <em>Export TXT</em> button (<code className="font-mono">⌘ ⇧ E</code>), download a complete JSON archive of all notes, and import <code className="font-mono">.txt</code>, <code className="font-mono">.md</code>, or validated <code className="font-mono">.json</code> files from your computer.
                  </p>
                </div>

                <div className="rounded-xl border border-[#DED8CF] dark:border-[#303034] p-4 bg-[#F1EEE8]/30 dark:bg-[#1C1C1F]/40">
                  <h4 className="text-xs font-semibold text-[#171614] dark:text-[#F1EEE8]">
                    Is NŌTA free and does it require an account?
                  </h4>
                  <p className="mt-1 text-xs text-[#70685E] dark:text-[#A7A29A]">
                    NŌTA is completely free to use and requires no account, sign-up, or subscription. Open the studio and begin writing immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#171614] dark:text-[#F1EEE8] font-semibold text-base">
                  <Shield className="h-4 w-4 text-[#70685E] dark:text-[#B7A895]" />
                  <h3>Privacy Policy &amp; Local-First Architecture</h3>
                </div>
                <button
                  type="button"
                  onClick={onDownloadBackupJson}
                  className="flex items-center gap-1.5 rounded-lg border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8] dark:bg-[#1C1C1F] px-3 py-1.5 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#232327] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Backup (.JSON)</span>
                </button>
              </div>
              <p className="text-xs text-[#70685E] dark:text-[#A7A29A]">
                <strong>Core Principle:</strong> Your notes stay in your browser.
              </p>
              <div className="space-y-3 text-xs text-[#70685E] dark:text-[#A7A29A] leading-relaxed">
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">1. Local-First Browser Storage:</strong> NŌTA operates on a strict local-first architecture. Everything you write—including note titles, body text, categories, and reading preferences—is stored directly inside your browser&apos;s <code className="font-mono">localStorage</code> (preserving the <code className="font-mono">dx12_notes_v1</code> storage key for seamless continuity). No notes are transmitted to any backend server.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">2. Transparent Storage Security:</strong> Because notes are stored in standard browser <code className="font-mono">localStorage</code> without server-side accounts, data is isolated to your browser profile on your device. NŌTA does not claim cryptographic encryption over <code className="font-mono">localStorage</code>; if you use a shared public computer, export your notes as <code className="font-mono">.txt</code> and delete them when finished.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">3. Protection Against Search Indexing of Private Notes:</strong> Because your notes exist only in client-side browser storage and are never rendered on public server URLs, search engine crawlers cannot access or index your private writing.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">4. Validated File Import &amp; Export:</strong> When you import a <code className="font-mono">.txt</code>, <code className="font-mono">.md</code>, or <code className="font-mono">.json</code> file (up to 2 MB), the file is parsed and sanitized entirely within your browser&apos;s memory. No files are uploaded over the network.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#171614] dark:text-[#F1EEE8] font-semibold text-base mb-1">
                <FileCheck className="h-4 w-4 text-[#70685E] dark:text-[#B7A895]" />
                <h3>Terms of Use</h3>
              </div>
              <div className="space-y-3 text-xs text-[#70685E] dark:text-[#A7A29A] leading-relaxed">
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">1. Acceptance of Terms:</strong> By accessing and using NŌTA — Writing Studio, you agree to these Terms of Use.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">2. Ownership of Written Content:</strong> You retain 100% ownership and copyright of all notes, essays, journals, drafts, and manuscripts you create or edit within NŌTA.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">3. Local Storage &amp; Backups:</strong> Because NŌTA stores data locally in your browser without cloud accounts, you are responsible for maintaining backups of critical manuscripts using the built-in <em>Export TXT</em> or <em>Download Backup (.JSON)</em> features before clearing browser site data or switching devices.
                </p>
                <p>
                  <strong className="text-[#29251F] dark:text-[#F1EEE8]">4. Disclaimer of Warranties:</strong> The software is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied, including but not limited to fitness for a particular purpose.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <footer className="flex items-center justify-between border-t border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8]/65 dark:bg-[#1C1C1F]/65 px-6 py-3.5">
          <span className="text-xs text-[#70685E] dark:text-[#A7A29A]">
            NŌTA · Make room for thought.
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartWriting();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#171614] dark:bg-[#F1EEE8] px-4 py-2 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors"
          >
            <span>Return to Writing Canvas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </footer>
      </article>
    </div>
  );
};
