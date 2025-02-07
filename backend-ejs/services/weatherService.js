const axios = require("axios");
const Weather = require("../models/Weather");

const WEATHER_API_KEY = "5587826851b00649ef1c5e40f77c7277";
const LAT = 38.4189;
const LON = 27.1287;

const fetchWeatherData = async () => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`
    );

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      location: "İzmir",
      timestamp: new Date(),
    };

    const weather = await Weather.create(weatherData);
    console.log("Weather data saved:", weather);
    return weather;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw error;
  }
};

module.exports = { fetchWeatherData };
