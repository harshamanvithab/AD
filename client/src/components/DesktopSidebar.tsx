import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shirt, Sparkles } from "lucide-react";
import { OutfitGallery } from "./OutfitGallery";
import { WeatherMoodSelector } from "./WeatherMoodSelector";
import { RecommendationPanel } from "./RecommendationPanel";
import type { Outfit, weatherConditions, moods } from "@shared/schema";

interface DesktopSidebarProps {
  outfits: Outfit[];
  recommendations: Outfit[];
  selectedOutfitId?: string | null;
  selectedWeather: typeof weatherConditions[number] | null;
  selectedMood: typeof moods[number] | null;
  onSelectOutfit: (outfit: Outfit) => void;
  onWeatherChange: (weather: typeof weatherConditions[number]) => void;
  onMoodChange: (mood: typeof moods[number]) => void;
  onTryOn: (outfit: Outfit) => void;
  isLoadingOutfits?: boolean;
  isLoadingRecommendations?: boolean;
}

export function DesktopSidebar({
  outfits,
  recommendations,
  selectedOutfitId,
  selectedWeather,
  selectedMood,
  onSelectOutfit,
  onWeatherChange,
  onMoodChange,
  onTryOn,
  isLoadingOutfits,
  isLoadingRecommendations,
}: DesktopSidebarProps) {
  return (
    <div className="hidden lg:block w-96 h-full border-l bg-card">
      <Tabs defaultValue="outfits" className="h-full flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
          <TabsTrigger value="outfits" className="gap-2" data-testid="tab-outfits-desktop">
            <Shirt className="w-4 h-4" />
            Outfits
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2" data-testid="tab-recommendations-desktop">
            <Sparkles className="w-4 h-4" />
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outfits" className="flex-1 overflow-hidden m-0">
          <OutfitGallery
            outfits={outfits}
            selectedOutfitId={selectedOutfitId}
            onSelectOutfit={onSelectOutfit}
            isLoading={isLoadingOutfits}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="flex-1 overflow-hidden m-0 p-6">
          <div className="space-y-6">
            <WeatherMoodSelector
              selectedWeather={selectedWeather}
              selectedMood={selectedMood}
              onWeatherChange={onWeatherChange}
              onMoodChange={onMoodChange}
            />
            
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                Recommended for You
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
  );
}
