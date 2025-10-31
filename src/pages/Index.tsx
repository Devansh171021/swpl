import { useEffect, useMemo, useState } from "react";
import TeamCard from "@/components/TeamCard";
import BiddingPanel from "@/components/BiddingPanel";
import AuctionHeader from "@/components/AuctionHeader";
import TeamDetailsDialog from "@/components/TeamDetailsDialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { loadPlayersFromGoogleSheet, type SheetPlayerRow } from "@/lib/sheets";
import CurrentPlayerDisplay from "@/components/CurrentPlayerDisplay";

// Mock data - replaced at runtime when Google Sheet is configured
const INITIAL_TEAMS = [
  { name: "Mumbai Mavericks", purse: 100000000, playerCount: 0, color: "#FF6B35" },
  { name: "Delhi Dragons", purse: 100000000, playerCount: 0, color: "#004E89" },
  { name: "Bangalore Blasters", purse: 100000000, playerCount: 0, color: "#F72585" },
  { name: "Chennai Champions", purse: 100000000, playerCount: 0, color: "#FFD60A" },
  { name: "Kolkata Kings", purse: 100000000, playerCount: 0, color: "#7209B7" },
  { name: "Punjab Panthers", purse: 100000000, playerCount: 0, color: "#FF0054" },
  { name: "Hyderabad Hawks", purse: 100000000, playerCount: 0, color: "#06FFA5" },
  { name: "Rajasthan Royals", purse: 100000000, playerCount: 0, color: "#FF006E" },
  { name: "Gujarat Giants", purse: 100000000, playerCount: 0, color: "#8338EC" },
  { name: "Lucknow Legends", purse: 100000000, playerCount: 0, color: "#FB5607" },
];

const MOCK_PLAYERS: Array<SheetPlayerRow> = [
  { id: "1", name: "Virat Kohli", role: "Batsman", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 20000000, imageUrl: "" },
  { id: "2", name: "Jasprit Bumrah", role: "Bowler", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 18000000, imageUrl: "" },
  { id: "3", name: "Rohit Sharma", role: "Batsman", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 19000000, imageUrl: "" },
  { id: "4", name: "KL Rahul", role: "Wicket Keeper", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 17000000, imageUrl: "" },
  { id: "5", name: "Ravindra Jadeja", role: "Allrounder", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 16000000, imageUrl: "" },
  { id: "6", name: "Mohammed Shami", role: "Bowler", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 15000000, imageUrl: "" },
  { id: "7", name: "Rishabh Pant", role: "Wicket Keeper", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 14000000, imageUrl: "" },
  { id: "8", name: "Hardik Pandya", role: "Allrounder", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 15000000, imageUrl: "" },
  { id: "9", name: "Shubman Gill", role: "Batsman", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 13000000, imageUrl: "" },
  { id: "10", name: "Yuzvendra Chahal", role: "Bowler", category: "Men (Above 14 to Everyone who wants to Play in open)", basePrice: 12000000, imageUrl: "" },
];

const ROLE_ORDER: Array<SheetPlayerRow["role"]> = [
  "Batsman",
  "Bowler",
  "Allrounder",
  "Wicket Keeper",
];

function sequenceByRole(players: SheetPlayerRow[]): SheetPlayerRow[] {
  const groups = new Map<string, SheetPlayerRow[]>();
  for (const p of players) {
    const key = p.role || "Unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const ordered: SheetPlayerRow[] = [];
  for (const role of ROLE_ORDER) {
    const g = groups.get(role);
    if (g) ordered.push(...g);
  }
  // Append any other roles not in ROLE_ORDER
  for (const [role, g] of groups.entries()) {
    if (!ROLE_ORDER.includes(role)) ordered.push(...g);
  }
  return ordered;
}

const Index = () => {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Array<SheetPlayerRow>>(sequenceByRole(MOCK_PLAYERS));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [soldPlayers, setSoldPlayers] = useState<any[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<any[]>([]);
  const [round, setRound] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const currentPlayer = players[currentPlayerIndex] || null;

  // Load players from Google Sheet if configured
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await loadPlayersFromGoogleSheet();
        if (!cancelled && fetched.length > 0) {
          setPlayers(sequenceByRole(fetched));
          setCurrentPlayerIndex(0);
        }
      } catch {
        // Ignore and keep mocks
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSold = (teamName: string, amount: number) => {
    const updatedTeams = teams.map(team => 
      team.name === teamName 
        ? { ...team, purse: team.purse - amount, playerCount: team.playerCount + 1 }
        : team
    );
    setTeams(updatedTeams);

    setSoldPlayers([...soldPlayers, { ...currentPlayer, team: teamName, soldPrice: amount }]);
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleUnsold = () => {
    if (currentPlayer) {
      setUnsoldPlayers([...unsoldPlayers, currentPlayer]);
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleRoundComplete = () => {
    if (round === 1 && unsoldPlayers.length > 0) {
      setPlayers(sequenceByRole(unsoldPlayers));
      setUnsoldPlayers([]);
      setCurrentPlayerIndex(0);
      setRound(2);
    } else if (round === 2 && unsoldPlayers.length > 0) {
      setRound(3);
      // Lottery logic would go here
    }
  };

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };

  const getTeamPlayers = (teamName: string) => {
    return soldPlayers.filter(player => player.team === teamName);
  };

  const getTeamTotalSpent = (teamName: string) => {
    const teamPlayers = getTeamPlayers(teamName);
    return teamPlayers.reduce((total, player) => total + player.soldPrice, 0);
  };

  const selectedTeamData = selectedTeam 
    ? teams.find(t => t.name === selectedTeam)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <AuctionHeader
          round={round}
          totalPlayers={players.length}
          soldPlayers={soldPlayers.length}
          unsoldPlayers={unsoldPlayers.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <CurrentPlayerDisplay imageUrl={currentPlayer?.imageUrl} name={currentPlayer?.name} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentPlayerIndex === 0}
                className="border-border hover:border-primary"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentPlayerIndex === players.length - 1}
                className="border-border hover:border-primary"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <BiddingPanel
              currentPlayer={currentPlayer}
              teams={teams}
              onSold={handleSold}
              onUnsold={handleUnsold}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Teams</h3>
            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
              {teams.map((team) => (
                <TeamCard
                  key={team.name}
                  name={team.name}
                  purse={team.purse}
                  playerCount={team.playerCount}
                  color={team.color}
                  onClick={() => setSelectedTeam(team.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {selectedTeamData && (
          <TeamDetailsDialog
            open={selectedTeam !== null}
            onOpenChange={(open) => !open && setSelectedTeam(null)}
            teamName={selectedTeamData.name}
            teamColor={selectedTeamData.color}
            players={getTeamPlayers(selectedTeamData.name)}
            totalSpent={getTeamTotalSpent(selectedTeamData.name)}
            remainingPurse={selectedTeamData.purse}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
