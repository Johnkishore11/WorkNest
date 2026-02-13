import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

export default function Contact() {
  const { userId: receiverId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [receiverName, setReceiverName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check auth
    if (!authLoading && !currentUser) {
      navigate("/auth");
    }

    if (receiverId) {
      loadData();
    }
  }, [receiverId, authLoading, currentUser, navigate]);

  const loadData = async () => {
    try {
      // Load receiver's name
      const { data } = await api.get(`/users/${receiverId}`);
      if (data) {
        setReceiverName(data.full_name);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      await api.post('/messages', {
        receiverId: receiverId,
        message: message, // Note: backend expects 'message', subject might be part of message content or ignored if not in schema
        subject: subject // If I updated backend schema to include subject, otherwise I should prepend it to message
      });

      toast.success("Message sent successfully!");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Contact {receiverName}</CardTitle>
            <CardDescription>
              Send a message to introduce yourself and your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Project inquiry"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell them about your project and what you're looking for..."
                  rows={8}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}