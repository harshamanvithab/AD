import { z } from "zod";

// Outfit data model
export const outfitCategories = ["top", "bottom", "dress", "jacket"] as const;
export const weatherConditions = ["sunny", "cloudy", "rainy", "snowy"] as const;
export const moods = ["casual", "formal", "sporty", "party"] as const;

export interface Outfit {
  id: string;
  name: string;
  category: typeof outfitCategories[number];
  imageUrl: string;
  description: string;
  suitableWeather: (typeof weatherConditions[number])[];
  suitableMoods: (typeof moods[number])[];
}

export const insertOutfitSchema = z.object({
  name: z.string().min(1),
  category: z.enum(outfitCategories),
  imageUrl: z.string().url(),
  description: z.string(),
  suitableWeather: z.array(z.enum(weatherConditions)),
  suitableMoods: z.array(z.enum(moods)),
});

export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

// Weather data model
export interface WeatherData {
  condition: typeof weatherConditions[number];
  temperature: number;
  location: string;
}

export const weatherRequestSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().optional(),
});

export type WeatherRequest = z.infer<typeof weatherRequestSchema>;

// Recommendation request model
export const recommendationRequestSchema = z.object({
  weather: z.enum(weatherConditions),
  mood: z.enum(moods),
});

export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;

// Camera overlay position data
export interface OutfitOverlay {
  outfitId: string;
  position: {
    x: number;
    y: number;
    scale: number;
  };
}
