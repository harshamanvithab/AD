import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOutfitSchema, weatherRequestSchema, recommendationRequestSchema, insertFavoriteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data on startup
  await storage.initializeSampleData();
  // Get all outfits
  app.get("/api/outfits", async (_req, res) => {
    try {
      const outfits = await storage.getAllOutfits();
      res.json(outfits);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      res.status(500).json({ error: "Failed to fetch outfits" });
    }
  });

  // Get outfit by ID
  app.get("/api/outfits/:id", async (req, res) => {
    try {
      const outfit = await storage.getOutfitById(req.params.id);
      
      if (!outfit) {
        return res.status(404).json({ error: "Outfit not found" });
      }
      
      res.json(outfit);
    } catch (error) {
      console.error("Error fetching outfit:", error);
      res.status(500).json({ error: "Failed to fetch outfit" });
    }
  });

  // Create new outfit
  app.post("/api/outfits", async (req, res) => {
    try {
      const validatedData = insertOutfitSchema.parse(req.body);
      const outfit = await storage.createOutfit(validatedData);
      res.status(201).json(outfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid outfit data", details: error.errors });
      }
      console.error("Error creating outfit:", error);
      res.status(500).json({ error: "Failed to create outfit" });
    }
  });

  // Get recommendations based on weather and mood
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { weather, mood } = req.query;
      
      if (!weather || !mood) {
        return res.status(400).json({ error: "Weather and mood parameters are required" });
      }

      const validatedData = recommendationRequestSchema.parse({
        weather: weather as string,
        mood: mood as string,
      });

      const recommendations = await storage.getRecommendations(
        validatedData.weather,
        validatedData.mood
      );
      
      res.json(recommendations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request parameters", details: error.errors });
      }
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Get weather data
  app.get("/api/weather", async (req, res) => {
    try {
      const { city } = req.query;
      
      const weatherData = await storage.getWeatherData(city as string | undefined);
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Favorites endpoints
  const DEFAULT_USER_ID = "guest-user"; // For now, use a default user ID until auth is implemented

  // Get user's favorite outfits
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string || DEFAULT_USER_ID;
      const favoriteOutfits = await storage.getFavorites(userId);
      res.json(favoriteOutfits);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add outfit to favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const { outfitId, userId = DEFAULT_USER_ID } = req.body;
      
      if (!outfitId) {
        return res.status(400).json({ error: "Outfit ID is required" });
      }

      const favorite = await storage.addFavorite(userId, outfitId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove outfit from favorites
  app.delete("/api/favorites/:outfitId", async (req, res) => {
    try {
      const { outfitId } = req.params;
      const userId = req.query.userId as string || DEFAULT_USER_ID;
      
      await storage.removeFavorite(userId, outfitId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Check if outfit is favorited
  app.get("/api/favorites/check/:outfitId", async (req, res) => {
    try {
      const { outfitId } = req.params;
      const userId = req.query.userId as string || DEFAULT_USER_ID;
      
      const isFavorite = await storage.isFavorite(userId, outfitId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
