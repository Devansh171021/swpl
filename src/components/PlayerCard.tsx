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
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-6 h-6 text-muted-foreground ${imageUrl ? 'hidden' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground truncate">{name}</h4>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
          </div>
          {status !== "pending" && (
            <Badge className={getStatusColor()}>
              {status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Base Price</span>
          <span className="font-bold text-accent">₹{(basePrice / 10000000).toFixed(2)}Cr</span>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;
