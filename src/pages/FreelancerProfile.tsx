import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, DollarSign, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RatingSection } from "@/components/RatingSection";

export default function FreelancerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      setCurrentUserRole(profileData?.role || null);
    }
  };

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
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_image || ""} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {profile?.bio || "No bio provided"}
                    </CardDescription>
                    {freelancerProfile?.hourly_rate && (
                      <div className="flex items-center mt-4 text-xl font-semibold text-primary">
                        <DollarSign className="h-5 w-5 mr-1" />
                        {freelancerProfile.hourly_rate}/hr
                      </div>
                    )}
                  </div>
                  <Button onClick={() => navigate(`/contact/${userId}`)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Skills */}
        {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
          <Card className="mb-8 border-2">
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Featured projects and work samples</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolios.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No portfolio items yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {portfolios.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden border-2">
                    {item.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {item.description && (
                        <CardDescription>{item.description}</CardDescription>
                      )}
                    </CardHeader>
                    {item.project_link && (
                      <CardContent>
                        <a
                          href={item.project_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2 font-medium"
                        >
                          View Project <ExternalLink className="h-4 w-4" />
                        </a>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ratings Section */}
        {freelancerProfile && (
          <div className="mt-8">
            <RatingSection
              freelancerId={freelancerProfile.id}
              currentUserId={currentUser?.id || null}
              userRole={currentUserRole}
            />
          </div>
        )}
      </div>
    </div>
  );
}