import React, { useRef, useState, useEffect } from 'react';
import { HudConfig, WeatherData, HardwareData } from '../types/hud';
import { getAccentHex } from '../utils/generators';
import {
  CloudSun,
  Cpu,
  Thermometer,
  HardDrive,
  GripVertical,
  X,
  Maximize2,
  Minimize2,
  Wind,
  Droplets,
  Activity,
  Zap,
} from 'lucide-react';

interface FloatingHudWidgetProps {
  config: HudConfig;
  weather: WeatherData;
  hardware: HardwareData;
  containerBounds: { width: number; height: number };
  onConfigChange?: (newConfig: HudConfig) => void;
  onOpenSettings?: () => void;
}

export const FloatingHudWidget: React.FC<FloatingHudWidgetProps> = ({
  config,
  weather,
  hardware,
  containerBounds,
  onOpenSettings,
}) => {
  const accentHex = getAccentHex(config.theme.accentColor);
  const [isMinimized, setIsMinimized] = useState(false);

  // Position state (pixels relative to container)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Calculate default position based on config.window.position
  useEffect(() => {
    if (config.window.position === 'top-right') {
      const targetX = Math.max(20, containerBounds.width - 340);
      setPosition({ x: targetX, y: 44 });
    } else if (config.window.position === 'top-left') {
      setPosition({ x: 74, y: 44 });
    } else if (config.window.position === 'bottom-right') {
      const targetX = Math.max(20, containerBounds.width - 340);
      const targetY = Math.max(44, containerBounds.height - 380);
      setPosition({ x: targetX, y: targetY });
    } else if (config.window.position === 'bottom-left') {
      const targetY = Math.max(44, containerBounds.height - 380);
      setPosition({ x: 74, y: targetY });
    }
  }, [config.window.position, containerBounds.width, containerBounds.height]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const maxX = Math.max(0, containerBounds.width - 320);
    const maxY = Math.max(0, containerBounds.height - 180);

    setPosition({
      x: Math.min(maxX, Math.max(10, dragRef.current.initX + dx)),
      y: Math.min(maxY, Math.max(36, dragRef.current.initY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }
  };

  // Temperature status color
  const getTempColor = (temp: number) => {
    if (temp >= config.hardware.tempCriticalThreshold) return '#e01b24'; // Red
    if (temp >= config.hardware.tempWarningThreshold) return '#f5c211'; // Amber
    return accentHex;
  };

  const tempColor = getTempColor(hardware.cpuTempC);

  const isDark = config.theme.isDark;
  const opacity = config.window.opacity;

  return (
    <aside
      aria-label="Ventana flotante de métricas GNOME"
      role="complementary"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: isMinimized ? '260px' : '310px',
        backgroundColor: isDark
          ? `rgba(30, 30, 30, ${opacity})`
          : `rgba(246, 246, 246, ${opacity})`,
        backdropFilter: config.window.blurBackground ? 'blur(16px)' : 'none',
        borderRadius: `${config.theme.cornerRadius}px`,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)',
        boxShadow: config.theme.showGlow
          ? '0 12px 36px -4px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.06)'
          : '0 8px 24px rgba(0, 0, 0, 0.35)',
      }}
      className={`absolute left-0 top-0 select-none border transition-[width] duration-200 z-30 ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Ventana Header / Drag Grip */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex items-center justify-between px-3.5 py-2.5 border-b cursor-grab ${
          isDark ? 'border-white/10 text-neutral-300' : 'border-black/10 text-neutral-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
          <span className="text-xs font-bold tracking-wider uppercase font-mono">FloatHUD</span>
          <span
            style={{ backgroundColor: accentHex }}
            className="text-[10px] text-white font-semibold px-2 py-0.5 rounded-full"
          >
            {config.weather.city.split(',')[0]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
            aria-label={isMinimized ? 'Expandir HUD' : 'Minimizar HUD'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1 rounded hover:bg-white/10 transition-colors text-xs"
            title="Ajustes de personalización"
            aria-label="Abrir configuración"
          >
            ⚙️
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Ocultar"
            aria-label="Ocultar widget"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Cuerpo del HUD */}
      {!isMinimized ? (
        <div
          className={`p-3.5 space-y-3 ${
            isDark ? 'text-neutral-100' : 'text-neutral-900'
          }`}
        >
          {/* Métrica 1: Clima en Tiempo Real */}
          {config.weather.enabled && (
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/5' : 'bg-black/[0.03] border-black/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" role="img" aria-label="weather-icon">
                    {weather.weatherCode === 0
                      ? '☀️'
                      : weather.weatherCode <= 3
                      ? '🌤️'
                      : weather.weatherCode >= 60
                      ? '🌧️'
                      : '⛅'}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold font-mono tracking-tight tabular-nums">
                        {weather.temperature}
                      </span>
                      <span className="text-xs font-semibold opacity-70">
                        °{config.weather.unit === 'fahrenheit' ? 'F' : 'C'}
                      </span>
                      <span className="text-[11px] opacity-60 ml-1">
                        (Sens. {weather.feelsLike}°)
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75 font-medium leading-tight">
                      {weather.weatherDescription}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] opacity-65 font-mono space-y-0.5">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets className="w-3 h-3 opacity-70" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Wind className="w-3 h-3 opacity-70" />
                    <span>{weather.windSpeedKmH} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Métrica 2: Temperatura de Laptop */}
          {config.hardware.showCpuTemp && (
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/5' : 'bg-black/[0.03] border-black/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" style={{ color: tempColor }} />
                  <span className="font-medium opacity-85">Temp Laptop</span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="font-bold text-sm tabular-nums" style={{ color: tempColor }}>
                    {hardware.cpuTempC.toFixed(1)}
                  </span>
                  <span className="text-[11px] opacity-70">°C</span>
                  {hardware.fanRpm > 0 && (
                    <span className="text-[10px] opacity-60 ml-1.5">
                      {hardware.fanRpm} RPM
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de progreso de nivel térmico */}
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(10, ((hardware.cpuTempC - 30) / 70) * 100))}%`,
                    backgroundColor: tempColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Métrica 3: Velocidad del Procesador (CPU Clock & Load) */}
          {config.hardware.showCpuFreq && (
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/5' : 'bg-black/[0.03] border-black/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" style={{ color: accentHex }} />
                  <span className="font-medium opacity-85">Frecuencia CPU</span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="font-bold text-sm tabular-nums text-emerald-400">
                    {hardware.cpuFreqGhz.toFixed(2)}
                  </span>
                  <span className="text-[11px] opacity-70">GHz</span>
                  <span className="text-[10px] opacity-60 ml-1.5">
                    ({hardware.cpuUsagePct}%)
                  </span>
                </div>
              </div>

              {/* Barra de frecuencia/carga */}
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${hardware.cpuUsagePct}%`,
                    backgroundColor: accentHex,
                  }}
                />
              </div>
            </div>
          )}

          {/* Métrica 4: Uso de Memoria RAM */}
          {config.hardware.showRam && (
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/5' : 'bg-black/[0.03] border-black/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-medium opacity-85">Memoria RAM</span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="font-bold text-sm tabular-nums">
                    {hardware.ramUsedGb.toFixed(1)}
                  </span>
                  <span className="text-[11px] opacity-70">/ {hardware.ramTotalGb.toFixed(0)} GB</span>
                  <span className="text-[10px] opacity-60 ml-1.5">
                    ({hardware.ramUsagePct}%)
                  </span>
                </div>
              </div>

              {/* Barra de uso de RAM */}
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${hardware.ramUsagePct}%`,
                    backgroundColor: hardware.ramUsagePct > 85 ? '#e01b24' : accentHex,
                  }}
                />
              </div>
            </div>
          )}

          {/* Micro Footer con estado de batería y sincronización */}
          <div className="flex items-center justify-between pt-1 text-[10px] opacity-60 font-mono">
            <span>{hardware.isCharging ? '⚡ Conectado' : '🔋 Batería'} {hardware.batteryPct}%</span>
            <span>Act. {weather.lastUpdated}</span>
          </div>
        </div>
      ) : (
        /* Vista compacta minimizada de 1 línea */
        <div className="px-3 py-2 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1">
            <span>🌤️</span>
            <span>{weather.temperature}°</span>
          </span>
          <span className="opacity-40">|</span>
          <span style={{ color: tempColor }}>{hardware.cpuTempC.toFixed(0)}°C</span>
          <span className="opacity-40">|</span>
          <span className="text-emerald-400">{hardware.cpuFreqGhz.toFixed(1)}G</span>
          <span className="opacity-40">|</span>
          <span>RAM {hardware.ramUsagePct}%</span>
        </div>
      )}
    </aside>
  );
};
