import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { NotaMark } from './NotaLogo';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleEmergencyBackup = () => {
    try {
      const raw = localStorage.getItem('dx12_notes_v1') || '[]';
      const blob = new Blob([raw], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota-notes-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore if storage is inaccessible
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] dark:bg-[#0B0B0D] px-6 text-center text-[#171614] dark:text-[#F1EEE8]">
          <div className="mb-5">
            <NotaMark size={44} />
          </div>
          <h1 className="font-nota-display text-2xl tracking-tight text-[#171614] dark:text-[#F1EEE8]">
            NŌTA Studio Recovery
          </h1>
          <p className="mt-2 max-w-md text-xs text-[#70685E] dark:text-[#A7A29A] leading-relaxed">
            An unexpected display error occurred. Your notes remain safely stored in your browser&apos;s local storage.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleEmergencyBackup}
              className="flex items-center gap-1.5 rounded-lg border border-[#DED8CF] dark:border-[#303034] bg-[#F1EEE8] dark:bg-[#141416] px-4 py-2 text-xs font-medium text-[#29251F] dark:text-[#F1EEE8] hover:bg-[#E6E1D8] dark:hover:bg-[#1C1C1F] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Emergency Backup (.JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 rounded-lg bg-[#171614] dark:bg-[#F1EEE8] px-4 py-2 text-xs font-medium text-[#FAF9F6] dark:text-[#171614] hover:bg-[#29251F] dark:hover:bg-[#E6E1D8] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reload NŌTA</span>
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
