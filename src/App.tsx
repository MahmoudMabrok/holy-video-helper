
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import PlaylistDetails from "./pages/PlaylistDetails";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import RecentVideos from "./pages/RecentVideos";
import Usage from "./pages/Usage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./hooks/use-theme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/recent" element={<RecentVideos />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
