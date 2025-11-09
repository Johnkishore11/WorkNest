import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Mail } from "lucide-react";
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

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Browse by Domain</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <Card
              key={domain.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/freelancers/${domain.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {getIcon(domain.icon)}
                  </div>
                </div>
                <CardTitle className="mt-4">{domain.name}</CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  View Freelancers
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Your conversations with freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start by browsing freelancers and reaching out to them
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}