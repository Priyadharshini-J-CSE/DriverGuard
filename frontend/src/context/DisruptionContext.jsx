import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getLiveData } from '../services/monitoringService';
import { getCoordsForCity, getCanonicalCity, DEFAULT_CITY } from '../utils/cityCoords';

// ─── Demo Mode ────────────────────────────────────────────────────────────────
export const DEMO_MODE = true;

const DEMO_OVERRIDE = {
  weather: { rain: 65, temp: 35, humidity: 72, condition: 'Heavy rain' },
  aqi:     { aqi: 26,  city: null },
  traffic: { trafficRatio: 0.8 },
};
// ──────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  rain:    10,
  temp:    40,
  aqi:     150,
  traffic: 0.5,
};

function buildDisruptions(liveData) {
  const detected = [];
  const w = liveData?.weather;
  const a = liveData?.aqi;
  const t = liveData?.traffic;

  if (w?.rain  != null && w.rain  > THRESHOLDS.rain)   detected.push({ type: 'heavy_rain',   value: w.rain });
  if (w?.temp  != null && w.temp  > THRESHOLDS.temp)   detected.push({ type: 'extreme_heat', value: w.temp });
  if (a?.aqi   != null && a.aqi   > THRESHOLDS.aqi)    detected.push({ type: 'aqi_hazard',   value: a.aqi });
  if (t?.trafficRatio != null && t.trafficRatio < THRESHOLDS.traffic)
    detected.push({ type: 'traffic_jam', value: t.trafficRatio });

  return detected;
}

const DisruptionContext = createContext(null);

export const DisruptionProvider = ({ children, city: cityProp }) => {
  // Resolve canonical city name — fallback to DEFAULT_CITY if unsupported
  const resolvedCity = getCanonicalCity(cityProp) ?? DEFAULT_CITY;

  const [liveData,    setLiveData]    = useState(null);
  const [disruptions, setDisruptions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeCity,  setActiveCity]  = useState(resolvedCity);

  // Track previous city to detect changes
  const prevCityRef = useRef(resolvedCity);

  const refresh = useCallback(async (cityOverride) => {
    const city   = cityOverride ?? activeCity;
    const coords = getCoordsForCity(city);
    setLoading(true);
    try {
      const res = await getLiveData(coords.lat, coords.lon);
      let raw   = res.data;

      // Attach city name to weather for logs
      if (raw?.weather) raw.weather.city = city;

      const realDisruptions = buildDisruptions(raw);
      if (DEMO_MODE && realDisruptions.length === 0) {
        raw = {
          ...raw,
          weather: { ...DEMO_OVERRIDE.weather, city },
          aqi:     { ...raw?.aqi,     ...DEMO_OVERRIDE.aqi },
          traffic: { ...raw?.traffic, ...DEMO_OVERRIDE.traffic },
        };
      }

      setLiveData(raw);
      setDisruptions(buildDisruptions(raw));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      if (DEMO_MODE) {
        const demoData = {
          weather: { ...DEMO_OVERRIDE.weather, city },
          aqi:     DEMO_OVERRIDE.aqi,
          traffic: DEMO_OVERRIDE.traffic,
        };
        setLiveData(demoData);
        setDisruptions(buildDisruptions(demoData));
      }
    } finally {
      setLoading(false);
    }
  }, [activeCity]);

  // Re-fetch when city prop changes
  useEffect(() => {
    const newCity = getCanonicalCity(cityProp) ?? DEFAULT_CITY;
    if (newCity !== prevCityRef.current) {
      prevCityRef.current = newCity;
      setActiveCity(newCity);
      refresh(newCity);
    }
  }, [cityProp, refresh]);

  // Initial fetch + 5-min interval
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DisruptionContext.Provider value={{
      liveData, disruptions, loading, lastUpdated,
      city: activeCity,
      coords: getCoordsForCity(activeCity),
      refresh: () => refresh(),
    }}>
      {children}
    </DisruptionContext.Provider>
  );
};

export const useDisruption = () => {
  const ctx = useContext(DisruptionContext);
  // Return safe defaults when used outside provider (unauthenticated pages)
  if (!ctx) return { liveData: null, disruptions: [], loading: false, lastUpdated: null, city: 'Madurai', coords: { lat: 9.9252, lon: 78.1198 }, refresh: () => {} };
  return ctx;
};
