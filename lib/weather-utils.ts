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
    epaIndex?: number;
    visibility?: number;
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

export const getWeatherInfo = (code: number, isDay: boolean = true) => {
  const daySuffix = isDay ? "d" : "n";

  const mapping: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: "Unknown", description: "Unknown conditions", icon: `01${daySuffix}` },
    1000: { main: "Clear", description: isDay ? "Clear, sunny" : "Clear night", icon: `01${daySuffix}` },
    1100: { main: "Clear", description: isDay ? "Mostly clear" : "Mostly clear night", icon: `01${daySuffix}` },
    1101: { main: "Clouds", description: "Partly cloudy", icon: `02${daySuffix}` },
    1102: { main: "Clouds", description: "Mostly cloudy", icon: `03${daySuffix}` },
    1001: { main: "Clouds", description: "Cloudy", icon: "04d" },
    2000: { main: "Fog", description: "Fog", icon: "50d" },
    2100: { main: "Fog", description: "Light fog", icon: "50d" },
    4000: { main: "Drizzle", description: "Drizzle", icon: "09d" },
    4001: { main: "Rain", description: "Rain", icon: `10${daySuffix}` },
    4200: { main: "Rain", description: "Light rain", icon: "09d" },
    4201: { main: "Rain", description: "Heavy rain", icon: `10${daySuffix}` },
    5000: { main: "Snow", description: "Snow", icon: "13d" },
    5001: { main: "Snow", description: "Flurries", icon: "13d" },
    5100: { main: "Snow", description: "Light snow", icon: "13d" },
    5101: { main: "Snow", description: "Heavy snow", icon: "13d" },
    6000: { main: "Rain", description: "Freezing drizzle", icon: "09d" },
    6001: { main: "Rain", description: "Freezing rain", icon: `10${daySuffix}` },
    6200: { main: "Rain", description: "Light freezing rain", icon: "09d" },
    6201: { main: "Rain", description: "Heavy freezing rain", icon: `10${daySuffix}` },
    7000: { main: "Snow", description: "Ice pellets", icon: "13d" },
    7101: { main: "Snow", description: "Heavy ice pellets", icon: "13d" },
    7102: { main: "Snow", description: "Light ice pellets", icon: "13d" },
    8000: { main: "Thunderstorm", description: "Thunderstorm", icon: "11d" },
  };

  return mapping[code] || mapping[0];
};

export const getBackgroundGradient = (weatherMain: string, isDay: boolean, isLight: boolean = false) => {
  const main = weatherMain.toLowerCase();

  if (isLight) {
    if (!isDay) return "from-slate-800 via-indigo-950 to-slate-900";
    switch (main) {
      case "clear":
        return "from-sky-300 via-blue-200 to-amber-100";
      case "clouds":
        return "from-slate-200 via-sky-100 to-gray-200";
      case "rain":
      case "drizzle":
        return "from-slate-300 via-sky-200 to-blue-200";
      case "thunderstorm":
        return "from-purple-200 via-indigo-200 to-slate-300";
      case "snow":
        return "from-sky-100 via-blue-50 to-indigo-100";
      default:
        return "from-sky-300 via-blue-200 to-indigo-100";
    }
  }

  // Dark Mode Gradients
  if (!isDay) return "from-slate-950 via-blue-950 to-black";
  switch (main) {
    case "clear":
      return "from-sky-700 via-blue-800 to-indigo-950";
    case "clouds":
      return "from-slate-700 via-gray-800 to-slate-950";
    case "rain":
    case "drizzle":
      return "from-slate-800 via-sky-950 to-slate-950";
    case "thunderstorm":
      return "from-purple-950 via-slate-950 to-black";
    case "snow":
      return "from-slate-800 via-blue-900 to-slate-950";
    default:
      return "from-blue-700 via-indigo-800 to-slate-950";
  }
};

export const calculateIsDay = (timeIso: string, lon?: number): boolean => {
  const date = new Date(timeIso);
  let hour = date.getUTCHours();
  if (typeof lon === "number" && !Number.isNaN(lon)) {
    // Solar longitude offset: ~15 degrees per hour
    const solarOffsetHours = Math.round(lon / 15);
    hour = (hour + solarOffsetHours + 24) % 24;
  } else {
    hour = date.getHours();
  }
  return hour >= 6 && hour < 19;
};

export const getAQIInfo = (epaIndex?: number) => {
  if (epaIndex === undefined || epaIndex === null) {
    return { label: "Good", color: "text-emerald-500", level: 1 };
  }
  switch (epaIndex) {
    case 1:
      return { label: "Good", color: "text-emerald-500", level: 1 };
    case 2:
      return { label: "Moderate", color: "text-amber-500", level: 2 };
    case 3:
      return { label: "Unhealthy for Sensitive", color: "text-orange-500", level: 3 };
    case 4:
      return { label: "Unhealthy", color: "text-red-500", level: 4 };
    case 5:
      return { label: "Very Unhealthy", color: "text-purple-500", level: 5 };
    case 6:
      return { label: "Hazardous", color: "text-rose-600", level: 6 };
    default:
      return { label: "Moderate", color: "text-amber-500", level: 2 };
  }
};

export const generateVibeSummary = (temp: number, condition: string) => {
  if (temp > 30) return `It's sweltering and ${condition}. Stay hydrated and cool!`;
  if (temp > 22) return `Perfect weather. Warm and ${condition}. Enjoy your day outdoors!`;
  if (temp > 15) return `Mild and ${condition}. A light jacket or layers might be comfortable.`;
  if (temp > 5) return `Chilly and ${condition}. Definitely grab a warm coat before heading out.`;
  return `Freezing cold and ${condition}. Bundle up with warm winter essentials!`;
};
