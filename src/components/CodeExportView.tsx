import React, { useState } from 'react';
import { HudConfig } from '../types/hud';
import {
  generatePythonGtkCode,
  generateGtkCss,
  generateConfigJson,
  generateInstallScript,
  generateDesktopFile,
  generateSystemdService,
} from '../utils/generators';
import JSZip from 'jszip';
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Layers,
  FileText,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

interface CodeExportViewProps {
  config: HudConfig;
}

export const CodeExportView: React.FC<CodeExportViewProps> = ({ config }) => {
  const [activeFile, setActiveFile] = useState<
    'main.py' | 'style.css' | 'config.json' | 'install.sh' | 'desktop' | 'guide'
  >('main.py');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const pythonCode = generatePythonGtkCode(config);
  const cssCode = generateGtkCss(config);
  const jsonCode = generateConfigJson(config);
  const installCode = generateInstallScript();
  const desktopCode = generateDesktopFile();
  const systemdCode = generateSystemdService();

  const getActiveCode = () => {
    switch (activeFile) {
      case 'main.py':
        return pythonCode;
      case 'style.css':
        return cssCode;
      case 'config.json':
        return jsonCode;
      case 'install.sh':
        return installCode;
      case 'desktop':
        return desktopCode;
      case 'guide':
        return '';
    }
  };

  const handleCopy = () => {
    const text = getActiveCode();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('ubuntu-float-hud');
      if (folder) {
        folder.file('main.py', pythonCode);
        folder.file('style.css', cssCode);
        folder.file('config.json', jsonCode);
        folder.file('install.sh', installCode);
        folder.file('ubuntu-float-hud.desktop', desktopCode);
        folder.file('ubuntu-float-hud.service', systemdCode);
        folder.file(
          'README.md',
          `# Ubuntu GTK4 FloatHUD\n\nMonitor flotante de clima, temperatura de laptop, CPU y RAM para GNOME Desktop.\n\n## Instalación rápida en Ubuntu:\n\`\`\`bash\nchmod +x install.sh\n./install.sh\n\`\`\`\n`
        );
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ubuntu-gtk4-floathud.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleFile = () => {
    const content = getActiveCode();
    if (!content) return;
    const filename =
      activeFile === 'desktop'
        ? 'ubuntu-float-hud.desktop'
        : activeFile;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-white/10 text-neutral-200">
      {/* Barra de título del Exportador */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-950/70">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Código Fuente Nativo GTK4 & Instalador
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Generado según tus ajustes de tema, clima y sensores
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e95420] hover:bg-[#d04618] text-white rounded-lg text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {isZipping ? 'Comprimiendo...' : 'Descargar Paquete (.zip)'}
        </button>
      </div>

      {/* Selector de archivos */}
      <div className="flex border-b border-white/10 bg-neutral-950/40 p-1.5 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveFile('main.py')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'main.py'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-yellow-400" />
          main.py (GTK4 App)
        </button>

        <button
          onClick={() => setActiveFile('style.css')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'style.css'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          style.css (Adwaita)
        </button>

        <button
          onClick={() => setActiveFile('config.json')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'config.json'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          config.json
        </button>

        <button
          onClick={() => setActiveFile('install.sh')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'install.sh'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-orange-400" />
          install.sh
        </button>

        <button
          onClick={() => setActiveFile('desktop')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'desktop'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          .desktop (Lanzador)
        </button>

        <button
          onClick={() => setActiveFile('guide')}
          className={`flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeFile === 'guide'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          📖 Guía Ubuntu
        </button>
      </div>

      {/* Visor de código o Guía */}
      <div className="flex-1 overflow-y-auto relative p-4 font-mono text-xs">
        {activeFile === 'guide' ? (
          <div className="space-y-4 font-sans text-xs text-neutral-300 pr-2">
            <div className="p-3.5 rounded-xl bg-neutral-800/60 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#e95420]" />
                Paso 1: Instalación en Ubuntu 22.04 o 24.04 LTS
              </h3>
              <p className="text-neutral-400 text-xs">
                Abre una terminal en Ubuntu (`Ctrl + Alt + T`) y ejecuta:
              </p>
              <pre className="p-3 bg-black/60 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-white/5">
                {`# 1. Instalar dependencias oficiales de GTK4 y Python
sudo apt update
sudo apt install -y python3-gi python3-gi-cairo gir1.2-gtk-4.0 gir1.2-adw-1 python3-psutil python3-requests lm-sensors

# 2. Descargar y descomprimir el paquete
unzip ubuntu-gtk4-floathud.zip
cd ubuntu-float-hud

# 3. Dar permisos y ejecutar instalador automático
chmod +x install.sh
./install.sh`}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-800/60 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                ⚙️ Paso 2: Ejecución y Autoinicio GNOME
              </h3>
              <p className="text-neutral-400 text-xs">
                Para probarlo inmediatamente sin reiniciar:
              </p>
              <pre className="p-3 bg-black/60 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-white/5">
                {`~/.local/bin/ubuntu-float-hud &`}
              </pre>
              <p className="text-neutral-400 text-[11px]">
                El instalador ya registra el archivo <code className="text-white">~/.config/autostart/ubuntu-float-hud.desktop</code> para que inicie automáticamente cada vez que inicies sesión en Ubuntu.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-800/60 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                🐧 Compatibilidad Wayland vs X11
              </h3>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 text-xs">
                <li>
                  <strong className="text-white">Ubuntu 24.04 (Wayland por defecto):</strong> Funciona directamente con GTK4 y Libadwaita. El arrastre con el cursor y la opacidad Adwaita están soportados de forma nativa.
                </li>
                <li>
                  <strong className="text-white">Ubuntu 22.04 LTS (X11 / Wayland):</strong> Total compatibilidad con ventanas flotantes sin bordes mediante <code className="text-orange-400">set_decorated(False)</code>.
                </li>
                <li>
                  <strong className="text-white">Detección de Temperatura:</strong> Utiliza el subsistema <code className="text-emerald-400">/sys/class/thermal</code> y el módulo <code className="text-emerald-400">psutil</code> para leer sensores de CPU de Intel Core y AMD Ryzen.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Botones de acción flotantes de código */}
            <div className="sticky top-0 z-10 flex items-center justify-between pb-3 bg-neutral-900 border-b border-white/5 mb-3">
              <span className="text-neutral-400 text-[11px] font-sans">
                Mostrando <strong className="text-white font-mono">{activeFile}</strong>
              </span>

              <div className="flex items-center gap-2 font-sans">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>

                <button
                  onClick={handleDownloadSingleFile}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar archivo
                </button>
              </div>
            </div>

            <pre className="text-neutral-300 leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg border border-white/5 whitespace-pre">
              {getActiveCode()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
