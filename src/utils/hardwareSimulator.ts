import { HardwareData } from '../types/hud';

export type ThermalProfile = 'eco' | 'balanced' | 'performance' | 'stress';

export class HardwareSimulator {
  private currentTemp: number = 49.5;
  private currentFreq: number = 2.45;
  private targetLoad: number = 22;
  private currentRamUsed: number = 6.4;
  private totalRam: number = 16.0;
  private fanRpm: number = 1850;
  private batteryPct: number = 86;
  private isCharging: boolean = true;
  private profile: ThermalProfile = 'balanced';

  constructor() {
    this.setProfile('balanced');
  }

  setProfile(p: ThermalProfile) {
    this.profile = p;
    switch (p) {
      case 'eco':
        this.targetLoad = 12;
        break;
      case 'balanced':
        this.targetLoad = 26;
        break;
      case 'performance':
        this.targetLoad = 62;
        break;
      case 'stress':
        this.targetLoad = 96;
        break;
    }
  }

  getProfile(): ThermalProfile {
    return this.profile;
  }

  tick(): HardwareData {
    // Jitter load around target
    const jitter = (Math.random() - 0.5) * 8;
    const load = Math.min(100, Math.max(4, this.targetLoad + jitter));

    // Calculate target temperature based on load and profile
    let baseTemp = 42;
    if (this.profile === 'eco') baseTemp = 40;
    if (this.profile === 'performance') baseTemp = 58;
    if (this.profile === 'stress') baseTemp = 78;

    const targetTemp = baseTemp + (load / 100) * 36;
    // Thermal inertia: approach target smoothly
    this.currentTemp += (targetTemp - this.currentTemp) * 0.12;

    // CPU Clock Speed: base 1.4 GHz, boost up to 4.8 GHz depending on load and thermal headroom
    let maxBoost = 4.8;
    if (this.currentTemp > 88) {
      // Thermal throttling
      maxBoost = 2.6;
    } else if (this.currentTemp > 80) {
      maxBoost = 3.6;
    }
    const targetFreq = 1.6 + (load / 100) * (maxBoost - 1.6) + (Math.random() - 0.5) * 0.15;
    this.currentFreq += (targetFreq - this.currentFreq) * 0.25;

    // RAM usage fluctuations
    let ramBase = 5.8;
    if (this.profile === 'performance') ramBase = 8.5;
    if (this.profile === 'stress') ramBase = 12.8;
    this.currentRamUsed += (ramBase + (Math.random() - 0.5) * 0.4 - this.currentRamUsed) * 0.05;

    // Fan curve
    if (this.currentTemp < 45) {
      this.fanRpm = 0; // passive cooling
    } else if (this.currentTemp < 65) {
      this.fanRpm = 1800 + Math.round((this.currentTemp - 45) * 45);
    } else if (this.currentTemp < 80) {
      this.fanRpm = 2700 + Math.round((this.currentTemp - 65) * 90);
    } else {
      this.fanRpm = 4100 + Math.round((this.currentTemp - 80) * 120);
    }

    return {
      cpuFreqGhz: Math.round(this.currentFreq * 100) / 100,
      cpuMaxFreqGhz: 4.8,
      cpuUsagePct: Math.round(load),
      cpuTempC: Math.round(this.currentTemp * 10) / 10,
      ramUsedGb: Math.round(this.currentRamUsed * 10) / 10,
      ramTotalGb: this.totalRam,
      ramUsagePct: Math.round((this.currentRamUsed / this.totalRam) * 100),
      swapUsedGb: 0.8,
      swapTotalGb: 4.0,
      batteryPct: this.batteryPct,
      isCharging: this.isCharging,
      fanRpm: this.fanRpm,
    };
  }
}
