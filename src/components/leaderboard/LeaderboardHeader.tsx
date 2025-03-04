
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LeaderboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function LeaderboardHeader({ onRefresh, isRefreshing }: LeaderboardHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="group"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Usage Leaderboard</h1>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Sync My Time
      </Button>
    </div>
  );
}
