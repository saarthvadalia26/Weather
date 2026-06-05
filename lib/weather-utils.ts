export interface WeatherTimelineValue {
  time: string;
  values: {
    temperature: number;
    temperatureApparent: number;
    temperatureMin?: number;
    temperatureMax?: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    pressureSurfaceLevel: number;
    weatherCode: number;
    weatherCodeMax?: number;
  };
}

export interface WeatherData {
  timelines: {
    hourly: WeatherTimelineValue[];
    daily: WeatherTimelineValue[];
  };
  location: {
    name: string;
    lat: number;
    lon: number;
  };
}

export const getWeatherInfo = (code: number) => {
  const mapping: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: "Unknown", description: "Unknown", icon: "01d" },
    1000: { main: "Clear", description: "Clear, sunny", icon: "01d" },
    1100: { main: "Clear", description: "Mostly clear", icon: "01d" },
    1101: { main: "Clouds", description: "Partly cloudy", icon: "02d" },
    1102: { main: "Clouds", description: "Mostly cloudy", icon: "03d" },
    1001: { main: "Clouds", description: "Cloudy", icon: "04d" },
    2000: { main: "Fog", description: "Fog", icon: "50d" },
    2100: { main: "Fog", description: "Light fog", icon: "50d" },
    4000: { main: "Drizzle", description: "Drizzle", icon: "09d" },
    4001: { main: "Rain", description: "Rain", icon: "10d" },
    4200: { main: "Rain", description: "Light rain", icon: "09d" },
    4201: { main: "Rain", description: "Heavy rain", icon: "10d" },
    5000: { main: "Snow", description: "Snow", icon: "13d" },
    5001: { main: "Snow", description: "Flurries", icon: "13d" },
    5100: { main: "Snow", description: "Light snow", icon: "13d" },
    5101: { main: "Snow", description: "Heavy snow", icon: "13d" },
    8000: { main: "Thunderstorm", description: "Thunderstorm", icon: "11d" },
  };
  return mapping[code] || mapping[0];
};

export const getBackgroundGradient = (weatherMain: string, isDay: boolean) => {
  if (!isDay) return "from-slate-950 via-blue-950 to-black";
  switch (weatherMain.toLowerCase()) {
    case "clear": return "from-blue-600 via-blue-500 to-indigo-400";
    case "clouds": return "from-slate-600 via-gray-700 to-slate-800";
    case "rain": case "drizzle": return "from-slate-800 via-blue-950 to-black";
    case "thunderstorm": return "from-purple-950 via-slate-950 to-black";
    case "snow": return "from-blue-200 via-slate-100 to-blue-50";
    default: return "from-blue-600 via-blue-500 to-indigo-400";
  }
};

export const generateVibeSummary = (temp: number, condition: string) => {
  if (temp > 30) return `It's sweltering and ${condition}. Stay hydrated!`;
  if (temp > 22) return `Perfect weather. Warm and ${condition}. Enjoy the day!`;
  if (temp > 15) return `Mild and ${condition}. A light jacket might be nice.`;
  if (temp > 5) return `Chilly and ${condition}. Definitely grab a coat.`;
  return `Freezing and ${condition}. Bundle up!`;
};
