import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  Edit2,
  Globe
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";

interface FreelancerDashboardProps {
  userId: string;
}

interface Domain {
  id: string;
  name: string;
}

interface Portfolio {
  id: string;
  title: string;
  description: string;
  project_link: string;
  image_url: string;
}

export default function FreelancerDashboard({ userId }: FreelancerDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

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

    // Load domains
    const { data: domainsData } = await supabase.from("domains").select("*");
    setDomains(domainsData || []);

    // Load portfolios
    if (freelancerData) {
      const { data: portfoliosData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("freelancer_id", freelancerData.id);
      setPortfolios(portfoliosData || []);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.get("fullName") as string,
        bio: formData.get("bio") as string,
      })
      .eq("id", userId);

    if (profileError) {
      toast.error("Error updating profile");
      return;
    }

    // Create or update freelancer profile
    const hourlyRateValue = formData.get("hourlyRate");
    const domainIdValue = formData.get("domainId");
    
    const freelancerData = {
      user_id: userId,
      domain_id: domainIdValue as string,
      hourly_rate: hourlyRateValue ? parseFloat(hourlyRateValue as string) : null,
      skills: freelancerProfile?.skills || [],
    };

    if (freelancerProfile) {
      await supabase
        .from("freelancer_profiles")
        .update(freelancerData)
        .eq("id", freelancerProfile.id);
    } else {
      await supabase.from("freelancer_profiles").insert([freelancerData]);
    }

    toast.success("Profile updated successfully!");
    setIsEditingProfile(false);
    loadData();
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !freelancerProfile) return;

    const updatedSkills = [...(freelancerProfile.skills || []), newSkill.trim()];
    
    const { error } = await supabase
      .from("freelancer_profiles")
      .update({ skills: updatedSkills })
      .eq("id", freelancerProfile.id);

    if (!error) {
      setNewSkill("");
      loadData();
      toast.success("Skill added!");
    }
  };

  const removeSkill = async (skill: string) => {
    if (!freelancerProfile) return;

    const updatedSkills = freelancerProfile.skills.filter((s: string) => s !== skill);
    
    const { error } = await supabase
      .from("freelancer_profiles")
      .update({ skills: updatedSkills })
      .eq("id", freelancerProfile.id);

    if (!error) {
      loadData();
      toast.success("Skill removed!");
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!freelancerProfile) return;

    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("portfolios").insert([{
      freelancer_id: freelancerProfile.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      project_link: formData.get("projectLink") as string,
      image_url: formData.get("imageUrl") as string,
    }]);

    if (error) {
      toast.error("Error adding portfolio item");
      return;
    }

    toast.success("Portfolio item added!");
    setIsAddingPortfolio(false);
    loadData();
  };

  const deletePortfolio = async (id: string) => {
    const { error } = await supabase.from("portfolios").delete().eq("id", id);

    if (!error) {
      toast.success("Portfolio item deleted!");
      loadData();
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completion = 0;
    if (profile?.full_name) completion += 20;
    if (profile?.bio) completion += 20;
    if (freelancerProfile?.hourly_rate) completion += 20;
    if (freelancerProfile?.skills?.length > 0) completion += 20;
    if (portfolios.length > 0) completion += 20;
    return completion;
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Freelancer Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your professional profile and showcase your work</p>
            </div>
            <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-sm border">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">Availability Status</span>
                <span className="text-xs text-muted-foreground">
                  {isAvailable ? "Open to work" : "Unavailable"}
                </span>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </div>

          {/* Profile Completion */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              {profileCompletion < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Complete your profile to attract more clients
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Portfolio Projects</p>
                  <p className="text-3xl font-bold text-primary">{portfolios.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-3xl font-bold text-accent">127</p>
                </div>
                <Eye className="h-8 w-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                  <p className="text-3xl font-bold text-success">
                    ${freelancerProfile?.hourly_rate || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skills Listed</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {freelancerProfile?.skills?.length || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile & Skills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Professional Profile
                    </CardTitle>
                    <CardDescription>Your public-facing information</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={profile?.full_name}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile?.bio}
                        rows={4}
                        placeholder="Tell clients about your expertise and experience..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domainId">Primary Domain</Label>
                      <Select name="domainId" defaultValue={freelancerProfile?.domain_id}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="hourlyRate"
                          name="hourlyRate"
                          type="number"
                          step="0.01"
                          defaultValue={freelancerProfile?.hourly_rate}
                          className="pl-9"
                          placeholder="50.00"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-muted/50 to-background p-6 rounded-lg border">
                      <h3 className="font-bold text-2xl mb-2">{profile?.full_name || "Not set"}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {profile?.bio || "No bio added yet. Add one to attract more clients!"}
                      </p>
                    </div>
                    
                    {freelancerProfile && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Hourly Rate</p>
                          <p className="text-2xl font-bold text-primary">
                            ${freelancerProfile.hourly_rate || "Not set"}
                            {freelancerProfile.hourly_rate && <span className="text-sm font-normal">/hr</span>}
                          </p>
                        </div>
                        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Domain</p>
                          <p className="text-lg font-semibold text-accent">
                            {domains.find(d => d.id === freelancerProfile.domain_id)?.name || "Not set"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription>Showcase your technical abilities</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {freelancerProfile?.skills?.length > 0 ? (
                    freelancerProfile.skills.map((skill: string) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="gap-2 py-1.5 px-3 text-sm hover:bg-primary/10 transition-colors"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No skills added yet. Add your first skill below!</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Node.js, UI/UX)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} size="sm" className="px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <span className="text-sm font-bold">2 hours</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium">Messages</span>
                  </div>
                  <Badge variant="secondary">5 New</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">Growth</span>
                  </div>
                  <span className="text-sm font-bold text-success">+24%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-primary via-primary to-accent text-white">
              <CardHeader>
                <CardTitle className="text-white">Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/90 leading-relaxed">
                  Add at least 3 portfolio projects with high-quality images to increase your profile visibility by up to 70%!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Portfolio Section */}
        <Card className="mt-6 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Portfolio Showcase
                </CardTitle>
                <CardDescription>Display your best work and achievements</CardDescription>
              </div>
              <Button onClick={() => setIsAddingPortfolio(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isAddingPortfolio && (
              <form onSubmit={handleAddPortfolio} className="mb-6 p-6 border-2 border-dashed border-primary/20 rounded-lg space-y-4 bg-muted/30">
                <h3 className="font-semibold text-lg mb-4">Add New Project</h3>
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    required 
                    className="mt-1"
                    placeholder="E-commerce Website Redesign"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={3} 
                    className="mt-1"
                    placeholder="Describe the project, your role, and key achievements..."
                  />
                </div>
                <div>
                  <Label htmlFor="projectLink">Project Link</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="projectLink" 
                      name="projectLink" 
                      type="url" 
                      className="pl-9"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    type="url" 
                    className="mt-1"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingPortfolio(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {portfolios.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Portfolio Projects Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your portfolio to showcase your best work
                </p>
                <Button
                  onClick={() => setIsAddingPortfolio(true)}
                  variant="default"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolios.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {item.image_url && (
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description || "No description provided"}
                      </p>
                      <div className="flex gap-2">
                        {item.project_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(item.project_link, "_blank")}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            View Live
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePortfolio(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
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
