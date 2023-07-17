terminal.addCommand("weather", async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude: lat, longitude: lon } = position.coords;

    terminal.printLine("Getting weather data for your location...");

    const response = await fetch(
      `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`
    );

    const {
      sources: [{ station_name }],
      weather: { temperature, icon },
    } = await response.json();

    const weatherIcons = {
      "clear-day": "☀️",
      "clear-night": "🌙",
      "partly-cloudy-day": "⛅",
      "partly-cloudy-night": "⛅",
      cloudy: "☁️",
      fog: "🌫️",
      wind: "🌬️",
      rain: "🌧️",
      sleet: "🌨️",
      snow: "❄️",
      hail: "🌨️",
      thunderstorm: "⛈️",
      null: "",
    };

    terminal.printLine(
      `Current weather near ${station_name}: ${temperature}°C, ${
        weatherIcons[icon]
      }`
    );
  } catch {
    terminal.printError("Failed to get weather data.");
  }
}, {
  description: "Get the current weather",
  author: "Colin Chadwick"
})