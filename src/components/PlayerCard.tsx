
// src/components/PlayerCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface PlayerCardProps {
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  status?: "sold" | "unsold" | "pending";
}

const PlayerCard = ({ name, category, basePrice, imageUrl, status = "pending" }: PlayerCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "sold":
        return "bg-success/20 text-success border-success/50";
      case "unsold":
        return "bg-destructive/20 text-destructive border-destructive/50";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/50";
    }
  };

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
      <div className="p-6 flex items-center gap-6">
        {/* BIG IMAGE on the left */}
        <div className="w-40 h-40 rounded-md bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <User className={`w-10 h-10 text-muted-foreground ${imageUrl ? "hidden" : ""}`} />
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate">{name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{category}</p>

          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
            <span className="text-sm text-muted-foreground">Base Price</span>
            <span className="font-bold text-accent">₹{(basePrice / 10000000).toFixed(2)}Cr</span>
          </div>
        </div>

        {status !== "pending" && (
          <Badge className={getStatusColor()}>
            {status}
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default PlayerCard;
