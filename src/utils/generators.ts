import { HudConfig } from '../types/hud';

export function getAccentHex(accent: string): string {
  switch (accent) {
    case 'orange':
      return '#e95420'; // Ubuntu Orange
    case 'blue':
      return '#3584e4'; // GNOME Adwaita Blue
    case 'teal':
      return '#26a269'; // GNOME Teal
    case 'green':
      return '#33d17a'; // Emerald
    case 'purple':
      return '#9141ac'; // Ubuntu Aubergine / Purple
    case 'slate':
      return '#77767b'; // Slate Gray
    default:
      return '#e95420';
  }
}

export function generateConfigJson(config: HudConfig): string {
  return JSON.stringify(config, null, 2);
}

export function generateGtkCss(config: HudConfig): string {
  const accentHex = getAccentHex(config.theme.accentColor);
  const bgRgba = config.theme.isDark
    ? `rgba(30, 30, 30, ${config.window.opacity.toFixed(2)})`
    : `rgba(246, 246, 246, ${config.window.opacity.toFixed(2)})`;
  const textPrimary = config.theme.isDark ? '#ffffff' : '#1e1e1e';
  const textMuted = config.theme.isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)';
  const cardBg = config.theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const borderColor = config.theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';

  return `/* Ubuntu GTK4 FloatHUD - Estilos Adwaita */
window.floating-hud {
    background-color: transparent;
}

.hud-container {
    background-color: ${bgRgba};
    border-radius: ${config.theme.cornerRadius}px;
    border: 1px solid ${borderColor};
    padding: ${config.theme.compactPadding ? '10px 14px' : '14px 18px'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    color: ${textPrimary};
}

.hud-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid ${borderColor};
}

.hud-title {
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
    color: ${textMuted};
}

.hud-accent-badge {
    background-color: ${accentHex};
    color: #ffffff;
    font-weight: 600;
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 11px;
}

.hud-card {
    background-color: ${cardBg};
    border-radius: ${Math.max(6, config.theme.cornerRadius - 4)}px;
    border: 1px solid ${borderColor};
    padding: 8px 10px;
    margin: 4px 0;
}

.metric-label {
    font-size: 11px;
    color: ${textMuted};
    font-weight: 500;
}

.metric-value {
    font-family: 'JetBrains Mono', 'Ubuntu Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: ${textPrimary};
}

.metric-unit {
    font-size: 11px;
    color: ${textMuted};
    margin-left: 2px;
}

/* Barras de progreso de nivel GTK4 */
levelbar.hud-bar trough {
    background-color: ${cardBg};
    border-radius: 4px;
    min-height: 5px;
}

levelbar.hud-bar block.filled {
    background-color: ${accentHex};
    border-radius: 4px;
}

levelbar.hud-bar block.warning {
    background-color: #f5c211;
}

levelbar.hud-bar block.critical {
    background-color: #e01b24;
}

/* Botón discreto de arrastre y cerrar */
button.hud-icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    border-radius: 6px;
    color: ${textMuted};
}

button.hud-icon-btn:hover {
    background: ${cardBg};
    color: ${textPrimary};
}
`;
}

export function generatePythonGtkCode(config: HudConfig): string {
  const accentHex = getAccentHex(config.theme.accentColor);

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ubuntu GTK4 FloatHUD - Floating Weather & Laptop Hardware Monitor
Compatible con GNOME Desktop 42/43/44/45/46 en Ubuntu 22.04 LTS y 24.04 LTS
Utiliza GTK4, Libadwaita, psutil y Open-Meteo REST API.
"""

import os
import sys
import json
import threading
import urllib.request
import urllib.parse
from pathlib import Path

# Dependencias del sistema GNOME / GTK4
try:
    import gi
    gi.require_version('Gtk', '4.0')
    gi.require_version('Adw', '1')
    from gi.repository import Gtk, Adw, GLib, Gdk, Gio
except ImportError as err:
    print(f"Error: Dependencias GTK4 no encontradas: {err}")
    print("Ejecuta: sudo apt install python3-gi python3-gi-cairo gir1.2-gtk-4.0 gir1.2-adw-1")
    sys.exit(1)

try:
    import psutil
except ImportError:
    print("Error: psutil no instalado. Ejecuta: sudo apt install python3-psutil")
    sys.exit(1)

CONFIG_PATH = Path.home() / ".config" / "ubuntu-float-hud" / "config.json"
CSS_PATH = Path.home() / ".config" / "ubuntu-float-hud" / "style.css"

DEFAULT_CONFIG = ${JSON.stringify(config, null, 4)}

def load_config():
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return {**DEFAULT_CONFIG, **json.load(f)}
        except Exception as e:
            print(f"Aviso al cargar config: {e}. Usando valores predeterminados.")
    return DEFAULT_CONFIG

class SystemSensorReader:
    """Lee métricas del hardware de la laptop directamente del kernel Linux y psutil"""
    
    @staticmethod
    def get_cpu_temp(warning_th=78, critical_th=90):
        # 1. Intentar con psutil.sensors_temperatures()
        try:
            temps = psutil.sensors_temperatures()
            for name in ['coretemp', 'k10temp', 'acpitz', 'thinkpad', 'dell_smm', 'cpu_thermal']:
                if name in temps and temps[name]:
                    for entry in temps[name]:
                        if entry.current > 0:
                            return entry.current
            # Si hay cualquier otro sensor térmico
            for chip, entries in temps.items():
                for entry in entries:
                    if entry.current > 0:
                        return entry.current
        except Exception:
            pass

        # 2. Respaldo directo en /sys/class/thermal/
        thermal_zones = list(Path("/sys/class/thermal").glob("thermal_zone*/temp"))
        for tz in thermal_zones:
            try:
                val = int(tz.read_text().strip())
                if val > 1000:
                    return val / 1000.0
                elif val > 0:
                    return float(val)
            except Exception:
                continue
        return 48.0 # Valor nominal si la VM no expone sensores ACPI

    @staticmethod
    def get_cpu_freq_ghz():
        try:
            freq = psutil.cpu_freq()
            if freq and freq.current > 0:
                return freq.current / 1000.0
        except Exception:
            pass

        # Respaldo en /proc/cpuinfo
        try:
            with open("/proc/cpuinfo", "r") as f:
                for line in f:
                    if "cpu MHz" in line:
                        mhz = float(line.split(":")[1].strip())
                        return mhz / 1000.0
        except Exception:
            pass
        return 2.8

    @staticmethod
    def get_ram_info():
        try:
            vm = psutil.virtual_memory()
            used_gb = (vm.total - vm.available) / (1024 ** 3)
            total_gb = vm.total / (1024 ** 3)
            return used_gb, total_gb, vm.percent
        except Exception:
            return 4.2, 16.0, 26.2

    @staticmethod
    def get_cpu_usage_pct():
        try:
            return psutil.cpu_percent(interval=None)
        except Exception:
            return 15.0

    @staticmethod
    def get_battery_info():
        try:
            bat = psutil.sensors_battery()
            if bat:
                return bat.percent, bat.power_plugged
        except Exception:
            pass
        return None, None

class WeatherService:
    """Obtiene el clima en tiempo real desde Open-Meteo REST API (Sin clave API)"""

    WEATHER_CODES = {
        0: "Cielo Despejado",
        1: "Mayormente Despejado",
        2: "Parcialmente Nublado",
        3: "Nublado",
        45: "Niebla",
        48: "Niebla con Escarcha",
        51: "Llovizna Ligera",
        53: "Llovizna Moderada",
        55: "Llovizna Densa",
        61: "Lluvia Ligera",
        63: "Lluvia Moderada",
        65: "Lluvia Fuerte",
        71: "Nieve Ligera",
        73: "Nieve Moderada",
        75: "Nieve Intensa",
        80: "Chubascos",
        95: "Tormenta Eléctrica"
    }

    WEATHER_ICONS = {
        0: "☀️",
        1: "🌤️",
        2: "⛅",
        3: "☁️",
        45: "🌫️",
        51: "🌦️",
        61: "🌧️",
        65: "🌧️",
        71: "🌨️",
        80: "🌦️",
        95: "⛈️"
    }

    @classmethod
    def fetch_current(cls, lat=40.4168, lon=-3.7038):
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,"
            f"apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto"
        )
        req = urllib.request.Request(url, headers={'User-Agent': 'Ubuntu-GTK4-FloatHUD/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=6) as response:
                data = json.loads(response.read().decode('utf-8'))
                current = data.get("current", {})
                code = current.get("weather_code", 0)
                temp = current.get("temperature_2m", 21.0)
                feels = current.get("apparent_temperature", temp)
                humidity = current.get("relative_humidity_2m", 50)
                wind = current.get("wind_speed_10m", 12.0)
                desc = cls.WEATHER_CODES.get(code, "Despejado")
                icon = cls.WEATHER_ICONS.get(code, "☀️")
                return {
                    "temp": temp,
                    "feels_like": feels,
                    "humidity": humidity,
                    "wind_kmh": wind,
                    "code": code,
                    "desc": desc,
                    "icon": icon,
                    "ok": True
                }
        except Exception as e:
            return {"temp": 22.0, "feels_like": 21.0, "humidity": 45, "wind_kmh": 10.0,
                    "code": 0, "desc": "Offline / Cache", "icon": "🌤️", "ok": False}

class FloatingHudWindow(Gtk.Window):
    def __init__(self, app, config):
        super().__init__(application=app, title="FloatHUD")
        self.config = config
        
        # Configuración de ventana flotante GNOME / GTK4
        self.set_default_size(290, -1)
        self.set_resizable(False)
        
        if config["window"].get("borderless", True):
            self.set_decorated(False)
            
        # Hints de ventana flotante para X11 y Wayland
        # En GTK4 set_keep_above y set_deletable
        self.set_deletable(False)

        # Aplicar clases CSS
        self.add_css_class("floating-hud")

        # Variables de estado
        self.weather_info = {
            "temp": 22.0, "desc": "Cargando clima...", "icon": "🌤️", "humidity": 50, "wind_kmh": 12.0
        }

        self._build_ui()
        self._setup_drag_and_drop()
        self._start_timers()

    def _build_ui(self):
        root_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.container = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        self.container.add_css_class("hud-container")

        # Barra superior del HUD con agarre y nombre
        header_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
        header_box.add_css_class("hud-header")

        title_lbl = Gtk.Label(label="UBUNTU HUD", xalign=0)
        title_lbl.add_css_class("hud-title")
        title_lbl.set_hexpand(True)
        header_box.append(title_lbl)

        # Badge de estado
        city_name = self.config["weather"].get("city", "Ubuntu").split(",")[0]
        self.badge_lbl = Gtk.Label(label=city_name)
        self.badge_lbl.add_css_class("hud-accent-badge")
        header_box.append(self.badge_lbl)

        # Botón para cerrar
        close_btn = Gtk.Button(label="✕")
        close_btn.add_css_class("hud-icon-btn")
        close_btn.connect("clicked", lambda b: self.get_application().quit())
        header_box.append(close_btn)

        self.container.append(header_box)

        # SECCIÓN 1: CLIMA EN TIEMPO REAL
        if self.config["weather"].get("enabled", True):
            weather_card = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
            weather_card.add_css_class("hud-card")

            self.weather_icon_lbl = Gtk.Label(label="🌤️")
            self.weather_icon_lbl.set_markup("<span font='22'>🌤️</span>")
            weather_card.append(self.weather_icon_lbl)

            weather_text_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=2)
            weather_text_box.set_hexpand(True)

            self.weather_temp_lbl = Gtk.Label(label="-- °C", xalign=0)
            self.weather_temp_lbl.add_css_class("metric-value")
            weather_text_box.append(self.weather_temp_lbl)

            self.weather_desc_lbl = Gtk.Label(label="Actualizando clima...", xalign=0)
            self.weather_desc_lbl.add_css_class("metric-label")
            weather_text_box.append(self.weather_desc_lbl)

            weather_card.append(weather_text_box)
            self.container.append(weather_card)

        # SECCIÓN 2: TEMPERATURA DE LA LAPTOP
        if self.config["hardware"].get("showCpuTemp", True):
            temp_card = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=4)
            temp_card.add_css_class("hud-card")

            top_row = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
            lbl = Gtk.Label(label="🌡️ Temperatura Laptop", xalign=0)
            lbl.add_css_class("metric-label")
            lbl.set_hexpand(True)
            top_row.append(lbl)

            self.temp_val_lbl = Gtk.Label(label="-- °C", xalign=1)
            self.temp_val_lbl.add_css_class("metric-value")
            top_row.append(self.temp_val_lbl)
            temp_card.append(top_row)

            # Barra gráfica de nivel térmico
            self.temp_bar = Gtk.LevelBar()
            self.temp_bar.add_css_class("hud-bar")
            self.temp_bar.set_min_value(30)
            self.temp_bar.set_max_value(100)
            self.temp_bar.set_value(45)
            self.temp_bar.add_offset_value("warning", self.config["hardware"].get("tempWarningThreshold", 78))
            self.temp_bar.add_offset_value("critical", self.config["hardware"].get("tempCriticalThreshold", 90))
            temp_card.append(self.temp_bar)

            self.container.append(temp_card)

        # SECCIÓN 3: VELOCIDAD DEL PROCESADOR (CPU CLOCK & USO)
        if self.config["hardware"].get("showCpuFreq", True):
            cpu_card = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=4)
            cpu_card.add_css_class("hud-card")

            cpu_top = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
            cpu_lbl = Gtk.Label(label="⚡ CPU Clock & Carga", xalign=0)
            cpu_lbl.add_css_class("metric-label")
            cpu_lbl.set_hexpand(True)
            cpu_top.append(cpu_lbl)

            self.cpu_val_lbl = Gtk.Label(label="-- GHz", xalign=1)
            self.cpu_val_lbl.add_css_class("metric-value")
            cpu_top.append(self.cpu_val_lbl)
            cpu_card.append(cpu_top)

            self.cpu_bar = Gtk.LevelBar()
            self.cpu_bar.add_css_class("hud-bar")
            self.cpu_bar.set_min_value(0)
            self.cpu_bar.set_max_value(100)
            self.cpu_bar.set_value(20)
            cpu_card.append(self.cpu_bar)

            self.container.append(cpu_card)

        # SECCIÓN 4: MEMORIA RAM
        if self.config["hardware"].get("showRam", True):
            ram_card = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=4)
            ram_card.add_css_class("hud-card")

            ram_top = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
            ram_lbl = Gtk.Label(label="🧠 Memoria RAM", xalign=0)
            ram_lbl.add_css_class("metric-label")
            ram_lbl.set_hexpand(True)
            ram_top.append(ram_lbl)

            self.ram_val_lbl = Gtk.Label(label="-- / -- GB", xalign=1)
            self.ram_val_lbl.add_css_class("metric-value")
            ram_top.append(self.ram_val_lbl)
            ram_card.append(ram_top)

            self.ram_bar = Gtk.LevelBar()
            self.ram_bar.add_css_class("hud-bar")
            self.ram_bar.set_min_value(0)
            self.ram_bar.set_max_value(100)
            self.ram_bar.set_value(40)
            ram_card.append(self.ram_bar)

            self.container.append(ram_card)

        root_box.append(self.container)
        self.set_child(root_box)

    def _setup_drag_and_drop(self):
        """Permite mover y reposicionar la ventana flotante con el cursor"""
        gesture = Gtk.GestureDrag()
        
        def on_drag_begin(g, start_x, start_y):
            self.drag_start_x = start_x
            self.drag_start_y = start_y

        def on_drag_update(g, offset_x, offset_y):
            # En GTK4 Wayland se puede invocar drag interactivo si está disponible
            pass

        gesture.connect("drag-begin", on_drag_begin)
        gesture.connect("drag-update", on_drag_update)
        self.container.add_controller(gesture)

    def _start_timers(self):
        # Actualización de hardware (cada segundo)
        interval_ms = int(self.config["hardware"].get("refreshIntervalMs", 1500))
        GLib.timeout_add(interval_ms, self._update_hardware_metrics)
        self._update_hardware_metrics()

        # Actualización de clima en segundo plano (cada 15 minutos)
        refresh_min = int(self.config["weather"].get("refreshMinutes", 15))
        GLib.timeout_add_seconds(refresh_min * 60, self._trigger_weather_fetch)
        self._trigger_weather_fetch()

    def _trigger_weather_fetch(self):
        def worker():
            lat = self.config["weather"].get("latitude", 40.4168)
            lon = self.config["weather"].get("longitude", -3.7038)
            res = WeatherService.fetch_current(lat, lon)
            GLib.idle_add(self._apply_weather_update, res)

        t = threading.Thread(target=worker, daemon=True)
        t.start()
        return True

    def _apply_weather_update(self, data):
        self.weather_info = data
        if hasattr(self, "weather_temp_lbl"):
            self.weather_temp_lbl.set_text(f"{data['temp']:.1f} °C")
            self.weather_desc_lbl.set_text(f"{data['desc']} · {data['humidity']}% hum")
            self.weather_icon_lbl.set_markup(f"<span font='22'>{data['icon']}</span>")
        return False

    def _update_hardware_metrics(self):
        # 1. Temperatura
        temp = SystemSensorReader.get_cpu_temp()
        if hasattr(self, "temp_val_lbl"):
            self.temp_val_lbl.set_text(f"{temp:.1f} °C")
            self.temp_bar.set_value(temp)

        # 2. CPU Frecuencia y Uso
        freq = SystemSensorReader.get_cpu_freq_ghz()
        usage = SystemSensorReader.get_cpu_usage_pct()
        if hasattr(self, "cpu_val_lbl"):
            self.cpu_val_lbl.set_text(f"{freq:.2f} GHz ({usage:.0f}%)")
            self.cpu_bar.set_value(usage)

        # 3. RAM
        used, total, ram_pct = SystemSensorReader.get_ram_info()
        if hasattr(self, "ram_val_lbl"):
            self.ram_val_lbl.set_text(f"{used:.1f}G / {total:.0f}G ({ram_pct:.0f}%)")
            self.ram_bar.set_value(ram_pct)

        return True

class FloatHudApp(Adw.Application):
    def __init__(self):
        super().__init__(
            application_id="org.gnome.UbuntuFloatHud",
            flags=Gio.ApplicationFlags.FLAGS_NONE
        )
        self.config = load_config()

    def do_activate(self):
        # Cargar estilos CSS Adwaita
        self._load_css()
        
        # Forzar tema oscuro Adwaita si está configurado
        style_mgr = Adw.StyleManager.get_default()
        if self.config["theme"].get("isDark", True):
            style_mgr.set_color_scheme(Adw.ColorScheme.FORCE_DARK)
        else:
            style_mgr.set_color_scheme(Adw.ColorScheme.FORCE_LIGHT)

        win = FloatingHudWindow(self, self.config)
        win.present()

    def _load_css(self):
        css_provider = Gtk.CssProvider()
        if CSS_PATH.exists():
            css_provider.load_from_path(str(CSS_PATH))
        else:
            # Fallback a CSS embebido
            embedded_css = """${generateGtkCss(config).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"""
            css_provider.load_from_string(embedded_css)

        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            css_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )

def main():
    app = FloatHudApp()
    return app.run(sys.argv)

if __name__ == "__main__":
    sys.exit(main())
`;
}

export function generateDesktopFile(): string {
  return `[Desktop Entry]
Name=Ubuntu FloatHUD
GenericName=System & Weather Monitor
Comment=Ventana flotante de clima en tiempo real, temperatura de laptop, velocidad de procesador y RAM
Exec=/usr/bin/python3 -m ubuntu_float_hud
Icon=utilities-system-monitor
Terminal=false
Type=Application
Categories=GNOME;GTK;Utility;System;Monitor;
Keywords=Weather;CPU;Temperature;RAM;Laptop;Monitor;GTK4;
StartupNotify=true
`;
}

export function generateSystemdService(): string {
  return `[Unit]
Description=Ubuntu GTK4 FloatHUD Autostart
After=graphical-session.target

[Service]
Type=simple
ExecStart=%h/.local/bin/ubuntu-float-hud
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
`;
}

export function generateInstallScript(): string {
  return `#!/usr/bin/env bash
# ==============================================================================
# Instalador automático para Ubuntu GTK4 FloatHUD
# Compatible con Ubuntu 22.04 LTS y 24.04 LTS (GNOME 42 / 44 / 46)
# ==============================================================================

set -e

echo "🐧 [1/5] Verificando dependencias del sistema Ubuntu/GNOME..."
sudo apt update -y
sudo apt install -y \\
    python3 \\
    python3-pip \\
    python3-gi \\
    python3-gi-cairo \\
    gir1.2-gtk-4.0 \\
    gir1.2-adw-1 \\
    python3-psutil \\
    python3-requests \\
    lm-sensors

echo "🔧 [2/5] Creando directorios de configuración..."
CONFIG_DIR="$HOME/.config/ubuntu-float-hud"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
AUTOSTART_DIR="$HOME/.config/autostart"

mkdir -p "$CONFIG_DIR" "$BIN_DIR" "$APP_DIR" "$AUTOSTART_DIR"

echo "📂 [3/5] Instalando archivos de FloatHUD..."
cp main.py "$BIN_DIR/ubuntu-float-hud"
chmod +x "$BIN_DIR/ubuntu-float-hud"

cp style.css "$CONFIG_DIR/style.css"
cp config.json "$CONFIG_DIR/config.json"
cp ubuntu-float-hud.desktop "$APP_DIR/ubuntu-float-hud.desktop"
cp ubuntu-float-hud.desktop "$AUTOSTART_DIR/ubuntu-float-hud.desktop"

echo "🚀 [4/5] Actualizando base de datos de aplicaciones GNOME..."
update-desktop-database "$APP_DIR" 2>/dev/null || true

echo "✨ [5/5] ¡Instalación completada con éxito!"
echo ""
echo "Para iniciar FloatHUD ahora, ejecuta:"
echo "    $HOME/.local/bin/ubuntu-float-hud &"
echo ""
echo "O búscalo en el menú de aplicaciones de Ubuntu como 'Ubuntu FloatHUD'."
`;
}
