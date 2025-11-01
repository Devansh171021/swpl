import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";

interface TeamCardProps {
  name: string;
  purse: number;
  playerCount: number;
  color: string;
  captain?: string;
  mentor?: string;
  onClick?: () => void;
}

const TeamCard = ({ name, purse, playerCount, color, captain, mentor, onClick }: TeamCardProps) => {
  return (
    <Card 
      className="relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
      onClick={onClick}
    >
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: color }}
      />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <Badge 
            variant="outline" 
            className="border-muted text-muted-foreground text-xs"
          >
            <Users className="w-3 h-3 mr-1" />
            {playerCount}
          </Badge>
        </div>
        
        {(captain || mentor) && (
          <div className="space-y-1 text-xs">
            {captain && (
              <div className="truncate">
                <span className="text-muted-foreground">C: </span>
                <span className="font-semibold text-foreground">{captain}</span>
              </div>
            )}
            {mentor && (
              <div className="truncate">
                <span className="text-muted-foreground">M: </span>
                <span className="font-semibold text-foreground">{mentor}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          <div>
            <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {purse.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamCard;
