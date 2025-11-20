import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
  sender: {
    full_name: string;
  };
  receiver: {
    full_name: string;
  };
}

export default function Messages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadMessages();
  }, []);

  const checkAuthAndLoadMessages = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(session.user.id);
    await loadMessages(session.user.id);
  };

  const loadMessages = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name),
        receiver:profiles!messages_receiver_id_fkey(full_name)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    if (!currentUserId) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId)
      .eq("receiver_id", currentUserId);

    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.receiver_id === currentUserId) {
      markAsRead(message.id);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !currentUserId || !replyText.trim()) return;

    setIsSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedMessage.sender_id === currentUserId 
        ? selectedMessage.receiver_id 
        : selectedMessage.sender_id,
      subject: `Re: ${selectedMessage.subject}`,
      message: replyText,
    });

    if (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      setReplyText("");
      await loadMessages(currentUserId);
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Messages
          </h1>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Messages List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Inbox ({messages.filter(m => m.receiver_id === currentUserId && !m.read).length} unread)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                <div className="divide-y">
                  {messages.map((message) => {
                    const isReceived = message.receiver_id === currentUserId;
                    const contactName = isReceived 
                      ? message.sender.full_name 
                      : message.receiver.full_name;

                    return (
                      <div
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-muted" : ""
                        } ${!message.read && isReceived ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {contactName}
                            </span>
                            {!message.read && isReceived && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-medium text-sm mb-1 line-clamp-1">
                          {message.subject}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {message.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {selectedMessage.sender_id === currentUserId ? "To: " : "From: "}
                          </span>
                          <span>
                            {selectedMessage.sender_id === currentUserId 
                              ? selectedMessage.receiver.full_name 
                              : selectedMessage.sender.full_name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(selectedMessage.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{selectedMessage.subject}</h3>
                      <p className="text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Reply</h4>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[120px] mb-3"
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="w-full"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Select a message to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
