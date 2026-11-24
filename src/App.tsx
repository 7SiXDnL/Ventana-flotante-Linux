import React, { useState, useEffect, useRef } from 'react';
import { HudConfig, DEFAULT_CONFIG, WeatherData, HardwareData } from './types/hud';
import { fetchLiveWeather } from './utils/weather';
import { HardwareSimulator, ThermalProfile } from './utils/hardwareSimulator';
import { UbuntuDesktop } from './components/UbuntuDesktop';
import { CustomizerPanel } from './components/CustomizerPanel';
import { CodeExportView } from './components/CodeExportView';
import { TopNav } from './components/TopNav';
import {
  generatePythonGtkCode,
  generateGtkCss,
  generateConfigJson,
  generateInstallScript,
  generateDesktopFile,
  generateSystemdService,
} from './utils/generators';
import JSZip from 'jszip';
import { SlidersHorizontal, Terminal, Monitor, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ubuntu_gtk4_floathud_config_v1';

export default function App() {
  // Load config from local storage if available
  const [config, setConfig] = useState<HudConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_CONFIG;
  });

  const [activeView, setActiveView] = useState<'desktop' | 'code'>('desktop');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const [activeThermalProfile, setActiveThermalProfile] = useState<ThermalProfile>('balanced');

  // Simulator ref
  const simulatorRef = useRef<HardwareSimulator>(new HardwareSimulator());
  const [hardware, setHardware] = useState<HardwareData>(() => simulatorRef.current.tick());

  // Weather data
  const [weather, setWeather] = useState<WeatherData>({
    city: config.weather.city,
    country: '',
    temperature: 21.4,
    feelsLike: 20.8,
    weatherCode: 1,
    weatherDescription: 'Mayormente Despejado',
    humidity: 48,
    windSpeedKmH: 14.2,
    precipitationMm: 0,
    isDay: true,
    lastUpdated: '14:30',
  });

  // Save config on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore
    }
  }, [config]);

  // Tick hardware simulation at config.hardware.refreshIntervalMs
  useEffect(() => {
    const interval = setInterval(() => {
      setHardware(simulatorRef.current.tick());
    }, config.hardware.refreshIntervalMs);
    return () => clearInterval(interval);
  }, [config.hardware.refreshIntervalMs]);

  // Fetch weather on mount and when city/coordinates change
  const refreshWeather = async () => {
    if (!config.weather.enabled) return;
    setIsRefreshingWeather(true);
    try {
      const data = await fetchLiveWeather(
        config.weather.city,
        config.weather.latitude,
        config.weather.longitude,
        config.weather.unit
      );
      setWeather(data);
    } catch (err) {
      console.error('Error fetching live weather:', err);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  useEffect(() => {
    refreshWeather();
    // Auto-refresh timer based on config
    const minutes = Math.max(5, config.weather.refreshMinutes);
    const timer = setInterval(refreshWeather, minutes * 60 * 1000);
    return () => clearInterval(timer);
  }, [config.weather.city, config.weather.latitude, config.weather.longitude, config.weather.unit]);

  const handleSelectThermalProfile = (profile: ThermalProfile) => {
    setActiveThermalProfile(profile);
    simulatorRef.current.setProfile(profile);
    setHardware(simulatorRef.current.tick());
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder('ubuntu-float-hud');
      if (folder) {
        folder.file('main.py', generatePythonGtkCode(config));
        folder.file('style.css', generateGtkCss(config));
        folder.file('config.json', generateConfigJson(config));
        folder.file('install.sh', generateInstallScript());
        folder.file('ubuntu-float-hud.desktop', generateDesktopFile());
        folder.file('ubuntu-float-hud.service', generateSystemdService());
        folder.file(
          'README.md',
          `# Ubuntu GTK4 FloatHUD\n\nAplicación nativa GTK4/Libadwaita para Ubuntu y GNOME con ventana flotante para clima en tiempo real, temperatura de laptop, velocidad de procesador y memoria RAM.\n\n## Instalación:\n\`\`\`bash\nchmod +x install.sh\n./install.sh\n\`\`\`\n`
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
    } catch (e) {
      console.error('Error creating zip bundle:', e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100">
      {/* Barra de navegación superior */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSettings={() => setShowSettingsDrawer(true)}
        onDownloadZip={handleDownloadZip}
      />

      {/* Área principal */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Vista principal: Simulador de Escritorio Ubuntu */}
        {activeView === 'desktop' ? (
          <div className="flex-1 flex relative overflow-hidden">
            <main className="flex-1 h-full overflow-hidden">
              <UbuntuDesktop
                config={config}
                weather={weather}
                hardware={hardware}
                onConfigChange={setConfig}
                onOpenSettings={() => setShowSettingsDrawer(!showSettingsDrawer)}
                onSelectThermalProfile={handleSelectThermalProfile}
                activeThermalProfile={activeThermalProfile}
              />
            </main>

            {/* Panel Lateral de Personalización */}
            {showSettingsDrawer && (
              <aside
                aria-label="Panel de configuración de FloatHUD"
                className="w-80 md:w-96 h-full flex-shrink-0 z-20 shadow-2xl transition-all"
              >
                <CustomizerPanel
                  config={config}
                  onChange={setConfig}
                  onReset={handleResetConfig}
                  onRefreshWeather={refreshWeather}
                  isRefreshingWeather={isRefreshingWeather}
                  onClose={() => setShowSettingsDrawer(false)}
                />
              </aside>
            )}

            {/* Botón flotante para abrir el panel si está oculto */}
            {!showSettingsDrawer && (
              <button
                onClick={() => setShowSettingsDrawer(true)}
                className="absolute right-4 bottom-4 z-30 flex items-center gap-2 px-3.5 py-2 bg-neutral-900/95 hover:bg-neutral-800 text-white rounded-xl border border-white/10 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105"
                title="Abrir panel de personalización"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#e95420]" />
                Personalizar GNOME
              </button>
            )}
          </div>
        ) : (
          /* Vista de Código GTK4 y Guía de Instalación */
          <main className="flex-1 h-full overflow-hidden">
            <CodeExportView config={config} />
          </main>
        )}
      </div>
    </div>
  );
}
