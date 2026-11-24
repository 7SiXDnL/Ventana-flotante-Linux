export type WindowPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'custom';

export type CompactMode = 'minimal' | 'standard' | 'expanded';

export type AccentColor = 'orange' | 'blue' | 'teal' | 'green' | 'purple' | 'slate';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  weatherDescription: string;
  humidity: number;
  windSpeedKmH: number;
  precipitationMm: number;
  isDay: boolean;
  lastUpdated: string;
}

export interface HardwareData {
  cpuFreqGhz: number;
  cpuMaxFreqGhz: number;
  cpuUsagePct: number;
  cpuTempC: number;
  ramUsedGb: number;
  ramTotalGb: number;
  ramUsagePct: number;
  swapUsedGb: number;
  swapTotalGb: number;
  batteryPct: number;
  isCharging: boolean;
  fanRpm: number;
}

export interface HudConfig {
  window: {
    position: WindowPosition;
    customX: number;
    customY: number;
    alwaysOnTop: boolean;
    stickAllWorkspaces: boolean;
    borderless: boolean;
    opacity: number; // 0.5 - 1.0
    blurBackground: boolean;
    clickThrough: boolean;
    compactMode: CompactMode;
    scale: number;
  };
  theme: {
    isDark: boolean;
    accentColor: AccentColor;
    cornerRadius: number;
    showGlow: boolean;
    compactPadding: boolean;
  };
  weather: {
    enabled: boolean;
    city: string;
    latitude: number;
    longitude: number;
    unit: 'celsius' | 'fahrenheit';
    refreshMinutes: number;
  };
  hardware: {
    showCpuFreq: boolean;
    showCpuTemp: boolean;
    showRam: boolean;
    showSwap: boolean;
    showFan: boolean;
    showBattery: boolean;
    tempWarningThreshold: number; // e.g. 78
    tempCriticalThreshold: number; // e.g. 90
    refreshIntervalMs: number; // e.g. 1000
    thermalSensorPath: string; // e.g. "auto" or "/sys/class/thermal/thermal_zone0/temp"
  };
}

export const DEFAULT_CONFIG: HudConfig = {
  window: {
    position: 'top-right',
    customX: 40,
    customY: 48,
    alwaysOnTop: true,
    stickAllWorkspaces: true,
    borderless: true,
    opacity: 0.94,
    blurBackground: true,
    clickThrough: false,
    compactMode: 'standard',
    scale: 1.0,
  },
  theme: {
    isDark: true,
    accentColor: 'orange', // Ubuntu classic orange
    cornerRadius: 16,
    showGlow: true,
    compactPadding: false,
  },
  weather: {
    enabled: true,
    city: 'Madrid, ES',
    latitude: 40.4168,
    longitude: -3.7038,
    unit: 'celsius',
    refreshMinutes: 15,
  },
  hardware: {
    showCpuFreq: true,
    showCpuTemp: true,
    showRam: true,
    showSwap: true,
    showFan: true,
    showBattery: true,
    tempWarningThreshold: 78,
    tempCriticalThreshold: 90,
    refreshIntervalMs: 1500,
    thermalSensorPath: 'auto',
  },
};
