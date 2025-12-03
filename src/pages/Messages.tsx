import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mail, Send, ArrowLeft, User, MessageSquare, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface ConversationThread {
  contactId: string;
  contactName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function Messages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
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

  const groupMessagesByContact = (): ConversationThread[] => {
    if (!currentUserId) return [];

    const threadsMap = new Map<string, ConversationThread>();

    messages.forEach((msg) => {
      const isReceived = msg.receiver_id === currentUserId;
      const contactId = isReceived ? msg.sender_id : msg.receiver_id;
      const contactName = isReceived ? msg.sender.full_name : msg.receiver.full_name;

      if (!threadsMap.has(contactId)) {
        threadsMap.set(contactId, {
          contactId,
          contactName,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unreadCount: 0,
          messages: [],
        });
      }

      const thread = threadsMap.get(contactId)!;
      thread.messages.push(msg);
      
      if (!msg.read && isReceived) {
        thread.unreadCount++;
      }
    });

    return Array.from(threadsMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  };

  const markThreadAsRead = async (contactId: string) => {
    if (!currentUserId) return;

    const unreadMessages = messages.filter(
      msg => msg.sender_id === contactId && msg.receiver_id === currentUserId && !msg.read
    );

    for (const msg of unreadMessages) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", msg.id);
    }

    setMessages(messages.map(msg => 
      msg.sender_id === contactId && msg.receiver_id === currentUserId 
        ? { ...msg, read: true } 
        : msg
    ));
  };

  const handleSelectThread = (thread: ConversationThread) => {
    setSelectedThread(thread);
    markThreadAsRead(thread.contactId);
  };

  const handleSendReply = async () => {
    if (!selectedThread || !currentUserId || !replyText.trim()) return;

    setIsSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedThread.contactId,
      subject: `Re: ${selectedThread.messages[0]?.subject || "Conversation"}`,
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
        description: "Message sent successfully",
      });
      setReplyText("");
      await loadMessages(currentUserId);
    }
    setIsSending(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const conversationThreads = groupMessagesByContact();

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-sm text-muted-foreground">
                Stay connected with your network
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Inbox className="h-5 w-5 text-primary" />
                Conversations
                {conversationThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
                  <Badge variant="default" className="ml-auto">
                    {conversationThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-380px)]">
              {conversationThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground font-medium">No messages yet</p>
                  <p className="text-center text-sm text-muted-foreground mt-1">
                    Start a conversation with a freelancer
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversationThreads.map((thread) => (
                    <div
                      key={thread.contactId}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedThread?.contactId === thread.contactId 
                          ? "bg-primary/5 border-l-4 border-primary" 
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                            {getInitials(thread.contactName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm truncate">
                              {thread.contactName}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatTime(thread.lastMessageTime)}
                            </span>
                          </div>
                          <p className={`text-sm line-clamp-2 ${
                            thread.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                          }`}>
                            {thread.lastMessage}
                          </p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="default" className="mt-2 text-xs">
                              {thread.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 border-2 shadow-lg flex flex-col">
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                        {getInitials(selectedThread.contactName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedThread.contactName}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {selectedThread.messages.length} messages
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {selectedThread.messages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((msg) => {
                        const isSent = msg.sender_id === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 animate-fade-in ${isSent ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8 border-2 border-primary/10 flex-shrink-0">
                              <AvatarFallback className={`text-xs font-semibold ${
                                isSent 
                                  ? "bg-gradient-to-br from-primary to-accent text-white" 
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {getInitials(isSent ? "You" : msg.sender.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 ${isSent ? "flex flex-col items-end" : ""}`}>
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className={`text-xs font-medium ${
                                  isSent ? "text-primary" : "text-muted-foreground"
                                }`}>
                                  {isSent ? "You" : msg.sender.full_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                isSent 
                                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" 
                                  : "bg-muted"
                              }`}>
                                {msg.subject && !msg.subject.startsWith("Re:") && (
                                  <p className={`font-semibold text-sm mb-1 ${
                                    isSent ? "text-primary-foreground/90" : "text-foreground"
                                  }`}>
                                    {msg.subject}
                                  </p>
                                )}
                                <p className={`text-sm whitespace-pre-wrap ${
                                  isSent ? "text-primary-foreground" : "text-foreground"
                                }`}>
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>

                {/* Reply Input */}
                <CardContent className="border-t bg-muted/20 p-4">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Type your message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      className="min-h-[80px] resize-none border-2 focus:border-primary"
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 self-end"
                      size="lg"
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-center text-muted-foreground max-w-sm">
                  Choose a conversation from the list to view messages and start chatting
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
