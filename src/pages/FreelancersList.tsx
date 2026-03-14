import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, DollarSign, Star, Users, Heart } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Freelancer {
  _id: string; // MongoDB _id for FreelancerProfile
  user: {
    _id: string; // User ID
    full_name: string;
    bio: string;
    profile_image: string;
  };
  hourly_rate: number;
  skills: string[];
  averageRating?: number;
  ratingCount?: number;
}

export default function FreelancersList() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<string[]>([]);
  const [domainName, setDomainName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    if (user && user.role === 'client') {
      loadSavedFreelancers();
    }
  }, [domainId, user]);

  const loadSavedFreelancers = async () => {
    try {
      const { data } = await api.get('/users/saved/list');
      if (data) {
        setSavedFreelancerIds(data.map((f: any) => f._id));
      }
    } catch (error) {
      console.error("Error loading saved freelancers:", error);
    }
  };

  const loadData = async () => {
    try {
      // Load domain info
      if (domainId) {
        const { data: domainData } = await api.get(`/domains/${domainId}`);
        if (domainData) {
          setDomainName(domainData.name);
        }
      }

      // Load freelancers
      const { data: freelancersData } = await api.get('/freelancers', {
        params: { domain_id: domainId }
      });

      // Load ratings for each freelancer
      if (freelancersData) {
        const freelancersWithRatings = await Promise.all(
          freelancersData.map(async (freelancer: any) => {
            const { data: ratingsData } = await api.get(`/ratings/${freelancer._id}`);

            const averageRating = ratingsData && ratingsData.length > 0
              ? ratingsData.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsData.length
              : 0;

            return {
              ...freelancer,
              averageRating,
              ratingCount: ratingsData?.length || 0,
            };
          })
        );

        setFreelancers(freelancersWithRatings);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveFreelancer = async (freelancerUserId: string) => {
    if (!user) {
      toast.error("Please log in to save freelancers");
      navigate('/auth');
      return;
    }

    if (user.role !== 'client') {
      toast.error("Only clients can save freelancers");
      return;
    }

    const isSaved = savedFreelancerIds.includes(freelancerUserId);

    try {
      if (isSaved) {
        await api.delete(`/users/save/${freelancerUserId}`);
        setSavedFreelancerIds(prev => prev.filter(id => id !== freelancerUserId));
        toast.success("Freelancer removed from saved list");
      } else {
        await api.post(`/users/save/${freelancerUserId}`);
        setSavedFreelancerIds(prev => [...prev, freelancerUserId]);
        toast.success("Freelancer saved successfully");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Failed to update saved list");
    }
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-8 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge variant="secondary" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-none font-bold italic">
                {domainName || "Specialists"}
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight">Top Rated Professionals</h1>
              <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
                Explore our curated list of experts in {domainName || "your selected field"} ready to bring your vision to life.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Talent Pool
              </div>
              <div className="text-2xl font-bold text-primary">
                {freelancers.length} Professionals
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl pb-24">
        {freelancers.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent shadow-none">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-xl font-semibold text-slate-400">No professionals found in this sector yet.</p>
              <Button variant="link" onClick={() => navigate('/dashboard')} className="mt-2">
                Explore other domains
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {freelancers.map((freelancer) => (
              <Card key={freelancer._id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-2 border-white shadow-md ring-1 ring-slate-100">
                        <AvatarImage src={freelancer.user.profile_image || ""} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {freelancer.user.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{freelancer.user.full_name}</CardTitle>
                        {freelancer.hourly_rate && (
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            ${freelancer.hourly_rate}<span className="text-xs text-muted-foreground font-normal">/hr</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 mb-3">
                        {freelancer.ratingCount && freelancer.ratingCount > 0 ? (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-700">{freelancer.averageRating?.toFixed(1)}</span>
                            <span className="text-[10px] text-yellow-600 font-medium ml-0.5">({freelancer.ratingCount} reviews)</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">New Specialist</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                        "{freelancer.user.bio || "Bringing professional excellence to every project with a focus on quality and innovation."}"
                      </p>
                    </div>

                    {user?.role === 'client' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full hover:bg-red-50 hover:text-red-500 transition-colors ${savedFreelancerIds.includes(freelancer.user._id) ? "text-red-500 fill-red-500" : "text-muted-foreground"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveFreelancer(freelancer.user._id);
                        }}
                      >
                        <Heart className={`h-5 w-5 ${savedFreelancerIds.includes(freelancer.user._id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-5">
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[11px] font-semibold bg-slate-50 hover:bg-primary/10 hover:text-primary transition-colors border-none py-1">
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.skills.length > 4 && (
                        <span className="text-[10px] text-muted-foreground flex items-center ml-1">
                          +{freelancer.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 rounded-xl shadow-lg shadow-primary/10 h-11 text-sm font-bold tracking-tight"
                      onClick={() => navigate(`/freelancer/${freelancer.user._id}`)}
                    >
                      View Full Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 w-11 p-0 border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                      onClick={() => navigate(`/contact/${freelancer.user._id}`)}
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