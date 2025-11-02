import type { Outfit, InsertOutfit, Favorite, InsertFavorite, WeatherData, weatherConditions, moods } from "@shared/schema";
import { outfits, favorites } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Outfit operations
  getAllOutfits(): Promise<Outfit[]>;
  getOutfitById(id: string): Promise<Outfit | undefined>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  
  // Favorites operations
  getFavorites(userId: string): Promise<Outfit[]>;
  addFavorite(userId: string, outfitId: string): Promise<Favorite>;
  removeFavorite(userId: string, outfitId: string): Promise<void>;
  isFavorite(userId: string, outfitId: string): Promise<boolean>;
  
  // Recommendation operations
  getRecommendations(
    weather: typeof weatherConditions[number],
    mood: typeof moods[number]
  ): Promise<Outfit[]>;
  
  // Weather operations
  getWeatherData(city?: string): Promise<WeatherData>;
}

export class DatabaseStorage implements IStorage {
  async getAllOutfits(): Promise<Outfit[]> {
    return await db.select().from(outfits);
  }

  async getOutfitById(id: string): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit || undefined;
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const [outfit] = await db
      .insert(outfits)
      .values(insertOutfit)
      .returning();
    return outfit;
  }

  async getFavorites(userId: string): Promise<Outfit[]> {
    const result = await db
      .select({
        outfit: outfits,
      })
      .from(favorites)
      .innerJoin(outfits, eq(favorites.outfitId, outfits.id))
      .where(eq(favorites.userId, userId));
    
    return result.map(r => r.outfit);
  }

  async addFavorite(userId: string, outfitId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, outfitId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, outfitId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.outfitId, outfitId)
        )
      );
  }

  async isFavorite(userId: string, outfitId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.outfitId, outfitId)
        )
      )
      .limit(1);
    
    return !!favorite;
  }

  async getRecommendations(
    weather: typeof weatherConditions[number],
    mood: typeof moods[number]
  ): Promise<Outfit[]> {
    const allOutfits = await this.getAllOutfits();
    
    // Filter outfits that match both weather and mood
    const recommendations = allOutfits.filter(outfit => {
      const matchesWeather = outfit.suitableWeather.includes(weather);
      const matchesMood = outfit.suitableMoods.includes(mood);
      return matchesWeather && matchesMood;
    });

    // If no exact matches, return outfits that match at least the mood
    if (recommendations.length === 0) {
      return allOutfits.filter(outfit => outfit.suitableMoods.includes(mood)).slice(0, 5);
    }

    return recommendations.slice(0, 5);
  }

  async getWeatherData(city?: string): Promise<WeatherData> {
    // Simulated weather data - in production, this would call a real weather API
    const conditions: Array<typeof weatherConditions[number]> = ["sunny", "cloudy", "rainy", "snowy"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      condition: randomCondition,
      temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
      location: city || "Your Location",
    };
  }

  // Initialize database with sample data
  async initializeSampleData() {
    const existingOutfits = await this.getAllOutfits();
    if (existingOutfits.length > 0) {
      return; // Already initialized
    }

    const sampleOutfits: InsertOutfit[] = [
      {
        name: "Casual T-Shirt",
        category: "top",
        modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Suzanne/glTF-Binary/Suzanne.glb",
        description: "A comfortable t-shirt perfect for any casual occasion",
        suitableWeather: ["sunny", "cloudy"],
        suitableMoods: ["casual", "sporty"],
      },
      {
        name: "Stylish Hoodie",
        category: "top",
        modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
        description: "Warm and stylish hoodie for cooler days",
        suitableWeather: ["cloudy", "rainy", "snowy"],
        suitableMoods: ["casual", "sporty"],
      },
    ];

    for (const outfit of sampleOutfits) {
      await this.createOutfit(outfit);
    }
  }
}

export const storage = new DatabaseStorage();
