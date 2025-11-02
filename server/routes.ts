import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOutfitSchema, weatherRequestSchema, recommendationRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
