import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAccentHex,
  generateConfigJson,
  generateGtkCss,
  generatePythonGtkCode,
  generateInstallScript,
  generateDesktopFile,
  generateSystemdService,
} from './generators';
import { DEFAULT_CONFIG } from '../types/hud';

test('getAccentHex returns correct hex for GNOME and Ubuntu palettes', () => {
  assert.equal(getAccentHex('orange'), '#e95420'); // Ubuntu signature orange
  assert.equal(getAccentHex('blue'), '#3584e4'); // Adwaita blue
  assert.equal(getAccentHex('teal'), '#26a269');
});

test('generateConfigJson returns valid parseable JSON string', () => {
  const json = generateConfigJson(DEFAULT_CONFIG);
  const parsed = JSON.parse(json);
  assert.equal(parsed.window.position, 'top-right');
  assert.equal(parsed.theme.isDark, true);
  assert.equal(parsed.weather.city, 'Madrid, ES');
});

test('generateGtkCss outputs GTK4 Adwaita styles with proper radius and opacity', () => {
  const css = generateGtkCss(DEFAULT_CONFIG);
  assert.match(css, /window\.floating-hud/);
  assert.match(css, /\.hud-container/);
  assert.match(css, /border-radius:\s*16px/);
  assert.match(css, /rgba\(30,\s*30,\s*30,\s*0\.94\)/);
  assert.match(css, /levelbar\.hud-bar/);
});

test('generatePythonGtkCode contains GTK4, Libadwaita, and Linux laptop sensors', () => {
  const code = generatePythonGtkCode(DEFAULT_CONFIG);
  assert.match(code, /gi\.require_version\('Gtk', '4\.0'\)/);
  assert.match(code, /gi\.require_version\('Adw', '1'\)/);
  assert.match(code, /class SystemSensorReader:/);
  assert.match(code, /psutil\.sensors_temperatures\(\)/);
  assert.match(code, /class WeatherService:/);
  assert.match(code, /class FloatingHudWindow\(Gtk\.Window\):/);
  assert.match(code, /self\.set_decorated\(False\)/);
});

test('generateInstallScript has Ubuntu apt package commands', () => {
  const script = generateInstallScript();
  assert.match(script, /gir1\.2-gtk-4\.0/);
  assert.match(script, /gir1\.2-adw-1/);
  assert.match(script, /python3-psutil/);
  assert.match(script, /update-desktop-database/);
});

test('generateDesktopFile contains standard GNOME XDG entries', () => {
  const desktop = generateDesktopFile();
  assert.match(desktop, /\[Desktop Entry\]/);
  assert.match(desktop, /Categories=GNOME;GTK;Utility;System;Monitor;/);
});

test('generateSystemdService has proper restart and graphical target', () => {
  const systemd = generateSystemdService();
  assert.match(systemd, /After=graphical-session\.target/);
  assert.match(systemd, /WantedBy=graphical-session\.target/);
});
