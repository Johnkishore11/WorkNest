import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Inbox, Users, MessageCircle, Briefcase } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ClientDashboardProps {
  userId: string;
}

interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function ClientDashboard({ userId }: ClientDashboardProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const { data } = await supabase.from("domains").select("*").order("name");
    setDomains(data || []);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-8 w-8" /> : <Search className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Discover and collaborate with top-tier talent</p>
        </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Projects</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">0</div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="text-blue-600">+0%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Hired Freelancers</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">0</div>
            <p className="text-sm text-muted-foreground">
              Browse talent below
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Messages</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-1">0</div>
            <p className="text-sm text-muted-foreground">
              No new conversations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Browse by Domain</h2>
            <p className="text-muted-foreground">Explore talent across specialized skill areas</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <Card
              key={domain.id}
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50 hover:-translate-y-2 overflow-hidden relative"
              onClick={() => navigate(`/freelancers/${domain.id}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                    {getIcon(domain.icon)}
                  </div>
                  <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                    Popular
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{domain.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">{domain.description}</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all font-semibold">
                  Explore Talent
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            <CardTitle>Messages</CardTitle>
          </div>
          <CardDescription>Your conversations with freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mail className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start by browsing freelancers and reaching out to them
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}