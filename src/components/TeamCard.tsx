import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";

interface TeamCardProps {
  name: string;
  purse: number;
  playerCount: number;
  color: string;
  onClick?: () => void;
}

const TeamCard = ({ name, purse, playerCount, color, onClick }: TeamCardProps) => {
  return (
    <Card 
      className="relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
      onClick={onClick}
    >
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: color }}
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <Badge 
            variant="outline" 
            className="border-muted text-muted-foreground"
          >
            <Users className="w-3 h-3 mr-1" />
            {playerCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent" />
          <div>
            <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {purse.toLocaleString()} Points
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamCard;
