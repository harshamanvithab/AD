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
        name: "Classic White Tee",
        category: "top",
        imageUrl: "/assets/generated_images/White_casual_t-shirt_f13e2482.png",
        description: "A timeless white t-shirt perfect for any casual occasion",
        suitableWeather: ["sunny", "cloudy"],
        suitableMoods: ["casual", "sporty"],
      },
      {
        name: "Urban Black Graphic",
        category: "top",
        imageUrl: "/assets/generated_images/Black_graphic_t-shirt_9133fdb5.png",
        description: "Stylish black graphic tee for a modern look",
        suitableWeather: ["sunny", "cloudy"],
        suitableMoods: ["casual", "party"],
      },
      {
        name: "Professional Navy Shirt",
        category: "top",
        imageUrl: "/assets/generated_images/Navy_formal_shirt_4d15951a.png",
        description: "Elegant navy button-up shirt for formal settings",
        suitableWeather: ["cloudy", "rainy"],
        suitableMoods: ["formal"],
      },
      {
        name: "Cozy Flannel",
        category: "top",
        imageUrl: "/assets/generated_images/Red_flannel_shirt_27f68a7b.png",
        description: "Warm and comfortable flannel shirt",
        suitableWeather: ["cloudy", "rainy", "snowy"],
        suitableMoods: ["casual"],
      },
      {
        name: "Athletic Hoodie",
        category: "top",
        imageUrl: "/assets/generated_images/Gray_hoodie_9507ea78.png",
        description: "Comfortable gray hoodie for active days",
        suitableWeather: ["cloudy", "rainy", "snowy"],
        suitableMoods: ["casual", "sporty"],
      },
      {
        name: "Executive Blazer",
        category: "jacket",
        imageUrl: "/assets/generated_images/Beige_blazer_7d04eb1e.png",
        description: "Sophisticated beige blazer for business meetings",
        suitableWeather: ["cloudy", "rainy"],
        suitableMoods: ["formal"],
      },
      {
        name: "Classic Denim",
        category: "bottom",
        imageUrl: "/assets/generated_images/Blue_denim_jeans_d8c30e49.png",
        description: "Versatile blue jeans for everyday wear",
        suitableWeather: ["sunny", "cloudy", "rainy"],
        suitableMoods: ["casual", "sporty"],
      },
      {
        name: "Formal Trousers",
        category: "bottom",
        imageUrl: "/assets/generated_images/Black_dress_pants_a337bc94.png",
        description: "Sleek black dress pants for professional occasions",
        suitableWeather: ["sunny", "cloudy", "rainy"],
        suitableMoods: ["formal"],
      },
      {
        name: "Summer Floral Dress",
        category: "dress",
        imageUrl: "/assets/generated_images/Floral_summer_dress_296257f8.png",
        description: "Beautiful flowing dress perfect for sunny days",
        suitableWeather: ["sunny"],
        suitableMoods: ["casual", "party"],
      },
      {
        name: "Evening Elegance",
        category: "dress",
        imageUrl: "/assets/generated_images/Black_evening_dress_f2457c3d.png",
        description: "Stunning black cocktail dress for special events",
        suitableWeather: ["sunny", "cloudy"],
        suitableMoods: ["formal", "party"],
      },
    ];

    for (const outfit of sampleOutfits) {
      await this.createOutfit(outfit);
    }
  }
}

export const storage = new DatabaseStorage();
