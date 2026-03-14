import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Inbox, Users, MessageCircle, Briefcase, Plus, ArrowRight, Heart, Star, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

interface ClientDashboardProps {
  userId: string;
}

interface Domain {
  _id: string; // MongoDB uses _id
  name: string;
  description: string;
  icon: string;
}

export default function ClientDashboard({ userId }: ClientDashboardProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [savedFreelancers, setSavedFreelancers] = useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDomains();
    loadSavedFreelancers();
  }, []);

  const loadSavedFreelancers = async () => {
    setIsLoadingSaved(true);
    try {
      const { data } = await api.get('/users/saved/list');
      if (data) {
        setSavedFreelancers(data);
      }
    } catch (error) {
      console.error("Failed to load saved freelancers", error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const loadDomains = async () => {
    try {
      const { data } = await api.get("/domains");
      setDomains(data || []);
    } catch (error) {
      console.error("Failed to load domains", error);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-8 w-8" /> : <Search className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-3 px-3 py-1 text-primary border-primary/20 bg-primary/5 font-semibold">
              Client Workspace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Good evening, <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">Partner</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Manage your projects and connect with world-class talent.
            </p>
          </div>
        </div>

        {/* Quick Insights Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-blue-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Projects</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">0</div>
              <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                Static phase <span className="w-1 h-1 rounded-full bg-blue-200" /> 0 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Hired Talent</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">0</div>
              <p className="text-sm text-muted-foreground font-medium">
                Connect with experts below
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-purple-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Unread Messages</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">0</div>
              <p className="text-sm text-muted-foreground font-medium">
                No active conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Discovery & Navigation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Categories/Domains - Left Side */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Expertise Domains</h2>
                <p className="text-muted-foreground">Select a category to find specialized professionals</p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {domains.map((domain) => (
                <Card
                  key={domain._id}
                  className="group relative border-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white dark:bg-slate-900 overflow-hidden"
                  onClick={() => navigate(`/freelancers/${domain._id}`)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  <CardHeader className="p-6">
                    <div className="mb-6 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:rotate-6">
                      {getIcon(domain.icon)}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{domain.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed mt-2 italic font-medium">
                      {domain.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Explore Talents</span>
                      <span className="w-10 h-[1px] bg-slate-200 dark:bg-slate-700 group-hover:bg-primary/30 transition-all group-hover:w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity/Sidebar - Right Side */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>

            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Messaging Inbox</CardTitle>
                    <CardDescription className="text-xs">Incoming inquiries & chats</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="text-center py-6">
                  <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-950">
                    <Mail className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Clear Horizon</h3>
                  <p className="text-sm text-muted-foreground px-6 leading-relaxed">
                    Once you start reaching out to freelancers, your conversations will appear here.
                  </p>
                  <Button variant="outline" className="mt-8 rounded-full px-8 border-slate-200 hover:bg-slate-50" onClick={() => navigate('/')}>
                    Discover Talent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Professionals Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  Saved Talents
                </h2>
                {savedFreelancers.length > 0 && (
                  <Badge variant="secondary" className="bg-red-50 text-red-600 border-none font-bold">
                    {savedFreelancers.length} Bookmarked
                  </Badge>
                )}
              </div>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-0">
                  {isLoadingSaved ? (
                    <div className="p-8 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : savedFreelancers.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Heart className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground italic">
                        No saved freelancers yet. Start bookmarking top talent!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {savedFreelancers.map((freelancer) => (
                        <div
                          key={freelancer._id}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                              <AvatarImage src={freelancer.profile_image} />
                              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                {freelancer.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold group-hover:text-primary transition-colors truncate">
                                {freelancer.full_name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                                {freelancer.role}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-red-500 fill-red-500 hover:bg-red-50"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await api.delete(`/users/save/${freelancer._id}`);
                                  setSavedFreelancers(prev => prev.filter(f => f._id !== freelancer._id));
                                  toast.success("Freelancer removed from bookmarks");
                                } catch (err) {
                                  toast.error("Failed to remove bookmark");
                                }
                              }}
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}