import React, { useRef, useState, useEffect } from 'react';
import { HudConfig, WeatherData, HardwareData } from '../types/hud';
import { FloatingHudWidget } from './FloatingHudWidget';
import { ThermalProfile } from '../utils/hardwareSimulator';
import {
  Terminal,
  Folder,
  Globe,
  Settings,
  Trash2,
  LayoutGrid,
  Volume2,
  Wifi,
  BatteryCharging,
  Maximize,
  Sliders,
  Flame,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface UbuntuDesktopProps {
  config: HudConfig;
  weather: WeatherData;
  hardware: HardwareData;
  onConfigChange: (newConfig: HudConfig) => void;
  onOpenSettings: () => void;
  onSelectThermalProfile: (profile: ThermalProfile) => void;
  activeThermalProfile: ThermalProfile;
}

export const UbuntuDesktop: React.FC<UbuntuDesktopProps> = ({
  config,
  weather,
  hardware,
  onConfigChange,
  onOpenSettings,
  onSelectThermalProfile,
  activeThermalProfile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 900, height: 600 });
  const [currentTime, setCurrentTime] = useState('');
  const [wallpaper, setWallpaper] = useState<'numbat' | 'slate' | 'aubergine'>('numbat');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) +
          ' ' +
          now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setBounds({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Background wallpapers matching Ubuntu Noble Numbat 24.04 and GNOME
  const getWallpaperStyle = () => {
    switch (wallpaper) {
      case 'numbat':
        // Iconic Ubuntu 24.04 warm gradient
        return 'radial-gradient(ellipse at 80% 20%, #77216F 0%, #5E2750 40%, #2C001E 85%)';
      case 'aubergine':
        return 'linear-gradient(135deg, #2c001e 0%, #1a0013 50%, #0d000a 100%)';
      case 'slate':
      default:
        return 'linear-gradient(145deg, #1b1e23 0%, #121417 100%)';
    }
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Barra de herramientas superior del simulador */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-neutral-900 border-b border-white/10 text-xs text-neutral-300">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-semibold text-white flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e95420]" />
            Ubuntu 24.04 (GNOME 46)
          </span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 text-[11px] hidden md:inline">
            Arrastra el HUD con el cursor para reposicionarlo en el escritorio
          </span>
        </div>

        {/* Controles de perfil térmico y wallpaper */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Carga Laptop:</span>
          <div className="flex items-center bg-neutral-800 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => onSelectThermalProfile('eco')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeThermalProfile === 'eco'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Eco
            </button>
            <button
              onClick={() => onSelectThermalProfile('balanced')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeThermalProfile === 'balanced'
                  ? 'bg-neutral-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => onSelectThermalProfile('performance')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeThermalProfile === 'performance'
                  ? 'bg-[#e95420] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Rendimiento
            </button>
            <button
              onClick={() => onSelectThermalProfile('stress')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeThermalProfile === 'stress'
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-400 hover:text-red-400'
              }`}
            >
              <Flame className="w-3 h-3" />
              Estrés
            </button>
          </div>

          <button
            onClick={() => {
              const wpList: ('numbat' | 'slate' | 'aubergine')[] = ['numbat', 'slate', 'aubergine'];
              const next = wpList[(wpList.indexOf(wallpaper) + 1) % wpList.length];
              setWallpaper(next);
            }}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-white/5 text-[11px] transition-colors"
            title="Cambiar fondo de escritorio"
          >
            Fondo: {wallpaper}
          </button>
        </div>
      </div>

      {/* Pantalla del escritorio GNOME */}
      <div
        ref={containerRef}
        style={{ background: getWallpaperStyle() }}
        className="relative flex-1 min-h-[560px] overflow-hidden flex flex-col justify-between"
      >
        {/* Barra superior GNOME Shell */}
        <div className="h-7 w-full bg-black/75 backdrop-blur-md px-3.5 flex items-center justify-between text-xs text-neutral-200 z-20 border-b border-black/40 shadow-sm font-sans">
          <div className="flex items-center gap-4">
            <span className="font-semibold tracking-wide hover:text-white cursor-pointer transition-colors text-[11px]">
              Actividades
            </span>
            <span className="text-neutral-400 text-[11px] hidden sm:inline">
              Ubuntu Desktop
            </span>
          </div>

          {/* Fecha y Hora central de GNOME */}
          <div className="font-medium text-[11px] text-neutral-200 cursor-pointer hover:text-white transition-colors">
            {currentTime || 'Mar 20 Oct 14:30'}
          </div>

          {/* Bandeja de estado rápida de GNOME */}
          <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-full cursor-pointer transition-colors text-[11px]">
            <Wifi className="w-3 h-3 text-neutral-300" />
            <Volume2 className="w-3 h-3 text-neutral-300" />
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <BatteryCharging className="w-3.5 h-3.5 text-neutral-300" />
              <span>{hardware.batteryPct}%</span>
            </div>
          </div>
        </div>

        {/* Dock lateral izquierdo de Ubuntu (Dash to Dock) */}
        <div className="absolute left-2 top-10 bottom-4 w-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-1.5 flex flex-col items-center justify-between z-10 shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <button
              className="w-9 h-9 rounded-xl bg-orange-600/90 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
              title="Ubuntu FloatHUD (Activo)"
            >
              <Gauge className="w-5 h-5" />
            </button>
            <button
              className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title="Archivos"
            >
              <Folder className="w-5 h-5 text-orange-400" />
            </button>
            <button
              className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title="Navegador Web"
            >
              <Globe className="w-5 h-5 text-blue-400" />
            </button>
            <button
              className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title="Terminal GNOME"
            >
              <Terminal className="w-5 h-5 text-neutral-200" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title="Configuración de FloatHUD"
            >
              <Settings className="w-5 h-5 text-neutral-300" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              className="w-9 h-9 rounded-xl hover:bg-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
              title="Papelera"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-xl hover:bg-neutral-800/80 flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title="Mostrar Aplicaciones"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ventana Flotante GTK4 Interactiva en el espacio del escritorio */}
        <FloatingHudWidget
          config={config}
          weather={weather}
          hardware={hardware}
          containerBounds={bounds}
          onConfigChange={onConfigChange}
          onOpenSettings={onOpenSettings}
        />

        {/* Marca de agua elegante de Ubuntu Desktop */}
        <div className="absolute right-6 bottom-4 pointer-events-none opacity-20 text-right">
          <div className="text-4xl font-extrabold tracking-tighter text-white font-sans">
            ubuntu
          </div>
          <div className="text-xs font-mono text-neutral-300">
            24.04 LTS Noble Numbat · GNOME 46
          </div>
        </div>
      </div>
    </div>
  );
};
