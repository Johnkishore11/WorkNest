import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, DollarSign, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Freelancer {
  id: string;
  user_id: string;
  hourly_rate: number;
  skills: string[];
  profiles: {
    full_name: string;
    bio: string;
    profile_image: string;
  };
  averageRating?: number;
  ratingCount?: number;
}

export default function FreelancersList() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [domainName, setDomainName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [domainId]);

  const loadData = async () => {
    // Load domain info
    const { data: domainData } = await supabase
      .from("domains")
      .select("name")
      .eq("id", domainId)
      .single();

    if (domainData) {
      setDomainName(domainData.name);
    }

    // Load freelancers
    const { data: freelancersData } = await supabase
      .from("freelancer_profiles")
      .select(`
        *,
        profiles (
          full_name,
          bio,
          profile_image
        )
      `)
      .eq("domain_id", domainId);

    // Load ratings for each freelancer
    if (freelancersData) {
      const freelancersWithRatings = await Promise.all(
        freelancersData.map(async (freelancer) => {
          const { data: ratingsData } = await supabase
            .from("ratings")
            .select("rating")
            .eq("freelancer_id", freelancer.id);

          const averageRating = ratingsData && ratingsData.length > 0
            ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
            : 0;

          return {
            ...freelancer,
            averageRating,
            ratingCount: ratingsData?.length || 0,
          };
        })
      );

      setFreelancers(freelancersWithRatings as any);
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
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{domainName} Freelancers</h1>
          <p className="text-muted-foreground">
            {freelancers.length} freelancer{freelancers.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {freelancers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No freelancers found in this domain yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {freelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={freelancer.profiles.profile_image || ""} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {freelancer.profiles.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{freelancer.profiles.full_name}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {freelancer.profiles.bio || "No bio provided"}
                      </CardDescription>
                      <div className="flex items-center gap-3 mt-3">
                        {freelancer.ratingCount && freelancer.ratingCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{freelancer.averageRating?.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({freelancer.ratingCount})</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No ratings yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {freelancer.hourly_rate && (
                    <div className="flex items-center text-lg font-semibold text-primary">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {freelancer.hourly_rate}/hr
                    </div>
                  )}

                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {freelancer.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/freelancer/${freelancer.user_id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/contact/${freelancer.user_id}`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}