import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Outfit } from "@shared/schema";

interface OutfitGalleryProps {
  outfits: Outfit[];
  selectedOutfitId?: string | null;
  onSelectOutfit: (outfit: Outfit) => void;
  isLoading?: boolean;
}

export function OutfitGallery({ outfits, selectedOutfitId, onSelectOutfit, isLoading }: OutfitGalleryProps) {
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
          <p className="text-muted-foreground">No outfits available</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Browse Outfits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {outfits.map((outfit) => (
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
                <img
                  src={outfit.imageUrl}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Category Badge */}
                <Badge
                  className="absolute top-2 left-2 text-xs rounded-full capitalize"
                  variant="secondary"
                >
                  {outfit.category}
                </Badge>

                {/* Label Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3">
                  <p className="text-sm font-medium truncate">{outfit.name}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
