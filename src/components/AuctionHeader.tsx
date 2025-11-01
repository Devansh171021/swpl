import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";

interface AuctionHeaderProps {
  round: number;
  totalPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
}

const AuctionHeader = ({ round, totalPlayers, soldPlayers, unsoldPlayers }: AuctionHeaderProps) => {
  return (
    <div className="bg-gradient-card border border-border rounded-xl p-8 shadow-card">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SWPL 5.0 Auction
            </h1>
            <p className="text-muted-foreground">Live Bidding in Progress</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <Badge className="bg-primary/20 text-primary border-primary/50 text-lg px-4 py-2">
              Round {round}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">{soldPlayers}/{totalPlayers}</p>
              <p className="text-muted-foreground">Sold</p>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-destructive">{unsoldPlayers}</p>
            <p className="text-muted-foreground">Unsold</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionHeader;
