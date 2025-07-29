import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
import searchIcon from './assets/searchicon.jpg'
import './App.css'

const API_KEY = '2c91a09af875b7fd2b5fd4909ad4aec6'

export default function App() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState([])
  const [error, setError] = useState('')

  // Debounce typing
  const debouncedQuery = useCallback(
    debounce(val => setQuery(val), 500),
    []
  )

  useEffect(() => () => debouncedQuery.cancel(), [debouncedQuery])

  useEffect(() => {
    if (!query) return
    setError('')
    setCurrent(null)
    setForecast([])

    // Current weather fetch
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${API_KEY}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.cod !== 200) {
          setError('City not found')
          return
        }
        setCurrent(data)
        // Set theme class on <body>
        const theme = {
          Clear: 'theme-sunny',
          Rain: 'theme-rainy',
          Clouds: 'theme-cloudy'
        }[data.weather[0].main] || 'theme-default'
        document.body.className = theme
      })
      .catch(() => setError('Network error'))

    // 5‑day forecast fetch
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${API_KEY}`
    )
      .then(res => res.json())
      .then(json => {
        if (json.cod !== '200') return
        const daily = {}
        json.list.forEach(item => {
          const [date, time] = item.dt_txt.split(' ')
          if (time === '12:00:00') daily[date] = item
        })
        setForecast(Object.values(daily).slice(0, 5))
      })
      .catch(console.error)
  }, [query])

  const onChange = e => {
    setInput(e.target.value)
    debouncedQuery(e.target.value)
  }

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      debouncedQuery.cancel()
      setQuery(input)
    }
  }

  const onSearch = () => {
    debouncedQuery.cancel()
    setQuery(input)
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Weather App ☁️</h1>

        <div className="search-bar">
          <input
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Search City…"
          />
          <button onClick={onSearch}>
            <img src={searchIcon} alt="Search" width="24" height="24" />
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {current && (
          <div className="weather-current fade-in">
            <h2>{current.name}, {current.sys.country}</h2>
            <p>{new Date().toLocaleDateString()}</p>
            <img
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
              alt={current.weather[0].description}
            />
            <h3>{Math.round(current.main.temp)}°C</h3>
            <p>{current.weather[0].description.toUpperCase()}</p>
            <p>Wind: {current.wind.speed} m/s</p>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast-container fade-in">
            {forecast.map(item => (
              <div key={item.dt} className="forecast-card">
                <p>{item.dt_txt.split(' ')[0]}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt=""
                />
                <p>
                  Hi {Math.round(item.main.temp_max)}° Lo {Math.round(item.main.temp_min)}°
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
