import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, DollarSign, ExternalLink, Star, Heart } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { RatingSection } from "@/components/RatingSection";
import { RatingDialog } from "@/components/RatingDialog";

export default function FreelancerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready before loading data
    if (!authLoading) {
      loadData();
    }
  }, [userId, authLoading, currentUser]);

  const loadData = async () => {
    try {
      // Load freelancer profile (which includes user details)
      const { data: freelancerData } = await api.get(`/freelancers/user/${userId}`);

      if (freelancerData) {
        setFreelancerProfile(freelancerData);
        setProfile(freelancerData.user);

        // Load portfolios
        const { data: portfoliosData } = await api.get(`/freelancers/portfolio/${freelancerData._id}`);
        setPortfolios(portfoliosData || []);

        // Load user's existing rating if they're a client
        if (currentUser && currentUser.role === "client") {
          try {
            const { data: ratingData } = await api.get(`/ratings/check/${freelancerData._id}`);
            setUserRating(ratingData || null);
          } catch (err) {
            console.error("Error checking rating:", err);
          }
        }

        // Load all ratings to calculate average
        try {
          const { data: ratingsData } = await api.get(`/ratings/${freelancerData._id}`);
          if (ratingsData && ratingsData.length > 0) {
            const avg = ratingsData.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsData.length;
            setFreelancerProfile((prev: any) => ({
              ...prev,
              averageRating: avg,
              ratingCount: ratingsData.length
            }));
          } else {
            setFreelancerProfile((prev: any) => ({
              ...prev,
              averageRating: 0,
              ratingCount: 0
            }));
          }
        } catch (err) {
          console.error("Error loading ratings for average calculation:", err);
        }

        // Load saved status if they're a client
        if (currentUser && currentUser.role === "client") {
          try {
            const { data: savedData } = await api.get('/users/saved/list');
            if (savedData) {
              setIsSaved(savedData.some((f: any) => f._id === userId));
            }
          } catch (err) {
            console.error("Error checking saved status:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error loading freelancer profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!currentUser) {
      toast.error("Please log in to save freelancers");
      navigate("/auth");
      return;
    }

    if (currentUser.role !== "client") {
      toast.error("Only clients can save freelancers");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/users/save/${userId}`);
        setIsSaved(false);
        toast.success("Removed from saved list");
      } else {
        await api.post(`/users/save/${userId}`);
        setIsSaved(true);
        toast.success("Freelancer saved successfully!");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Failed to update saved list");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
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

      {/* Hero Header Section */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b" />
        <div className="container mx-auto px-4 max-w-6xl -mt-16 md:-mt-24">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background shadow-xl ring-2 ring-primary/5">
                <AvatarImage src={profile?.profile_image || ""} />
                <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile?.full_name}</h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-0.5 font-medium">
                      Professional Freelancer
                    </Badge>
                    {freelancerProfile?.ratingCount > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-yellow-700">{freelancerProfile.averageRating?.toFixed(1)}</span>
                          <span className="text-[10px] text-yellow-600 font-medium ml-0.5">({freelancerProfile.ratingCount} reviews)</span>
                        </div>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => navigate(`/contact/${userId}`)}
                    className="shadow-lg shadow-primary/20"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Hire Now
                  </Button>
                  {currentUser?.role === "client" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleSave}
                      disabled={isSaving}
                      className={`shadow-sm rounded-xl h-10 w-10 transition-all ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"
                        }`}
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* About Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                About Me
              </h2>
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {profile?.bio || "No biography provided yet. This freelancer is ready to take on new challenges!"}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Skills & Expertise */}
            {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Skills & Expertise
                </h2>
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2.5">
                      {freelancerProfile.skills.map((skill: string) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-sm py-1.5 px-4 bg-primary/5 hover:bg-primary/10 text-primary-foreground/90 border-primary/10 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Portfolio Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Portfolio</h2>
                <Badge variant="outline" className="font-normal">{portfolios.length} Items</Badge>
              </div>

              {portfolios.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>No portfolio items displayed yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {portfolios.map((item) => (
                    <Card key={item._id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-none shadow-md bg-card">
                      {item.image_url ? (
                        <div className="aspect-[16/10] overflow-hidden sticky-top">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center">
                          <span className="text-slate-400">Project Workspace</span>
                        </div>
                      )}
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
                        {item.description && (
                          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                        )}
                      </CardHeader>
                      {item.project_link && (
                        <CardContent>
                          <a
                            href={item.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 font-medium group/link"
                          >
                            Live Demo <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Ratings & Reviews Section */}
            {freelancerProfile && (
              <section className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Reviews & Feedback</h2>
                  {currentUser?.role === "client" && (
                    <RatingDialog
                      freelancerId={freelancerProfile?._id}
                      currentUserId={currentUser?._id}
                      existingRating={userRating?.rating}
                      existingComment={userRating?.comment}
                      existingRatingId={userRating?._id}
                      onRatingSubmitted={loadData}
                      trigger={
                        <Button size="sm" variant="outline" className="h-9">
                          <Star className="h-4 w-4 mr-2" />
                          {userRating ? "Update Review" : "Write Review"}
                        </Button>
                      }
                    />
                  )}
                </div>
                <RatingSection
                  freelancerId={freelancerProfile._id}
                  currentUserId={currentUser?._id || null}
                  userRole={currentUser?.role || null}
                />
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-lg bg-card overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <CardTitle className="text-lg">Project Summary</CardTitle>
                  <CardDescription>Estimated services and rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate
                    </div>
                    <div className="text-xl font-bold text-primary">
                      ${freelancerProfile?.hourly_rate || "0"}/hr
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className={`h-4 w-4 ${freelancerProfile?.available ? 'text-green-500' : 'text-slate-400'}`} />
                      Availability
                    </div>
                    <div className="text-sm font-semibold">
                      {freelancerProfile?.available ? (
                        <span className="text-green-600 dark:text-green-400">Available Now</span>
                      ) : (
                        <span className="text-slate-500">Busy</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full text-base py-6 shadow-lg shadow-primary/20"
                      onClick={() => navigate(`/contact/${userId}`)}
                    >
                      Process Inquiry
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-semibold">
                      Typical response time: 2-4 hours
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-primary/5 dark:bg-primary/10">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">WorkNest Guarantee</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every project on WorkNest is covered by our secure payment system. Only release payment when you're 100% satisfied with the work.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}