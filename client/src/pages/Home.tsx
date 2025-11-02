import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CameraFeed } from "@/components/CameraFeed";
import { MobileDrawer } from "@/components/MobileDrawer";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Outfit, weatherConditions, moods } from "@shared/schema";

export default function Home() {
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<typeof weatherConditions[number] | null>(null);
  const [selectedMood, setSelectedMood] = useState<typeof moods[number] | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error' | 'denied'>('loading');

  // Fetch all outfits
  const { data: outfits = [], isLoading: isLoadingOutfits } = useQuery<Outfit[]>({
    queryKey: ['/api/outfits'],
  });

  // Fetch recommendations based on weather and mood
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery<Outfit[]>({
    queryKey: ['/api/recommendations', selectedWeather, selectedMood],
    queryFn: async () => {
      if (!selectedWeather || !selectedMood) return [];
      const params = new URLSearchParams({
        weather: selectedWeather,
        mood: selectedMood,
      });
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: !!selectedWeather && !!selectedMood,
  });

  const handleSelectOutfit = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
  };

  const handleWeatherChange = (weather: typeof weatherConditions[number]) => {
    setSelectedWeather(weather);
  };

  const handleMoodChange = (mood: typeof moods[number]) => {
    setSelectedMood(mood);
  };

  const handleTryOn = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-background/80 backdrop-blur-lg flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div>
          <h1 className="text-xl font-heading font-bold tracking-tight">VirtualFit</h1>
          <p className="text-xs text-muted-foreground">Virtual Try-On Experience</p>
        </div>
        
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Camera Feed */}
        <div className="flex-1 relative">
          <CameraFeed
            selectedOutfit={selectedOutfit}
            onCameraStatus={setCameraStatus}
          />
        </div>

        {/* Desktop Sidebar */}
        <DesktopSidebar
          outfits={outfits}
          recommendations={recommendations}
          selectedOutfitId={selectedOutfit?.id}
          selectedWeather={selectedWeather}
          selectedMood={selectedMood}
          onSelectOutfit={handleSelectOutfit}
          onWeatherChange={handleWeatherChange}
          onMoodChange={handleMoodChange}
          onTryOn={handleTryOn}
          isLoadingOutfits={isLoadingOutfits}
          isLoadingRecommendations={isLoadingRecommendations}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        outfits={outfits}
        recommendations={recommendations}
        selectedOutfitId={selectedOutfit?.id}
        selectedWeather={selectedWeather}
        selectedMood={selectedMood}
        onSelectOutfit={handleSelectOutfit}
        onWeatherChange={handleWeatherChange}
        onMoodChange={handleMoodChange}
        onTryOn={handleTryOn}
        isLoadingOutfits={isLoadingOutfits}
        isLoadingRecommendations={isLoadingRecommendations}
      />
    </div>
  );
}
