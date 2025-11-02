import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import type { Outfit } from "@shared/schema";

interface RecommendationPanelProps {
  recommendations: Outfit[];
  onTryOn: (outfit: Outfit) => void;
  isLoading?: boolean;
}

export function RecommendationPanel({ recommendations, onTryOn, isLoading }: RecommendationPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select weather and mood to get recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {recommendations.map((outfit) => (
          <Card
            key={outfit.id}
            className="p-4 hover-elevate transition-all"
            data-testid={`card-recommendation-${outfit.id}`}
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={outfit.imageUrl}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold truncate">{outfit.name}</h4>
                  <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
                    {outfit.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {outfit.description}
                </p>
                
                <Button
                  size="sm"
                  onClick={() => onTryOn(outfit)}
                  className="w-full"
                  data-testid={`button-tryon-${outfit.id}`}
                >
                  Try On
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
