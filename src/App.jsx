import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDay, setIsDay] = useState(true);

  const updateTheme = (data) => {
    const now = data.dt;
    setIsDay(now > data.sys.sunrise && now < data.sys.sunset);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        console.log("Location denied");
      }
    );
  }, []);

  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();

      updateTheme(currentData);
      setWeather(currentData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
    } catch {
      setError("Failed to load location weather");
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );

      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      updateTheme(data);
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-all ${
        isDay
          ? "bg-gradient-to-br from-sky-400 to-blue-600"
          : "bg-gradient-to-br from-slate-900 to-black"
      }`}
    >
      <div className="w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-4">
          Weather Dashboard
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 p-3 rounded-lg text-black"
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCity()}
          />
          <button
            onClick={searchCity}
            className="bg-white text-black px-4 rounded-lg font-semibold"
          >
            Go
          </button>
        </div>

        {loading && (
          <div className="text-center animate-pulse">Loading...</div>
        )}
        {error && <p className="text-red-300 text-center">{error}</p>}

        {weather && (
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 mt-4 text-center">
            <h2 className="text-xl font-semibold">{weather.name}</h2>
            <img
              className="mx-auto"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            />
            <p className="text-4xl font-bold">
              {Math.round(weather.main.temp)}°C
            </p>
            <p className="capitalize text-gray-200">
              {weather.weather[0].description}
            </p>

            <div className="flex justify-between mt-4 text-sm">
              <span>💧 {weather.main.humidity}%</span>
              <span>💨 {weather.wind.speed} m/s</span>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {forecast.map((day, i) => (
              <div
                key={i}
                className="bg-white/20 backdrop-blur rounded-lg p-2 text-center text-sm"
              >
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  className="mx-auto"
                />
                <p>{Math.round(day.main.temp)}°</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
