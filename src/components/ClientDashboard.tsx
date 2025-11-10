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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground">Find and hire talented freelancers</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Start your first project</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired Freelancers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Browse freelancers below</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No new messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Browse by Domain</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <Card
              key={domain.id}
              className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => navigate(`/freelancers/${domain.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all shadow-lg">
                    {getIcon(domain.icon)}
                  </div>
                </div>
                <CardTitle className="mt-4 group-hover:text-primary transition-colors">{domain.name}</CardTitle>
                <CardDescription className="line-clamp-2">{domain.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  View Freelancers
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
  );
}