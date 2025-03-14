
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVideoStore } from "@/store/videoStore";
import { useUsageTimerStore } from "@/store/usageTimerStore";

interface SettingsForm {
  dataUrl: string;
  videoQuality: string;
  playbackSpeed: string;
}

const VIDEO_QUALITIES = [
  { value: "auto", label: "Auto" },
  { value: "hd1080", label: "1080p" },
  { value: "hd720", label: "720p" },
  { value: "large", label: "480p" },
  { value: "medium", label: "360p" },
  { value: "small", label: "240p" },
  { value: "tiny", label: "144p" },
];

const PLAYBACK_SPEEDS = [
  { value: "0.25", label: "0.25x" },
  { value: "0.5", label: "0.5x" },
  { value: "0.75", label: "0.75x" },
  { value: "1", label: "Normal (1x)" },
  { value: "1.25", label: "1.25x" },
  { value: "1.5", label: "1.5x" },
  { value: "1.75", label: "1.75x" },
  { value: "2", label: "2x" },
];

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<SettingsForm>({
    defaultValues: {
      dataUrl: localStorage.getItem('data_url') || 'https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/',
      videoQuality: localStorage.getItem('video_quality') || 'auto',
      playbackSpeed: localStorage.getItem('playback_speed') || '1',
    }
  });

  const onSubmit = (data: SettingsForm) => {
    try {
      localStorage.setItem('data_url', data.dataUrl);
      localStorage.setItem('video_quality', data.videoQuality);
      localStorage.setItem('playback_speed', data.playbackSpeed);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This will delete all saved video progress and reset all settings.")) {
      try {
        // Clear video progress data
        const videoKeysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('last_video') || key.includes('video_progress') || key.includes('daily_usage'))) {
            videoKeysToRemove.push(key);
          }
        }
        
        // Remove collected keys
        videoKeysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reset settings data
        const defaultUrl = 'https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/';
        localStorage.setItem('data_url', defaultUrl);
        localStorage.setItem('video_quality', 'auto');
        localStorage.setItem('playback_speed', '1');
        
        // Reset form values
        form.reset({
          dataUrl: defaultUrl,
          videoQuality: 'auto',
          playbackSpeed: '1'
        });
        
        // Reset video store
        useVideoStore.getState().loadSavedState();
        
        // Reset usage timer store
        useUsageTimerStore.getState().loadSavedUsage();
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        toast({
          title: "Data cleared",
          description: "All saved video progress and settings have been reset to defaults."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear data.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="group"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Source</CardTitle>
            <CardDescription>
              Configure the base URL where your content data is stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dataUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter base URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the base URL of your JSON data source. The app will load "data.json" from this URL, and playlist files as "playlists/[playlist_id].json".
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="videoQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Quality</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select video quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VIDEO_QUALITIES.map((quality) => (
                            <SelectItem key={quality.value} value={quality.value}>
                              {quality.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose your preferred video quality. Auto will adjust based on your connection.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="playbackSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Playback Speed</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select playback speed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <SelectItem key={speed.value} value={speed.value}>
                              {speed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose your preferred playback speed.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={clearAllData}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
