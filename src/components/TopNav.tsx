import React from 'react';
import { Download, Terminal } from 'lucide-react';

interface TopNavProps {
  activeView: 'desktop' | 'code';
  onSelectView: (view: 'desktop' | 'code') => void;
  onOpenSettings: () => void;
  onDownloadZip: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  onOpenSettings,
  onDownloadZip,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-neutral-950 border-b border-white/10 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#e95420]" />
        <span className="text-sm sm:text-base font-bold tracking-tight text-white font-sans whitespace-nowrap">
          Ubuntu FloatHUD GTK4
        </span>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
        <button
          onClick={() => onSelectView('desktop')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeView === 'desktop' ? 'text-white font-semibold border-b-2 border-[#e95420]' : ''
          }`}
        >
          Escritorio GNOME
        </button>

        <button
          onClick={() => {
            onSelectView('desktop');
            onOpenSettings();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
        >
          Ajustes de Personalización
        </button>

        <button
          onClick={() => onSelectView('code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeView === 'code' ? 'text-white font-semibold border-b-2 border-[#e95420]' : ''
          }`}
        >
          Código Fuente GTK4
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            if (activeView === 'desktop') onSelectView('code');
            else onSelectView('desktop');
          }}
          className="md:hidden px-2.5 py-1.5 text-xs text-neutral-300 bg-neutral-800 rounded-lg hover:text-white transition-colors"
        >
          {activeView === 'desktop' ? 'Ver Código' : 'Escritorio'}
        </button>

        <button
          onClick={onDownloadZip}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#e95420] hover:bg-[#d04618] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Descargar App (.zip)</span>
          <span className="sm:hidden">.zip</span>
        </button>
      </div>
    </header>
  );
};
