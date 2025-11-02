import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Outfit categories and conditions
export const outfitCategories = ["top", "bottom", "dress", "jacket", "accessory", "shoes"] as const;
export const weatherConditions = ["sunny", "cloudy", "rainy", "snowy"] as const;
export const moods = ["casual", "formal", "sporty", "party"] as const;

// Outfits table
export const outfits = pgTable("outfits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  suitableWeather: text("suitable_weather").array().notNull(),
  suitableMoods: text("suitable_moods").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
});

export type InsertOutfit = z.infer<typeof insertOutfitSchema>;
export type Outfit = typeof outfits.$inferSelect;

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  outfitId: varchar("outfit_id").notNull().references(() => outfits.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull(), // For future auth integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Relations
export const outfitsRelations = relations(outfits, ({ many }) => ({
  favorites: many(favorites),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  outfit: one(outfits, {
    fields: [favorites.outfitId],
    references: [outfits.id],
  }),
}));

// Weather data model (not stored in DB)
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
