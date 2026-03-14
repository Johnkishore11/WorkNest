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
import { ArrowLeft, Send, Loader2 } from "lucide-react";

export default function Contact() {
  const { userId: receiverId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [receiverName, setReceiverName] = useState("");
  const [receiverImage, setReceiverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/auth");
    }

    if (receiverId) {
      loadData();
    }
  }, [receiverId, authLoading, currentUser, navigate]);

  const loadData = async () => {
    try {
      const { data } = await api.get(`/users/${receiverId}`);
      if (data) {
        setReceiverName(data.full_name);
        setReceiverImage(data.profile_image);
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
        receiver_id: receiverId, // Fixed parameter name
        message: message,
        subject: subject
      });

      toast.success("Professional inquiry sent successfully!");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 hover:bg-primary/10 transition-colors rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Profile
        </Button>

        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
          <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
            <div className="absolute -bottom-10 left-8">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                  <div className="h-full w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {receiverImage ? (
                      <img src={receiverImage} alt={receiverName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary/30">{receiverName?.charAt(0)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardHeader className="pt-16 pb-8 px-8">
            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              Send Inquiry to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{receiverName || "Freelancer"}</span>
            </CardTitle>
            <CardDescription className="text-base font-medium italic">
              Introduce your project and start a professional collaboration.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Inquiry Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g. Frontend Development for Fintech Platform"
                  required
                  className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Collaboration Details</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Briefly describe your requirements, timeline, and expectations..."
                  rows={8}
                  required
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner p-4 text-sm font-medium resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    COMMITTING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    SEND PROFESSIONAL INQUIRY
                    <Send className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-[0.2em] font-black opacity-50">
          Powered by WorkNest Professional Messaging Hub
        </p>
      </div>
    </div>
  );
}