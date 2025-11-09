import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, DollarSign, ExternalLink } from "lucide-react";

export default function FreelancerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);

    // Load freelancer profile
    const { data: freelancerData } = await supabase
      .from("freelancer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    setFreelancerProfile(freelancerData);

    // Load portfolios
    if (freelancerData) {
      const { data: portfoliosData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("freelancer_id", freelancerData.id);
      setPortfolios(portfoliosData || []);
    }

    setIsLoading(false);
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{profile?.full_name}</CardTitle>
                <CardDescription className="text-base">
                  {profile?.bio || "No bio provided"}
                </CardDescription>
                {freelancerProfile?.hourly_rate && (
                  <div className="flex items-center text-2xl font-bold text-primary mt-4">
                    <DollarSign className="h-6 w-6 mr-1" />
                    {freelancerProfile.hourly_rate}/hr
                  </div>
                )}
              </div>
              <Button onClick={() => navigate(`/contact/${userId}`)}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Skills */}
        {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {freelancerProfile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-base py-2 px-4">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Featured projects and work samples</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolios.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No portfolio items yet</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {portfolios.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    {item.project_link && (
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.project_link, "_blank")}
                        >
                          View Project
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}