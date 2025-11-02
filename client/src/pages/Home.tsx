import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VirtualTryOn } from "@/components/VirtualTryOn";
import { MobileDrawer } from "@/components/MobileDrawer";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Outfit, weatherConditions, moods } from "@shared/schema";

const DEFAULT_USER_ID = "guest-user"; // For now, use default user ID until auth is implemented

export default function Home() {
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<typeof weatherConditions[number] | null>(null);
  const [selectedMood, setSelectedMood] = useState<typeof moods[number] | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error' | 'denied'>('loading');
  const { toast } = useToast();

  // Fetch all outfits
  const { data: outfits = [], isLoading: isLoadingOutfits } = useQuery<Outfit[]>({
    queryKey: ['/api/outfits'],
  });

  // Fetch favorite outfits
  const { data: favoriteOutfits = [] } = useQuery<Outfit[]>({
    queryKey: ['/api/favorites', DEFAULT_USER_ID],
  });

  // Create a set of favorite IDs for quick lookup
  const favoriteIds = new Set(favoriteOutfits.map(outfit => outfit.id));

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

  const handleCapture = (imageData: string) => {
    // Photo captured - could be used for saving to gallery in future
    console.log('Photo captured:', imageData.substring(0, 50) + '...');
  };

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (outfitId: string) => {
      return await apiRequest('POST', '/api/favorites', {
        outfitId,
        userId: DEFAULT_USER_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', DEFAULT_USER_ID] });
      toast({
        title: "Added to favorites",
        description: "Outfit saved to your favorites",
      });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (outfitId: string) => {
      const response = await fetch(`/api/favorites/${outfitId}?userId=${DEFAULT_USER_ID}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', DEFAULT_USER_ID] });
      toast({
        title: "Removed from favorites",
        description: "Outfit removed from your favorites",
      });
    },
  });

  const handleToggleFavorite = (outfitId: string, isFavorite: boolean) => {
    if (isFavorite) {
      removeFavoriteMutation.mutate(outfitId);
    } else {
      addFavoriteMutation.mutate(outfitId);
    }
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
        {/* Virtual Try-On with Body Tracking */}
        <div className="flex-1 relative">
          <VirtualTryOn
            selectedOutfit={selectedOutfit}
            onCameraStatus={setCameraStatus}
            onCapture={handleCapture}
          />
        </div>

        {/* Desktop Sidebar */}
        <DesktopSidebar
          outfits={outfits}
          recommendations={recommendations}
          favoriteOutfits={favoriteOutfits}
          favoriteIds={favoriteIds}
          selectedOutfitId={selectedOutfit?.id}
          selectedWeather={selectedWeather}
          selectedMood={selectedMood}
          onSelectOutfit={handleSelectOutfit}
          onWeatherChange={handleWeatherChange}
          onMoodChange={handleMoodChange}
          onTryOn={handleTryOn}
          onToggleFavorite={handleToggleFavorite}
          isLoadingOutfits={isLoadingOutfits}
          isLoadingRecommendations={isLoadingRecommendations}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        outfits={outfits}
        recommendations={recommendations}
        favoriteOutfits={favoriteOutfits}
        favoriteIds={favoriteIds}
        selectedOutfitId={selectedOutfit?.id}
        selectedWeather={selectedWeather}
        selectedMood={selectedMood}
        onSelectOutfit={handleSelectOutfit}
        onWeatherChange={handleWeatherChange}
        onMoodChange={handleMoodChange}
        onTryOn={handleTryOn}
        onToggleFavorite={handleToggleFavorite}
        isLoadingOutfits={isLoadingOutfits}
        isLoadingRecommendations={isLoadingRecommendations}
      />
    </div>
  );
}
