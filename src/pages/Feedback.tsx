
import { Header } from "@/components/Header";
import { FeedbackForm } from "@/components/FeedbackForm";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-center mb-8">Your Feedback Matters</h1>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We're constantly working to improve our app. Your feedback helps us understand what works and what needs improvement.
            </p>
            <FeedbackForm />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
