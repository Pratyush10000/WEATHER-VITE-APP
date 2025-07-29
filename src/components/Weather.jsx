// src/components/Weather.jsx
import './Weather.css';
import { useEffect, useState } from 'react';
import './Weather.css'; // we’ll create this
import searchIcon from '../assets/searchicon.jpg';

const Weather = ({ city, apiKey }) => {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (!city) return;

    // 1) current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(res => res.json())
      .then(setCurrent)
      .catch(console.error);

    // 2) 5‑day forecast (every 3 h; we’ll pick one reading per day)
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
      .then(res => res.json())
      .then(json => {
        // group by date, pick midday reading
        const daily = {};
        json.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          const hour = +item.dt_txt.split(' ')[1].slice(0,2);
          if (hour === 12) daily[date] = item;
        });
        // take next 5 days
        setForecast(Object.values(daily).slice(0, 5));
      })
      .catch(console.error);
  }, [city, apiKey]);

  if (!current) return <p>Enter a city name above…</p>;
  if (current.cod !== 200) return <p>City not found.</p>;

  // format date
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday:'long', day:'numeric', month:'long'
  });

  return (
    <div className="weather-wrapper">
      <div className="weather-current fade-in">
        <h1>{current.name}, {current.sys.country}</h1>
        <p>{todayStr}</p>
        <img
          src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
          alt={current.weather[0].description}
        />
        <h2>{Math.round(current.main.temp)}°C</h2>
        <p>{current.weather[0].description.toUpperCase()}</p>
        <p>Wind: {current.wind.speed} m/s</p>
      </div>

      <div className="forecast-container fade-in">
        {forecast.map(item => {
          const date = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday:'short', day:'numeric' });
          return (
            <div key={item.dt} className="forecast-card">
              <p>{date}</p>
              <img
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                alt=""
              />
              <p>Hi {Math.round(item.main.temp_max)}°</p>
              <p>Lo {Math.round(item.main.temp_min)}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Weather;
