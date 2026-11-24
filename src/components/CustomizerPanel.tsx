import React from 'react';
import { HudConfig, AccentColor, WindowPosition } from '../types/hud';
import { POPULAR_CITIES } from '../utils/weather';
import {
  Sliders,
  Palette,
  CloudSun,
  Cpu,
  Monitor,
  RotateCcw,
  Check,
  Zap,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';

interface CustomizerPanelProps {
  config: HudConfig;
  onChange: (updated: HudConfig) => void;
  onReset: () => void;
  onRefreshWeather: () => void;
  isRefreshingWeather?: boolean;
  onClose?: () => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  config,
  onChange,
  onReset,
  onRefreshWeather,
  isRefreshingWeather = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'window' | 'theme' | 'weather' | 'hardware'>('window');

  const updateWindow = (patch: Partial<HudConfig['window']>) => {
    onChange({ ...config, window: { ...config.window, ...patch } });
  };

  const updateTheme = (patch: Partial<HudConfig['theme']>) => {
    onChange({ ...config, theme: { ...config.theme, ...patch } });
  };

  const updateWeather = (patch: Partial<HudConfig['weather']>) => {
    onChange({ ...config, weather: { ...config.weather, ...patch } });
  };

  const updateHardware = (patch: Partial<HudConfig['hardware']>) => {
    onChange({ ...config, hardware: { ...config.hardware, ...patch } });
  };

  const accentOptions: { id: AccentColor; name: string; hex: string }[] = [
    { id: 'orange', name: 'Ubuntu Naranja', hex: '#e95420' },
    { id: 'blue', name: 'GNOME Azul', hex: '#3584e4' },
    { id: 'teal', name: 'Verde Azulado', hex: '#26a269' },
    { id: 'green', name: 'Esmeralda', hex: '#33d17a' },
    { id: 'purple', name: 'Berenjena Ubuntu', hex: '#9141ac' },
    { id: 'slate', name: 'Pizarra', hex: '#77767b' },
  ];

  const positionOptions: { id: WindowPosition; label: string }[] = [
    { id: 'top-right', label: 'Superior Derecha' },
    { id: 'top-left', label: 'Superior Izquierda' },
    { id: 'bottom-right', label: 'Inferior Derecha' },
    { id: 'bottom-left', label: 'Inferior Izquierda' },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-white/10 text-neutral-200">
      {/* Header del panel */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#e95420]" />
            Personalización GTK4 & GNOME
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configura el comportamiento visual y los sensores en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
            title="Restablecer valores predeterminados"
          >
            <RotateCcw className="w-3 h-3" />
            Reiniciar
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
              title="Cerrar panel"
              aria-label="Cerrar panel de personalización"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs de navegación de ajustes */}
      <div className="flex border-b border-white/10 bg-neutral-950/60 p-1 gap-1">
        <button
          onClick={() => setActiveTab('window')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            activeTab === 'window'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Ventana
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            activeTab === 'theme'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Estilo GNOME
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            activeTab === 'weather'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Clima
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
            activeTab === 'hardware'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Sensores
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* TAB 1: VENTANA */}
        {activeTab === 'window' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">
                Posición en Pantalla
              </label>
              <div className="grid grid-cols-2 gap-2">
                {positionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateWindow({ position: opt.id })}
                    className={`py-2 px-3 rounded-lg border text-left transition-all ${
                      config.window.position === opt.id
                        ? 'border-[#e95420] bg-[#e95420]/15 text-white font-medium'
                        : 'border-white/10 bg-neutral-800/60 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                También puedes arrastrar libremente la ventana con el puntero en cualquier momento.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-neutral-300">
                  Opacidad del Fondo
                </label>
                <span className="font-mono text-neutral-300">
                  {Math.round(config.window.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.02"
                value={config.window.opacity}
                onChange={(e) => updateWindow({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#e95420] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>Translúcido (50%)</span>
                <span>Opaco (100%)</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">Efecto Blur de Fondo</span>
                  <p className="text-[11px] text-neutral-400">Desenfoque translúcido tipo Adwaita</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.window.blurBackground}
                  onChange={(e) => updateWindow({ blurBackground: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">Sin bordes (Borderless HUD)</span>
                  <p className="text-[11px] text-neutral-400">Oculta la barra de título estándar de GNOME</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.window.borderless}
                  onChange={(e) => updateWindow({ borderless: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">Fijar en todos los escritorios</span>
                  <p className="text-[11px] text-neutral-400">Visible en todos los workspaces (Stick)</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.window.stickAllWorkspaces}
                  onChange={(e) => updateWindow({ stickAllWorkspaces: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">Siempre al frente (Keep Above)</span>
                  <p className="text-[11px] text-neutral-400">Permanece sobre otras ventanas abiertas</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.window.alwaysOnTop}
                  onChange={(e) => updateWindow({ alwaysOnTop: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: TEMA GNOME */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">
                Modo de Color Adwaita
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateTheme({ isDark: true })}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                    config.theme.isDark
                      ? 'border-[#e95420] bg-neutral-800 text-white'
                      : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  🌙 Tema Oscuro
                </button>
                <button
                  onClick={() => updateTheme({ isDark: false })}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                    !config.theme.isDark
                      ? 'border-[#e95420] bg-neutral-200 text-neutral-900'
                      : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  ☀️ Tema Claro
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="block font-semibold text-neutral-300 mb-2">
                Color de Acento GNOME
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accentOptions.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => updateTheme({ accentColor: acc.id })}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      config.theme.accentColor === acc.id
                        ? 'border-white/40 bg-neutral-800'
                        : 'border-white/10 bg-neutral-850 hover:bg-neutral-800'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: acc.hex }}
                    />
                    <span className="text-[11px] font-medium text-neutral-200 truncate">
                      {acc.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-neutral-300">
                  Radio de Esquinas Adwaita
                </label>
                <span className="font-mono text-neutral-300">
                  {config.theme.cornerRadius}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[12, 16, 20, 24].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => updateTheme({ cornerRadius: radius })}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-md border transition-all ${
                      config.theme.cornerRadius === radius
                        ? 'border-[#e95420] bg-[#e95420]/20 text-white font-bold'
                        : 'border-white/10 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {radius}px
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">Sombra suave (Glow / Elevation)</span>
                  <p className="text-[11px] text-neutral-400">Sombra de profundidad nativa de GNOME</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.theme.showGlow}
                  onChange={(e) => updateTheme({ showGlow: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: CLIMA EN TIEMPO REAL */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
              <div>
                <span className="font-medium text-neutral-200">Habilitar Widget de Clima</span>
                <p className="text-[11px] text-neutral-400">Muestra temperatura, humedad y viento</p>
              </div>
              <input
                type="checkbox"
                checked={config.weather.enabled}
                onChange={(e) => updateWeather({ enabled: e.target.checked })}
                className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
              />
            </label>

            {config.weather.enabled && (
              <>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">
                    Ciudades Populares
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          updateWeather({
                            city: `${city.name}, ${city.country}`,
                            latitude: city.lat,
                            longitude: city.lon,
                          });
                        }}
                        className={`py-1.5 px-2 rounded-md border text-left text-[11px] transition-colors truncate ${
                          config.weather.city.startsWith(city.name)
                            ? 'border-[#e95420] bg-[#e95420]/15 text-white font-medium'
                            : 'border-white/5 bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Nombre de la Ciudad
                    </label>
                    <input
                      type="text"
                      value={config.weather.city}
                      onChange={(e) => updateWeather({ city: e.target.value })}
                      placeholder="Ej. Madrid, ES"
                      className="w-full bg-neutral-950 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e95420]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Latitud</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={config.weather.latitude}
                        onChange={(e) => updateWeather({ latitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#e95420]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Longitud</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={config.weather.longitude}
                        onChange={(e) => updateWeather({ longitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#e95420]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] text-neutral-400 mb-1">Unidad Térmica</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateWeather({ unit: 'celsius' })}
                        className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                          config.weather.unit === 'celsius'
                            ? 'border-[#e95420] bg-[#e95420]/20 text-white font-bold'
                            : 'border-white/10 bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        °C Celsius
                      </button>
                      <button
                        onClick={() => updateWeather({ unit: 'fahrenheit' })}
                        className={`py-1.5 px-3 rounded-md border text-center transition-colors ${
                          config.weather.unit === 'fahrenheit'
                            ? 'border-[#e95420] bg-[#e95420]/20 text-white font-bold'
                            : 'border-white/10 bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        °F Fahrenheit
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={onRefreshWeather}
                    disabled={isRefreshingWeather}
                    className="w-full mt-2 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CloudSun className={`w-3.5 h-3.5 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
                    {isRefreshingWeather ? 'Actualizando clima...' : 'Actualizar Clima en Vivo'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: SENSORES DE HARDWARE */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">🌡️ Temperatura de Laptop</span>
                  <p className="text-[11px] text-neutral-400">Lectura de coretemp y thermal_zone</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.hardware.showCpuTemp}
                  onChange={(e) => updateHardware({ showCpuTemp: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">⚡ Velocidad Procesador (GHz)</span>
                  <p className="text-[11px] text-neutral-400">Frecuencia en tiempo real y carga %</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.hardware.showCpuFreq}
                  onChange={(e) => updateHardware({ showCpuFreq: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-200">🧠 Uso de Memoria RAM</span>
                  <p className="text-[11px] text-neutral-400">Total, memoria usada en GB y porcentaje</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.hardware.showRam}
                  onChange={(e) => updateHardware({ showRam: e.target.checked })}
                  className="rounded text-[#e95420] focus:ring-0 w-4 h-4 accent-[#e95420]"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="block font-semibold text-neutral-300">
                Umbrales de Advertencia Térmica
              </label>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-400">Alerta (Ámbar)</span>
                  <span className="font-mono">{config.hardware.tempWarningThreshold} °C</span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="85"
                  value={config.hardware.tempWarningThreshold}
                  onChange={(e) => updateHardware({ tempWarningThreshold: parseInt(e.target.value) })}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">Crítico (Rojo)</span>
                  <span className="font-mono">{config.hardware.tempCriticalThreshold} °C</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  value={config.hardware.tempCriticalThreshold}
                  onChange={(e) => updateHardware({ tempCriticalThreshold: parseInt(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Ruta del Sensor Térmico Linux
              </label>
              <input
                type="text"
                value={config.hardware.thermalSensorPath}
                onChange={(e) => updateHardware({ thermalSensorPath: e.target.value })}
                placeholder="auto o /sys/class/thermal/thermal_zone0/temp"
                className="w-full bg-neutral-950 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#e95420]"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                "auto" detecta automáticamente coretemp (Intel), k10temp (AMD Ryzen) y acpitz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
