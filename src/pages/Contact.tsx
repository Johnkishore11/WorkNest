import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [receiverName, setReceiverName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);

      // Load receiver's name
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", receiverId)
        .single();

      if (data) {
        setReceiverName(data.full_name);
      }
    };

    loadData();
  }, [receiverId, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserId) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    // Get freelancer profile ID if contacting a freelancer
    const { data: freelancerData } = await supabase
      .from("freelancer_profiles")
      .select("id")
      .eq("user_id", receiverId)
      .single();

    const { error } = await supabase.from("messages").insert([{
      sender_id: currentUserId,
      receiver_id: receiverId as string,
      freelancer_profile_id: freelancerData?.id,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }]);

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent successfully!");
      navigate(-1);
    }

    setIsLoading(false);
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