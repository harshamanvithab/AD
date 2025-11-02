import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Outfit } from "@shared/schema";

interface OutfitGalleryProps {
  outfits: Outfit[];
  selectedOutfitId?: string | null;
  favoriteIds?: Set<string>;
  onSelectOutfit: (outfit: Outfit) => void;
  onToggleFavorite?: (outfitId: string, isFavorite: boolean) => void;
  isLoading?: boolean;
  showFavoritesOnly?: boolean;
}

export function OutfitGallery({ 
  outfits, 
  selectedOutfitId, 
  favoriteIds = new Set(),
  onSelectOutfit, 
  onToggleFavorite,
  isLoading,
  showFavoritesOnly = false
}: OutfitGalleryProps) {
  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Browse Outfits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {showFavoritesOnly ? "No favorite outfits yet" : "No outfits available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {showFavoritesOnly ? "Favorite Outfits" : "Browse Outfits"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {outfits.map((outfit) => {
            const isFavorited = favoriteIds.has(outfit.id);
            
            return (
              <Card
                key={outfit.id}
                className={`relative group cursor-pointer transition-all overflow-hidden hover-elevate active-elevate-2 ${
                  selectedOutfitId === outfit.id
                    ? 'ring-4 ring-primary ring-offset-2'
                    : ''
                }`}
                onClick={() => onSelectOutfit(outfit)}
                data-testid={`card-outfit-${outfit.id}`}
              >
                <div className="aspect-square relative">
                  {outfit.imageUrl ? (
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <div className="text-4xl mb-2">👕</div>
                        <div className="text-xs font-medium">3D Model</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <Badge
                    className="absolute top-2 left-2 text-xs rounded-full capitalize"
                    variant="secondary"
                  >
                    {outfit.category}
                  </Badge>

                  {/* Favorite Button */}
                  {onToggleFavorite && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm ${
                        isFavorited ? 'text-red-500' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(outfit.id, isFavorited);
                      }}
                      data-testid={`button-favorite-${outfit.id}`}
                      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  )}

                  {/* Label Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3">
                    <p className="text-sm font-medium truncate">{outfit.name}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
