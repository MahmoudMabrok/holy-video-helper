
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const feedbackSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd send this data to your server
      console.log("Feedback submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thank you for your feedback!");
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendViaWhatsApp = () => {
    const message = `Name: ${form.getValues("name")}\nEmail: ${form.getValues("email")}\nMessage: ${form.getValues("message")}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "1234567890"; // Replace with your actual WhatsApp number
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  const sendViaEmail = () => {
    const subject = "Feedback from Khelwatk App";
    const body = `Name: ${form.getValues("name")}\nEmail: ${form.getValues("email")}\nMessage: ${form.getValues("message")}`;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const email = "your-email@example.com"; // Replace with your actual email
    window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, "_blank");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send us Feedback</CardTitle>
        <CardDescription>Share your thoughts or report issues with us.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your-email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us what you think..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your feedback helps us improve our service.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" onClick={sendViaWhatsApp}>
                WhatsApp
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" onClick={sendViaEmail}>
                Email
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>We read every message</p>
        <p>We usually respond within 24 hours</p>
      </CardFooter>
    </Card>
  );
}
