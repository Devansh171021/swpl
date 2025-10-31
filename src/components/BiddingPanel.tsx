import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gavel, XCircle, User } from "lucide-react";
import { toast } from "sonner";

interface BiddingPanelProps {
  currentPlayer: {
    name: string;
    category: string;
    basePrice: number;
    imageUrl?: string;
  } | null;
  teams: Array<{ name: string; purse: number }>;
  onSold: (teamName: string, amount: number) => void;
  onUnsold: () => void;
}

const BiddingPanel = ({ currentPlayer, teams, onSold, onUnsold }: BiddingPanelProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<string>("");

  const handleSold = () => {
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    const amountInRupees = parseFloat(bidAmount) * 10000000;
    const team = teams.find(t => t.name === selectedTeam);
    
    if (team && amountInRupees > team.purse) {
      toast.error("Team doesn't have enough purse!");
      return;
    }

    onSold(selectedTeam, amountInRupees);
    setSelectedTeam("");
    setBidAmount("");
    toast.success(`${currentPlayer?.name} sold to ${selectedTeam}!`);
  };

  const handleUnsold = () => {
    onUnsold();
    setSelectedTeam("");
    setBidAmount("");
    toast.info(`${currentPlayer?.name} went unsold`);
  };

  if (!currentPlayer) {
    return (
      <Card className="bg-gradient-card border-border p-8 text-center">
        <p className="text-muted-foreground">No player selected</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">{currentPlayer.name}</h2>
          <p className="text-muted-foreground">{currentPlayer.category}</p>
          <p className="text-xl font-semibold text-accent">
            Base: ₹{(currentPlayer.basePrice / 10000000).toFixed(2)} Crores
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="team">Select Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team" className="bg-input border-border">
                <SelectValue placeholder="Choose team" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {teams.map((team) => (
                  <SelectItem key={team.name} value={team.name}>
                    {team.name} - ₹{(team.purse / 10000000).toFixed(2)}Cr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Bid Amount (in Crores)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            onClick={handleSold}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Gavel className="w-4 h-4 mr-2" />
            SOLD
          </Button>
          <Button
            onClick={handleUnsold}
            variant="destructive"
            className="bg-destructive hover:bg-destructive/90"
          >
            <XCircle className="w-4 h-4 mr-2" />
            UNSOLD
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BiddingPanel;
