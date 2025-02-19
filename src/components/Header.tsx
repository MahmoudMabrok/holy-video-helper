
import { Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
      <h1 className="text-2xl font-semibold">Video Library</h1>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/statistics')}
        >
          <BarChart className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
