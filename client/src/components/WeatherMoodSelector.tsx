import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { weatherConditions, moods } from "@shared/schema";

interface WeatherMoodSelectorProps {
  selectedWeather: typeof weatherConditions[number] | null;
  selectedMood: typeof moods[number] | null;
  onWeatherChange: (weather: typeof weatherConditions[number]) => void;
  onMoodChange: (mood: typeof moods[number]) => void;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
};

const weatherLabels = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  snowy: 'Snowy',
};

const moodLabels = {
  casual: 'Casual',
  formal: 'Formal',
  sporty: 'Sporty',
  party: 'Party',
};

export function WeatherMoodSelector({
  selectedWeather,
  selectedMood,
  onWeatherChange,
  onMoodChange,
}: WeatherMoodSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Weather Selection */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
          Weather
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(weatherIcons) as Array<keyof typeof weatherIcons>).map((weather) => {
            const Icon = weatherIcons[weather];
            const isSelected = selectedWeather === weather;
            
            return (
              <Button
                key={weather}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onWeatherChange(weather)}
                className={`px-4 py-2.5 ${isSelected ? 'shadow-lg' : ''}`}
                data-testid={`button-weather-${weather}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {weatherLabels[weather]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mood Selection */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
          Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(moodLabels) as Array<keyof typeof moodLabels>).map((mood) => {
            const isSelected = selectedMood === mood;
            
            return (
              <Button
                key={mood}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onMoodChange(mood)}
                className={`px-4 py-2.5 ${isSelected ? 'shadow-lg' : ''}`}
                data-testid={`button-mood-${mood}`}
              >
                {moodLabels[mood]}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
