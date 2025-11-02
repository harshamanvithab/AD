import { useState } from "react";
import { ChevronDown, Shirt, Sparkles, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutfitGallery } from "./OutfitGallery";
import { WeatherMoodSelector } from "./WeatherMoodSelector";
import { RecommendationPanel } from "./RecommendationPanel";
import type { Outfit, weatherConditions, moods } from "@shared/schema";

interface MobileDrawerProps {
  outfits: Outfit[];
  recommendations: Outfit[];
  favoriteOutfits: Outfit[];
  favoriteIds: Set<string>;
  selectedOutfitId?: string | null;
  selectedWeather: typeof weatherConditions[number] | null;
  selectedMood: typeof moods[number] | null;
  onSelectOutfit: (outfit: Outfit) => void;
  onWeatherChange: (weather: typeof weatherConditions[number]) => void;
  onMoodChange: (mood: typeof moods[number]) => void;
  onTryOn: (outfit: Outfit) => void;
  onToggleFavorite: (outfitId: string, isFavorite: boolean) => void;
  isLoadingOutfits?: boolean;
  isLoadingRecommendations?: boolean;
}

export function MobileDrawer({
  outfits,
  recommendations,
  favoriteOutfits,
  favoriteIds,
  selectedOutfitId,
  selectedWeather,
  selectedMood,
  onSelectOutfit,
  onWeatherChange,
  onMoodChange,
  onTryOn,
  onToggleFavorite,
  isLoadingOutfits,
  isLoadingRecommendations,
}: MobileDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-card border-t transition-all duration-300 ease-out lg:hidden ${
        isExpanded ? 'h-[70vh]' : 'h-20'
      }`}
      data-testid="drawer-mobile"
    >
      {/* Drag Handle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 flex flex-col items-center gap-1 hover-elevate active-elevate-2"
        data-testid="button-drawer-toggle"
      >
        <div className="w-12 h-1 bg-border rounded-full" />
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Drawer Content */}
      <div className="h-[calc(100%-56px)] overflow-hidden">
        <Tabs defaultValue="outfits" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-3 mx-4 mb-2" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="outfits" className="gap-2" data-testid="tab-outfits">
              <Shirt className="w-4 h-4" />
              Outfits
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2" data-testid="tab-favorites">
              <Heart className="w-4 h-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2" data-testid="tab-recommendations">
              <Sparkles className="w-4 h-4" />
              For You
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outfits" className="flex-1 overflow-hidden m-0">
            <OutfitGallery
              outfits={outfits}
              selectedOutfitId={selectedOutfitId}
              favoriteIds={favoriteIds}
              onSelectOutfit={onSelectOutfit}
              onToggleFavorite={onToggleFavorite}
              isLoading={isLoadingOutfits}
            />
          </TabsContent>

          <TabsContent value="favorites" className="flex-1 overflow-hidden m-0">
            <OutfitGallery
              outfits={favoriteOutfits}
              selectedOutfitId={selectedOutfitId}
              favoriteIds={favoriteIds}
              onSelectOutfit={onSelectOutfit}
              onToggleFavorite={onToggleFavorite}
              showFavoritesOnly
            />
          </TabsContent>

          <TabsContent value="recommendations" className="flex-1 overflow-hidden m-0 p-4">
            <div className="space-y-6">
              <WeatherMoodSelector
                selectedWeather={selectedWeather}
                selectedMood={selectedMood}
                onWeatherChange={onWeatherChange}
                onMoodChange={onMoodChange}
              />
              
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                  Recommendations
                </h3>
                <RecommendationPanel
                  recommendations={recommendations}
                  onTryOn={onTryOn}
                  isLoading={isLoadingRecommendations}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
