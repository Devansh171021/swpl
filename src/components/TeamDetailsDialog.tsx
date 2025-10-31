import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign, TrendingUp } from "lucide-react";

interface Player {
  name: string;
  category: string;
  soldPrice: number;
  imageUrl?: string;
}

interface TeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  teamColor: string;
  players: Player[];
  totalSpent: number;
  remainingPurse: number;
}

const TeamDetailsDialog = ({
  open,
  onOpenChange,
  teamName,
  teamColor,
  players,
  totalSpent,
  remainingPurse,
}: TeamDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-2 h-12 rounded-full"
                style={{ backgroundColor: teamColor }}
              />
              <div className="flex-1">
                <DialogTitle className="text-2xl text-foreground">{teamName}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Squad Overview</p>
              </div>
              <Badge variant="outline" className="border-muted text-muted-foreground">
                <User className="w-3 h-3 mr-1" />
                {players.length} Players
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  ₹{(totalSpent / 10000000).toFixed(2)}Cr
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Remaining Purse</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ₹{(remainingPurse / 10000000).toFixed(2)}Cr
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {players.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No players bought yet</p>
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-card rounded-lg border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const sibling = e.currentTarget.nextElementSibling;
                        if (sibling) sibling.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <User className={`w-7 h-7 text-muted-foreground ${player.imageUrl ? "hidden" : ""}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate">{player.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{player.category}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-accent">
                    ₹{(player.soldPrice / 10000000).toFixed(2)}Cr
                  </p>
                  <p className="text-xs text-muted-foreground">Sold Price</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailsDialog;
