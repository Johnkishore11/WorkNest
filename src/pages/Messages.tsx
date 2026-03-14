import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
  _id: string; // MongoDB uses _id
  sender: {
    _id: string;
    full_name: string;
  };
  receiver: {
    _id: string;
    full_name: string;
  };
  subject: string;
  message: string;
  read: boolean;
  createdAt: string; // Mongoose uses createdAt
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
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        loadMessages();
      }
    }
  }, [user, authLoading, navigate]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/messages");
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Communication Offline",
        description: "Failed to sync your professional inbox.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesByContact = (): ConversationThread[] => {
    if (!user) return [];

    const threadsMap = new Map<string, ConversationThread>();

    messages.forEach((msg) => {
      const senderId = msg.sender._id || (msg.sender as any);
      const receiverId = msg.receiver._id || (msg.receiver as any);
      const senderName = msg.sender.full_name || "Unknown";
      const receiverName = msg.receiver.full_name || "Unknown";

      const isReceived = receiverId === user._id;
      const contactId = isReceived ? senderId : receiverId;
      const contactName = isReceived ? senderName : receiverName;

      if (!threadsMap.has(contactId)) {
        threadsMap.set(contactId, {
          contactId,
          contactName,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: [],
        });
      }

      const thread = threadsMap.get(contactId)!;
      thread.messages.push(msg);

      if (!msg.read && isReceived) {
        thread.unreadCount++;
      }

      // Ensure we have the most recent message as the "lastMessage"
      if (new Date(msg.createdAt) > new Date(thread.lastMessageTime)) {
        thread.lastMessage = msg.message;
        thread.lastMessageTime = msg.createdAt;
      }
    });

    return Array.from(threadsMap.values()).sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  };

  const markThreadAsRead = async (contactId: string) => {
    if (!user) return;

    const unreadMessages = messages.filter(msg => {
      const senderId = msg.sender._id || (msg.sender as any);
      const receiverId = msg.receiver._id || (msg.receiver as any);
      return senderId === contactId && receiverId === user._id && !msg.read;
    });

    if (unreadMessages.length === 0) return;

    try {
      await Promise.all(unreadMessages.map(msg => api.put(`/messages/${msg._id}/read`, {})));

      setMessages(messages.map(msg => {
        const senderId = msg.sender._id || (msg.sender as any);
        const receiverId = msg.receiver._id || (msg.receiver as any);
        if (senderId === contactId && receiverId === user._id) {
          return { ...msg, read: true };
        }
        return msg;
      }));
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const handleSelectThread = (thread: ConversationThread) => {
    setSelectedThread(thread);
    markThreadAsRead(thread.contactId);
  };

  const handleSendReply = async () => {
    if (!selectedThread || !user || !replyText.trim()) return;

    setIsSending(true);
    try {
      const { data: newMessage } = await api.post("/messages", {
        receiver_id: selectedThread.contactId,
        subject: `Re: ${selectedThread.messages[0]?.subject || "Conversation"}`,
        message: replyText,
      });

      toast({
        title: "Message Dispatched",
        description: "Your reply has been sent successfully.",
      });
      setReplyText("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Transmission Failed",
        description: "Could not send your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Collaboration <span className="text-primary italic">Hub</span></h1>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Managing your professional network</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10 rounded-full px-6 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Conversations List - LH Sidebar */}
          <Card className="lg:col-span-4 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Inbox className="w-3.5 h-3.5" />
                  Active Inquiries
                </span>
                {conversationThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
                  <Badge className="bg-primary text-white font-black rounded-full px-2.5">
                    {conversationThreads.reduce((sum, t) => sum + t.unreadCount, 0)} NEW
                  </Badge>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              {conversationThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-300">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Workspace Clear</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    Once you initiate an inquiry with a freelancer, your conversation will appear here.
                  </p>
                  <Button variant="outline" className="mt-8 rounded-full px-8 shadow-sm" onClick={() => navigate('/')}>
                    Discover Talent
                  </Button>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversationThreads.map((thread) => (
                    <div
                      key={thread.contactId}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${selectedThread?.contactId === thread.contactId
                          ? "bg-primary/10 shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-900 shadow-md">
                          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-black text-lg">
                            {getInitials(thread.contactName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-black tracking-tight truncate ${selectedThread?.contactId === thread.contactId ? 'text-primary' : ''}`}>
                              {thread.contactName}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap ml-2 opacity-60">
                              {formatTime(thread.lastMessageTime)}
                            </span>
                          </div>
                          <p className={`text-xs line-clamp-2 leading-relaxed italic font-medium ${thread.unreadCount > 0 ? "text-foreground font-bold" : "text-muted-foreground opacity-70"
                            }`}>
                            {thread.lastMessage}
                          </p>
                          {thread.unreadCount > 0 && (
                            <div className="flex justify-end mt-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Core Collaboration Console - Chat Area */}
          <Card className="lg:col-span-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col">
            {selectedThread ? (
              <>
                {/* Chat Console Header */}
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary font-black">
                        {getInitials(selectedThread.contactName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{selectedThread.contactName}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Collaboration Session</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Message Stream */}
                <ScrollArea className="flex-1 p-8 bg-slate-50/30 dark:bg-slate-900/10">
                  <div className="space-y-8">
                    {selectedThread.messages
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((msg) => {
                        const senderId = msg.sender._id || (msg.sender as any);
                        const isSent = senderId === user?._id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-500 ${isSent ? "flex-row-reverse" : ""}`}
                          >
                            <div className={`flex flex-col max-w-[85%] ${isSent ? "items-end" : "items-start"}`}>
                              <div className="flex items-center gap-2 mb-2 px-1">
                                {!isSent && <span className="text-[10px] font-black uppercase text-primary tracking-widest">{msg.sender.full_name}</span>}
                                <span className="text-[10px] font-bold text-muted-foreground opacity-40">{formatTime(msg.createdAt)}</span>
                              </div>
                              <div className={`rounded-3xl px-6 py-4 shadow-sm border ${isSent
                                  ? "bg-gradient-to-r from-primary to-accent text-white border-transparent"
                                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                                }`}>
                                {msg.subject && !msg.subject.startsWith("Re:") && (
                                  <div className={`text-xs font-black uppercase tracking-[0.15em] mb-2 pb-2 border-b ${isSent ? 'border-white/10 opacity-90' : 'border-slate-50 dark:border-slate-700 opacity-60'}`}>
                                    {msg.subject}
                                  </div>
                                )}
                                <p className={`text-sm leading-relaxed font-medium ${isSent ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>

                {/* Dispatch Console - Reply Input */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                  <div className="relative group">
                    <Textarea
                      placeholder="Type your professional response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      className="min-h-[120px] rounded-3xl resize-none border-none bg-slate-50 dark:bg-slate-950 p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-inner"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 hidden md:inline">Shift+Enter for newline</span>
                      <Button
                        onClick={handleSendReply}
                        disabled={isSending || !replyText.trim()}
                        className="h-12 w-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-10 shadow-inner group">
                  <MessageSquare className="h-14 w-14 text-slate-200 group-hover:text-primary/20 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-3">Select a Conversation</h3>
                <p className="max-w-xs text-sm text-muted-foreground font-medium italic leading-relaxed">
                  Choose a collaboration session from the sidebar to coordinate your professional activities.
                </p>
                <div className="mt-10 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
