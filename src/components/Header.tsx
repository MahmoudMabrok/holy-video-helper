
import { Settings, BarChart, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
      <h1 className="text-2xl font-semibold" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Khelwatk</h1>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/recent')}
          title="Recent Videos"
        >
          <History className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/usage')}
          title="Usage Metrics"
        >
          <Clock className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/statistics')}
          title="Statistics"
        >
          <BarChart className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
