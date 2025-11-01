import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";
import PlayerCard from "@/components/PlayerCard";
import BiddingPanel from "@/components/BiddingPanel";
import AuctionHeader from "@/components/AuctionHeader";
import TeamDetailsDialog from "@/components/TeamDetailsDialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, User, Download, Trash2 } from "lucide-react";

/*
  Changes:
  - Added normalizeImageUrl to convert Drive/Dropbox preview/share links to direct image URLs.
  - Use normalizeImageUrl when mapping sheet rows.
  - Improved <img> onError to replace src with a placeholder instead of hiding the element.
  - Added referrerPolicy and crossOrigin attributes to image to reduce referrer issues.
*/

const SHEET_ID = "17WNEvsGoeEN04bzFb92Anc3mygKXH9Wtnwi8STZONak";
const SHEET_GID = "0";

// Local storage key for saving auction data
const STORAGE_KEY = "auction_data";

const INITIAL_TEAMS = [
  { name: "Dark Knights", purse: 50000, playerCount: 0, color: "#1a1a1a", captain: "Shourya Shikhar Singh", mentor: "Shib Pattnayak" },
  { name: "Giant Slayers", purse: 50000, playerCount: 0, color: "#FF6B35", captain: "SIDDHARTHA GHOSH", mentor: "SAMARESH GAYAN" },
  { name: "Desi Boyz", purse: 50000, playerCount: 0, color: "#FFD60A", captain: "AMIT SAHA", mentor: "Biswajit Swain" },
  { name: "Warriors", purse: 50000, playerCount: 0, color: "#004E89", captain: "Argha Chatterjee", mentor: "Santanu Ghosh" },
  { name: "Mighty Bulls", purse: 50000, playerCount: 0, color: "#FF0054", captain: "Hrishikesh Mukherjee", mentor: "Pankaj kumar" },
  { name: "Ninja X", purse: 50000, playerCount: 0, color: "#7209B7", captain: "Surya", mentor: "Gaurav Singh" },
  { name: "Red Dragons", purse: 50000, playerCount: 0, color: "#DC2626", captain: "Krishnendu Hazra", mentor: "souvik roy" },
  { name: "Thunderwolves", purse: 50000, playerCount: 0, color: "#3B82F6", captain: "Abir Roy", mentor: "Amit Mishra" },
];

const roleOrder = ["wicketkeeper", "batsman", "allrounder", "bowler"];

// Normalize role to standard format for sorting
const normalizeRole = (role?: string): string => {
  if (!role) return "";
  const r = role.toString().toLowerCase().trim();
  
  // Handle various role formats
  if (r.includes("wicket") || r.includes("wk") || r === "w") return "wicketkeeper";
  if (r.includes("bat") || r === "b") return "batsman";
  if (r.includes("all") || r.includes("round") || r === "ar") return "allrounder";
  if (r.includes("bowl") || r === "bw") return "bowler";
  
  return r;
};

// Convert common share/preview links to direct image/raw URLs
const normalizeImageUrl = (url?: string) => {
  if (!url) return "";
  const u = url.trim();

  try {
    // Google Drive file preview: /file/d/FILE_ID/view
    let m = u.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/);
    if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;

    // Google Drive sharing links with view?usp=sharing
    m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1] && u.includes("drive.google.com")) {
      return `https://drive.google.com/uc?export=view&id=${m[1]}`;
    }

    // Google Drive alternative: open?id=FILE_ID or ?id=FILE_ID
    m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;

    // Dropbox share links: ?dl=0 or ?dl=1 => raw
    if (u.includes("dropbox.com")) {
      return u.replace("?dl=0", "?raw=1").replace("?dl=1", "?raw=1");
    }

    // Google Photos: remove size parameter and use direct link
    if (u.includes("googleusercontent.com") || u.includes("ggpht.com")) {
      return u.split("=")[0] + "=s800"; // Set consistent size
    }

    // Return as-is if already a direct image URL
    return u;
  } catch (err) {
    return url;
  }
};

// Sanitize player name to match local image file names
const sanitizeFileName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Build image candidates - LOCAL FILES ONLY
const buildImageCandidates = (playerName: string, rawUrl?: string): string[] => {
  const candidates: string[] = [];
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  // FIRST: Try common filename patterns (most likely formats)
  // Try underscore format first (very common: "First_Last.jpg")
  extensions.forEach(ext => {
    candidates.push(`/images/players/${playerName.replace(/\s+/g, '_')}.${ext}`);
    candidates.push(`/images/players/${playerName.toLowerCase().replace(/\s+/g, '_')}.${ext}`);
  });
  
  // Try hyphen format
  extensions.forEach(ext => {
    candidates.push(`/images/players/${playerName.replace(/\s+/g, '-')}.${ext}`);
    candidates.push(`/images/players/${playerName.toLowerCase().replace(/\s+/g, '-')}.${ext}`);
  });
  
  // Try exact name as-is (with spaces)
  extensions.forEach(ext => {
    candidates.push(`/images/players/${playerName}.${ext}`);
    candidates.push(`/images/players/${playerName.toLowerCase()}.${ext}`);
  });
  
  // Try no spaces
  extensions.forEach(ext => {
    candidates.push(`/images/players/${playerName.replace(/\s+/g, '')}.${ext}`);
    candidates.push(`/images/players/${playerName.toLowerCase().replace(/\s+/g, '')}.${ext}`);
  });
  
  // Try sanitized name
  const sanitized = sanitizeFileName(playerName);
  extensions.forEach(ext => {
    const sanitizedPath = `/images/players/${sanitized}.${ext}`;
    if (!candidates.includes(sanitizedPath)) {
      candidates.push(sanitizedPath);
    }
  });

  // ONLY LOCAL FILES - No remote URLs
  return candidates;
};

const Index = () => {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [soldPlayers, setSoldPlayers] = useState<any[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<any[]>([]);
  const [round, setRound] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  const currentPlayer = players[currentPlayerIndex] || null;

  // Update image source when player changes
  useEffect(() => {
    if (currentPlayer) {
      const candidates = buildImageCandidates(currentPlayer.name, currentPlayer.imageUrl);
      setCurrentImageSrc(candidates[0] || "");
      setImageError(false);
      // Log for debugging
      console.log("Player:", currentPlayer.name);
      console.log("Trying image candidates:", candidates.slice(0, 10));
      console.log("First candidate will be:", candidates[0]);
    }
  }, [currentPlayer?.name, currentPlayer?.imageUrl]);

  useEffect(() => {
    const fetchPlayersFromSheet = async () => {
      try {
        const endpoint = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;
        const res = await fetch(endpoint);
        const text = await res.text();
        const jsonStrMatch = text.match(/\(([\s\S]*)\);?$/);
        const json = jsonStrMatch ? JSON.parse(jsonStrMatch[1]) : null;
        if (!json?.table) {
          console.warn("Sheet JSON did not include table. Check that the sheet is public/readable.");
          return;
        }

        const cols = json.table.cols.map((c: any) => (c.label || c.id || "").toString().trim());
        const rows = json.table.rows || [];

        const mapped = rows.map((r: any, idx: number) => {
          const obj: any = {};
          (r.c || []).forEach((cell: any, i: number) => {
            const header = cols[i] || `col${i}`;
            obj[header] = cell ? cell.v : "";
          });

          const name =
            obj["Name"] || obj["Player"] || obj["player_name"] || obj["Full Name"] || obj[cols[0]] || `Player ${idx + 1}`;
          const role =
            obj["Role"] || obj["Position"] || obj["role"] || obj[cols.find((h: string) => /role|position/i.test(h))] || "";
          const basePriceRaw =
            obj["BasePrice"] || obj["Base Price"] || obj["Price"] || obj["base_price"] || obj["basePrice"] || 0;
          const imageUrlRaw =
            obj["Image"] || obj["ImageUrl"] || obj["Photo"] || obj["image"] || obj["image_url"] || "";

          const basePrice = Number(basePriceRaw) || 500; // Default to 500 points if not specified

          return {
            id: `sheet-${idx}`,
            name,
            role,
            basePrice,
            imageUrl: normalizeImageUrl(imageUrlRaw?.toString() || ""),
            original: obj,
            rowIndex: idx + 2, // +2 because: +1 for header row, +1 for 0-based to 1-based
            originalRowIndex: idx, // Keep track of original position
          };
        });

        // Get all captain and mentor names (case-insensitive matching)
        const captainAndMentorNames = INITIAL_TEAMS.flatMap(team => [
          team.captain?.toLowerCase().trim(),
          team.mentor?.toLowerCase().trim()
        ]).filter(Boolean);

        // Filter out players who are captains or mentors
        const filtered = mapped.filter((p: any) => {
          const playerNameLower = (p.name || "").toLowerCase().trim();
          return !captainAndMentorNames.some(name => name === playerNameLower);
        });

        const normalized = filtered.map((p: any) => ({
          ...p,
          roleNormalized: normalizeRole(p.role),
        }));

        normalized.sort((a: any, b: any) => {
          const ia = roleOrder.indexOf(a.roleNormalized);
          const ib = roleOrder.indexOf(b.roleNormalized);
          const va = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
          const vb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
          // If same role, maintain original order
          if (va === vb) return 0;
          return va - vb;
        });

        console.log(`Filtered out ${mapped.length - filtered.length} captain/mentor players from auction`);
        setPlayers(normalized);
        setCurrentPlayerIndex(0);
      } catch (err) {
        console.error("Failed to load players from sheet", err);
      }
    };

    fetchPlayersFromSheet();
  }, []);

  // Function to save data to local storage
  const saveToLocalStorage = (player: any, status: "sold" | "unsold", teamName?: string, amount?: number) => {
    try {
      const transaction = {
        id: `${Date.now()}-${Math.random()}`,
        playerName: player.name,
        playerRole: player.role,
        basePrice: player.basePrice,
        status: status,
        team: teamName || "",
        amount: amount || 0,
        round: round,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
      };

      // Get existing data
      const existingData = localStorage.getItem(STORAGE_KEY);
      const transactions = existingData ? JSON.parse(existingData) : [];
      
      // Add new transaction
      transactions.push(transaction);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      
      console.log("✅ Saved to local storage:", transaction);
    } catch (error) {
      console.error("Failed to save to local storage:", error);
      // Don't throw - allow auction to continue even if save fails
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        alert("No data to export!");
        return;
      }

      const transactions = JSON.parse(data);
      
      // CSV headers
      const headers = ["Date", "Player Name", "Role", "Base Price (Points)", "Status", "Team", "Amount (Points)", "Round"];
      const csvRows = [headers.join(",")];
      
      // Add transaction rows
      transactions.forEach((t: any) => {
        const row = [
          `"${t.date}"`,
          `"${t.playerName}"`,
          `"${t.playerRole}"`,
          t.basePrice,
          `"${t.status}"`,
          `"${t.team}"`,
          t.amount,
          t.round,
        ];
        csvRows.push(row.join(","));
      });
      
      // Create download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auction-data-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Failed to export data!");
    }
  };

  // Function to clear all saved data
  const clearLocalStorage = () => {
    if (confirm("Are you sure you want to clear all saved auction data? This cannot be undone!")) {
      localStorage.removeItem(STORAGE_KEY);
      alert("All saved data has been cleared!");
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const transactions = JSON.parse(data);
      console.log(`📊 Loaded ${transactions.length} saved transactions from local storage`);
    }
  }, []);

  const handleSold = async (teamName: string, amount: number) => {
    const updatedTeams = teams.map((team) =>
      team.name === teamName ? { ...team, purse: team.purse - amount, playerCount: team.playerCount + 1 } : team
    );
    setTeams(updatedTeams);

    if (currentPlayer) {
      const soldPlayer = { ...currentPlayer, team: teamName, soldPrice: amount };
      setSoldPlayers([...soldPlayers, soldPlayer]);
      
      // Save to local storage
      saveToLocalStorage(currentPlayer, "sold", teamName, amount);
    }

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleUnsold = async () => {
    if (currentPlayer) {
      setUnsoldPlayers([...unsoldPlayers, currentPlayer]);
      
      // Save to local storage
      saveToLocalStorage(currentPlayer, "unsold");
    }

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleRoundComplete = () => {
    if (round === 1 && unsoldPlayers.length > 0) {
      setPlayers(unsoldPlayers);
      setUnsoldPlayers([]);
      setCurrentPlayerIndex(0);
      setRound(2);
    } else if (round === 2 && unsoldPlayers.length > 0) {
      setRound(3);
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

  const openTeamDialog = () => setIsTeamDialogOpen(true);
  const closeTeamDialog = () => setIsTeamDialogOpen(false);

  const getTeamPlayers = (teamName: string) => {
    return soldPlayers.filter((p) => p.team === teamName);
  };

  const getTeamTotalSpent = (teamName: string) => {
    const t = getTeamPlayers(teamName);
    return t.reduce((s, p) => s + (p.soldPrice || 0), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-6 space-y-6">
        <AuctionHeader round={round} totalPlayers={players.length} soldPlayers={soldPlayers.length} unsoldPlayers={unsoldPlayers.length} />
        
        {/* Data Management Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="border-border hover:border-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={clearLocalStorage}
            className="border-destructive/50 hover:border-destructive text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Single Clean Player Card */}
          <div className="flex flex-col gap-6">
            {currentPlayer && (
              <div className="bg-gradient-card border border-border/50 rounded-xl p-8 shadow-card">
                {/* Photo */}
                <div className="w-full aspect-[3/4] rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden mb-6 border-2 border-border/50">
                  {!imageError && currentImageSrc ? (
                    <img
                      key={currentPlayer.name} // Force re-render on player change
                      src={currentImageSrc}
                      alt={currentPlayer.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        const candidates = buildImageCandidates(currentPlayer.name, currentPlayer.imageUrl);
                        const currentIndex = candidates.indexOf(currentImageSrc);
                        const nextIndex = currentIndex + 1;
                        
                        if (nextIndex < candidates.length) {
                          // Try next candidate
                          console.log(`❌ Image failed: ${currentImageSrc}`);
                          console.log(`➡️ Trying next candidate (${nextIndex + 1}/${candidates.length}): ${candidates[nextIndex]}`);
                          setCurrentImageSrc(candidates[nextIndex]);
                        } else {
                          // All candidates failed
                          console.log("❌ All image candidates failed, showing placeholder");
                          console.log("Tried all candidates:", candidates);
                          setImageError(true);
                        }
                      }}
                      onLoad={() => {
                        console.log(`✅ Successfully loaded image: ${currentImageSrc}`);
                        setImageError(false);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <User className="w-24 h-24 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center px-4">
                        No image found
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Name + Category */}
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {currentPlayer.name}
                  </h2>
                  {currentPlayer.role ? (
                    <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                      <span className="text-sm font-semibold capitalize">{normalizeRole(currentPlayer.role)}</span>
                    </div>
                  ) : null}
                </div>
                
                {/* Base Price */}
                <div className="text-center pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Base Price</p>
                  <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {(currentPlayer.basePrice || 500).toLocaleString()} Points
                  </p>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevious} 
                disabled={currentPlayerIndex === 0} 
                className="border-border hover:border-primary h-12 w-12"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPlayerIndex + 1} / {players.length}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNext} 
                disabled={currentPlayerIndex === players.length - 1} 
                className="border-border hover:border-primary h-12 w-12"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Middle - Bidding Panel */}
          <div className="space-y-6">
            <BiddingPanel currentPlayer={currentPlayer} teams={teams} onSold={handleSold} onUnsold={handleUnsold} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => (
              <div key={team.name} onClick={() => { setSelectedTeam(team.name); openTeamDialog(); }}>
                <TeamCard 
                  name={team.name} 
                  purse={team.purse} 
                  playerCount={team.playerCount} 
                  color={team.color}
                  captain={team.captain}
                  mentor={team.mentor}
                  onClick={() => { setSelectedTeam(team.name); openTeamDialog(); }} 
                />
              </div>
            ))}
          </div>
        </div>

        <TeamDetailsDialog
          open={isTeamDialogOpen}
          onOpenChange={setIsTeamDialogOpen}
          teamName={selectedTeam || ""}
          teamColor={teams.find((t) => t.name === selectedTeam)?.color || "#999999"}
          players={selectedTeam ? getTeamPlayers(selectedTeam).map((p: any) => ({ ...p, category: p.role })) : []}
          totalSpent={selectedTeam ? getTeamTotalSpent(selectedTeam) : 0}
          remainingPurse={teams.find((t) => t.name === selectedTeam)?.purse || 0}
        />
      </div>
    </div>
  );
};

export default Index;
