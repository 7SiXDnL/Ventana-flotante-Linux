import { WeatherData } from '../types/hud';

export interface CityPreset {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const POPULAR_CITIES: CityPreset[] = [
  { name: 'Madrid', country: 'España', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', country: 'España', lat: 41.3879, lon: 2.1699 },
  { name: 'Ciudad de México', country: 'México', lat: 19.4326, lon: -99.1332 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },
  { name: 'Lima', country: 'Perú', lat: -12.0464, lon: -77.0428 },
  { name: 'Valencia', country: 'España', lat: 39.4699, lon: -0.3763 },
  { name: 'Sevilla', country: 'España', lat: 37.3891, lon: -5.9845 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645 },
];

const WMO_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Cielo Despejado', icon: '☀️' },
  1: { desc: 'Mayormente Despejado', icon: '🌤️' },
  2: { desc: 'Parcialmente Nublado', icon: '⛅' },
  3: { desc: 'Nublado', icon: '☁️' },
  45: { desc: 'Niebla', icon: '🌫️' },
  48: { desc: 'Niebla con Escarcha', icon: '🌫️' },
  51: { desc: 'Llovizna Ligera', icon: '🌦️' },
  53: { desc: 'Llovizna Moderada', icon: '🌦️' },
  55: { desc: 'Llovizna Densa', icon: '🌧️' },
  61: { desc: 'Lluvia Ligera', icon: '🌧️' },
  63: { desc: 'Lluvia Moderada', icon: '🌧️' },
  65: { desc: 'Lluvia Fuerte', icon: '🌧️' },
  71: { desc: 'Nieve Ligera', icon: '🌨️' },
  73: { desc: 'Nieve Moderada', icon: '🌨️' },
  75: { desc: 'Nieve Intensa', icon: '🌨️' },
  80: { desc: 'Chubascos Ligeros', icon: '🌦️' },
  81: { desc: 'Chubascos Moderados', icon: '🌧️' },
  82: { desc: 'Chubascos Violentos', icon: '⛈️' },
  95: { desc: 'Tormenta Eléctrica', icon: '⛈️' },
};

export async function fetchLiveWeather(
  cityName: string,
  lat: number,
  lon: number,
  unit: 'celsius' | 'fahrenheit' = 'celsius'
): Promise<WeatherData> {
  try {
    const tempUnit = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m${tempUnit}&timezone=auto`;

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const current = data.current || {};
    const code = Number(current.weather_code) || 0;
    const info = WMO_CODES[code] || { desc: 'Despejado', icon: '☀️' };

    return {
      city: cityName,
      country: '',
      temperature: Math.round((current.temperature_2m ?? 21) * 10) / 10,
      feelsLike: Math.round((current.apparent_temperature ?? 20) * 10) / 10,
      weatherCode: code,
      weatherDescription: info.desc,
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      windSpeedKmH: Math.round((current.wind_speed_10m ?? 12) * 10) / 10,
      precipitationMm: current.precipitation ?? 0,
      isDay: current.is_day === 1,
      lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Fallback weather used due to API error:', err);
    return {
      city: cityName,
      country: '',
      temperature: unit === 'fahrenheit' ? 70 : 21,
      feelsLike: unit === 'fahrenheit' ? 68 : 20,
      weatherCode: 1,
      weatherDescription: 'Mayormente Despejado',
      humidity: 52,
      windSpeedKmH: 14,
      precipitationMm: 0,
      isDay: true,
      lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
