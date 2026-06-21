//Predominantly class driven html dictactes the use of the .querySelector method

// function for the submit event on the form
const form = document.querySelector('.input-value');


// The text input for city name
const cityInput = document.querySelector('.city-input input');


// The error message paragraph — toggled with the "hidden" class
const errorMessage = document.querySelector('.error-message');

// The loading indicator (toggled with the "hidden" class)
const loadingIndicator = document.querySelector('.loading');

// Elements inside the "today's weather" hero section
const weatherIcon = document.querySelector('.weather-icon');
const locationText = document.querySelector('.location');
const temperatureText = document.querySelector('.temperature');
const feelingText = document.querySelector('.feeling');

// Elements inside the parameter card (humidity, wind, UV)
const humidityValue = document.querySelector('.parameter-value:nth-child(1) .values');
const windValue = document.querySelector('.parameter-value:nth-child(2) .values');
const uvValue = document.querySelector('.parameter-value:nth-child(3) .values');

// All 5 forecast day cards presented as a list for looping over
const dayCards = document.querySelectorAll('.day');

// Mapping WMO weather codes to a human-readable description and emoji icon

const weatherCodeMap = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Partly cloudy", icon: "⛅" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Partly cloudy", icon: "⛅" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Foggy", icon: "🌫️" },
  51: { description: "Drizzle", icon: "🌦️" },
  53: { description: "Drizzle", icon: "🌦️" },
  55: { description: "Drizzle", icon: "🌦️" },
  61: { description: "Rain", icon: "🌧️" },
  63: { description: "Rain", icon: "🌧️" },
  65: { description: "Rain", icon: "🌧️" },
  71: { description: "Snow", icon: "❄️" },
  73: { description: "Snow", icon: "❄️" },
  75: { description: "Snow", icon: "❄️" },
  80: { description: "Rain showers", icon: "🌦️" },
  81: { description: "Rain showers", icon: "🌦️" },
  82: { description: "Rain showers", icon: "🌦️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
};

// A fallback function that looks up a code or returns a default value if it's missing

function getWeatherInfo(code) {

    
  return weatherCodeMap[code] || { description: "Unknown", icon: "❓" };
}

//Geocoding functions for converting a city's name to longitude and langitude


async function getCoordinates(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;

  const response = await fetch(url);
  const data = await response.json();

  // If no "results" array exists, the city wasn't found

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  const place = data.results[0];

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    country: place.country,
  };
}


// Takes latitude and longitude, fetches current weather + 5-day forecast

async function getWeatherData(latitude, longitude) {
 const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

// Updating the page with the city info and weather data

function updateWeatherDisplay(cityInfo, weatherData) {
  const current = weatherData.current;
  const weatherInfo = getWeatherInfo(current.weather_code);

  // Updates the weather infomation in the hero section

  weatherIcon.textContent = weatherInfo.icon;
  locationText.textContent = `${cityInfo.name}, ${cityInfo.country}`;
  temperatureText.textContent = `${Math.round(current.temperature_2m)}°C`;
  feelingText.textContent = `${weatherInfo.description} . Feels like ${Math.round(current.apparent_temperature)}°C`;

  // Update the parameter card
  humidityValue.textContent = `${current.relative_humidity_2m}%`;
  windValue.textContent = `${current.wind_speed_10m} km/h`;
  uvValue.textContent = `${current.uv_index}`;

  // Update the 5-day forecast cards
  updateForecast(weatherData.daily);
}
// Updates the daily forecast data for each of the 5 day cards

function updateForecast(daily) {

  dayCards.forEach((card, index) => {
    const weekDay = card.querySelector('.week-day');
    const icon = card.querySelector('.icons');
    const highTemp = card.querySelector('.daily-temp strong');
    const lowTemp = card.querySelector('.daily-temp small');

    const dateString = daily.time[index];
    const weatherInfo = getWeatherInfo(daily.weather_code[index]);

    weekDay.textContent = index === 0 ? "Today" : getDayName(dateString);
    icon.textContent = weatherInfo.icon;
    highTemp.textContent = `${Math.round(daily.temperature_2m_max[index])}°`;
    lowTemp.textContent = `${Math.round(daily.temperature_2m_min[index])}°`;
  });
}

// converts a date string to a week day name
function getDayName(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long' };
  return date.toLocaleDateString('en-US', options);
}

// Runs when the search form is submitted

form.addEventListener('submit', async (event) => {
  // Stop the form from doing its default behavior (reloading the page)
  event.preventDefault();

  const cityName = cityInput.value.trim();

  //Return if input is empty

  if (cityName === "") {
    return;
  }

  // Reset displayed data before starting a new search

  errorMessage.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');

  try {
    const cityInfo = await getCoordinates(cityName);
    const weatherData = await getWeatherData(cityInfo.latitude, cityInfo.longitude);

    updateWeatherDisplay(cityInfo, weatherData);
  } catch (error) {
    // Something went wrong — show the error message instead
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');

  
  } finally {
    // Whether it succeeded or failed, stop showing the loading indicator
    loadingIndicator.classList.add('hidden');
  }
});