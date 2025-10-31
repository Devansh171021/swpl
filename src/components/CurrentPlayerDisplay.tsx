import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface CurrentPlayerDisplayProps {
  imageUrl?: string;
  name?: string;
}

const CurrentPlayerDisplay = ({ imageUrl, name }: CurrentPlayerDisplayProps) => {
  return (
    <Card className="bg-gradient-card border-border/50 p-4 flex items-center justify-center h-full min-h-[420px]">
      <div className="w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden bg-muted border-4 border-primary/30 shadow-glow flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || "Current player"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (sibling) sibling.classList.remove("hidden");
            }}
          />
        ) : null}
        <User className={`w-24 h-24 text-muted-foreground ${imageUrl ? "hidden" : ""}`} />
      </div>
    </Card>
  );
};

export default CurrentPlayerDisplay;


