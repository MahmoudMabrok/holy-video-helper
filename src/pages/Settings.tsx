
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsForm {
  dataUrl: string;
}

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<SettingsForm>({
    defaultValues: {
      dataUrl: localStorage.getItem('data_url') || 'https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/ramadan.json'
    }
  });

  const onSubmit = (data: SettingsForm) => {
    try {
      localStorage.setItem('data_url', data.dataUrl);
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
              Configure the URL where your content data is stored.
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
                      <FormLabel>Data URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter data URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL of your JSON data source.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Button type="submit">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
