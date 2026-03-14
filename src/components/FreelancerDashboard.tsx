import { useEffect, useState } from "react";
import api from "@/lib/api";
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
  DollarSign,
  Award,
  CheckCircle2,
  Edit2,
  Upload,
  Camera,
  ExternalLink,
  Star,
  Loader2
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface FreelancerDashboardProps {
  userId: string;
}

interface Domain {
  _id: string;
  name: string;
}

interface Portfolio {
  _id: string;
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
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingPortfolioImage, setUploadingPortfolioImage] = useState(false);
  const [portfolioImageUrl, setPortfolioImageUrl] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Load profile (user data)
      const { data: profileData } = await api.get(`/users/${userId}`);
      setProfile(profileData);

      // Load freelancer profile
      try {
        const { data: freelancerData } = await api.get('/freelancers/me');
        setFreelancerProfile(freelancerData);
        if (freelancerData) setIsAvailable(freelancerData.available);
      } catch (err) {
        // Might not exist yet
        console.log("No freelancer profile found yet");
      }

      // Load domains
      const { data: domainsData } = await api.get('/domains');
      setDomains(domainsData || []);

      // Load portfolios
      try {
        const { data: portfoliosData } = await api.get('/freelancers/portfolio');
        setPortfolios(portfoliosData || []);
      } catch (err) {
        console.log("Failed to load portfolios");
      }

    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfileImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data: imageUrl } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fullImageUrl = `http://localhost:5000${imageUrl}`;

      await api.put(`/users/${userId}`, { profile_image: fullImageUrl });

      toast.success("Profile image updated successfully");
      loadData();
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPortfolioImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data: imageUrl } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fullImageUrl = `http://localhost:5000${imageUrl}`;
      setPortfolioImageUrl(fullImageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploadingPortfolioImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Update user profile
      await api.put(`/users/${userId}`, {
        full_name: formData.get("fullName"),
        bio: formData.get("bio"),
      });

      // Update/Create freelancer profile
      const hourlyRateValue = formData.get("hourlyRate");

      await api.post('/freelancers', {
        domain_id: formData.get("domainId"),
        hourly_rate: hourlyRateValue ? parseFloat(hourlyRateValue as string) : null,
        skills: freelancerProfile?.skills || [],
        available: isAvailable
      });

      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      loadData();
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;

    const updatedSkills = [...(freelancerProfile?.skills || []), newSkill.trim()];

    try {
      await api.post('/freelancers', {
        ...freelancerProfile,
        skills: updatedSkills,
        domain_id: freelancerProfile?.domain_id
      });
      setNewSkill("");
      loadData();
      toast.success("Skill added!");
    } catch (error) {
      toast.error("Error adding skill");
    }
  };

  const removeSkill = async (skill: string) => {
    if (!freelancerProfile) return;

    const updatedSkills = freelancerProfile.skills.filter((s: string) => s !== skill);

    try {
      await api.post('/freelancers', {
        ...freelancerProfile,
        skills: updatedSkills
      });
      loadData();
      toast.success("Skill removed!");
    } catch (error) {
      toast.error("Error removing skill");
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await api.post('/freelancers/portfolio', {
        title: formData.get("title"),
        description: formData.get("description"),
        project_link: formData.get("projectLink"),
        image_url: portfolioImageUrl,
      });

      toast.success("Portfolio item added!");
      setIsAddingPortfolio(false);
      setPortfolioImageUrl("");
      loadData();
    } catch (error) {
      toast.error("Error adding portfolio item");
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      await api.delete(`/freelancers/portfolio/${id}`);
      toast.success("Portfolio item deleted!");
      loadData();
    } catch (error) {
      toast.error("Error deleting portfolio item");
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completion = 0;
    if (profile?.full_name) completion += 20;
    if (profile?.bio) completion += 20;
    if (profile?.profile_image) completion += 15;
    if (freelancerProfile?.hourly_rate) completion += 15;
    if (freelancerProfile?.skills?.length > 0) completion += 15;
    if (portfolios.length > 0) completion += 15;
    return completion;
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">

        {/* Top Navigation / Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="flex-1">
            <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/5 text-primary border-primary/10 font-bold tracking-tight">
              Talent Workspace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0] || "Pro"}</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Your professional hub for managing projects, showcasing expertise, and connecting with world-class clients.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl shadow-sm border ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="text-right">
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Availability</div>
              <div className={`text-sm font-black ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                {isAvailable ? "OPEN FOR NEW CLIENTS" : "CURRENTLY BUSY"}
              </div>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={async (val) => {
                setIsAvailable(val);
                try {
                  await api.post('/freelancers', { ...freelancerProfile, available: val });
                } catch (e) {
                  toast.error("Failed to update status");
                }
              }}
              className="scale-125"
            />
          </div>
        </div>

        {/* Dynamic Insights Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-blue-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Showcase Pieces</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{portfolios.length}</div>
              <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
                Total Portfolio Items
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-yellow-400" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Client Rating</CardTitle>
              <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-600 group-hover:scale-110 transition-transform">
                <Star className={`h-5 w-5 ${totalRatings > 0 ? 'fill-yellow-400' : ''}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-4xl font-black">{totalRatings > 0 ? averageRating.toFixed(1) : '0.0'}</div>
                <div className="pb-1 text-sm font-bold text-yellow-600">Avg Score</div>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{totalRatings} Verified Reviews</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Fee</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 mb-1">
                <div className="text-4xl font-black">${freelancerProfile?.hourly_rate || 0}</div>
                <div className="pb-1 text-sm font-bold text-emerald-600">/ Hour</div>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Professional Rate</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900 group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1.5 w-full bg-purple-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Core Skills</CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{freelancerProfile?.skills?.length || 0}</div>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-tighter">Verified Abilities</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Action Hub - Left Column */}
          <div className="lg:col-span-8 space-y-10">

            {/* IdentityCard / Main Info */}
            <section>
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary/50">Primary Digital Profile</span>
                  </div>
                </div>

                <CardContent className="px-8 pb-10 -mt-12">
                  <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl ring-1 ring-slate-100 overflow-hidden">
                        <AvatarImage src={profile?.profile_image || ""} className="object-cover" />
                        <AvatarFallback className="text-5xl bg-slate-100 text-slate-400">
                          {profile?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profile-image-upload"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
                      >
                        <Camera className="h-8 w-8 text-white" />
                      </label>
                      <input id="profile-image-upload" type="file" className="hidden" onChange={handleProfileImageUpload} />
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h2 className="text-3xl font-black tracking-tight">{profile?.full_name || "New Professional"}</h2>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            {domains.find(d => d._id === (freelancerProfile?.domain_id || freelancerProfile?.domain))?.name || "Uncategorized"} Specialist
                          </p>
                        </div>
                        {!isEditingProfile && (
                          <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="rounded-full px-5 h-10 border-slate-200">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Legal Name</Label>
                          <Input name="fullName" defaultValue={profile?.full_name} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Expertise Sector</Label>
                          <Select name="domainId" defaultValue={freelancerProfile?.domain_id || freelancerProfile?.domain}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              {domains.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Professional Narrative (Bio)</Label>
                          <Textarea name="bio" defaultValue={profile?.bio} rows={4} className="rounded-2xl bg-slate-50 border-none shadow-inner resize-none p-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Performance Rate ($/hr)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input name="hourlyRate" type="number" defaultValue={freelancerProfile?.hourly_rate} className="h-12 pl-10 rounded-xl bg-slate-50 border-none shadow-inner" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">Commit Changes</Button>
                        <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="px-8 h-12 rounded-xl font-bold">Discard</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          Bio & Story
                        </div>
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 italic">
                          {profile?.bio || "Describe your professional journey here..."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Skills & Capability Matrix */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Skill Matrix</h2>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Verified</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
              </div>

              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-3xl p-8">
                <div className="flex flex-wrap gap-3 mb-8">
                  {freelancerProfile?.skills?.map((skill: string) => (
                    <Badge
                      key={skill}
                      className="py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 border shadow-sm flex items-center gap-2 group/badge"
                    >
                      <span className="text-sm font-bold tracking-tight">{skill}</span>
                      <button onClick={() => removeSkill(skill)} className="p-0.5 rounded-full hover:bg-white/20 opacity-40 group-hover/badge:opacity-100">
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </Badge>
                  ))}
                  {(!freelancerProfile?.skills || freelancerProfile.skills.length === 0) && (
                    <div className="text-sm text-muted-foreground italic">No skills listed yet. Add your technical stack below.</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Introduce a new capability..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner text-sm font-medium"
                    />
                  </div>
                  <Button onClick={addSkill} className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/10">
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </Card>
            </section>

            {/* Portfolio Showcase */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Work Portfolio</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Showcase your high-impact deliverables</p>
                </div>
                {!isAddingPortfolio && (
                  <Button onClick={() => setIsAddingPortfolio(true)} className="rounded-full px-6 h-11 font-bold shadow-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Work
                  </Button>
                )}
              </div>

              {isAddingPortfolio && (
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 mb-10 ring-2 ring-primary/5 animate-in slide-in-from-top-4 duration-500">
                  <form onSubmit={handleAddPortfolio} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Name</Label>
                          <Input name="title" required className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" placeholder="e.g. Modern E-commerce Engine" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narrative Context</Label>
                          <Textarea name="description" rows={4} className="rounded-2xl bg-slate-50 border-none shadow-inner resize-none p-4" placeholder="Briefly describe the challenge and your solution..." />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Demonstration Link</Label>
                          <Input name="projectLink" type="url" className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visual Asset</Label>
                          <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group/upload" onClick={() => document.getElementById('portfolio-image')?.click()}>
                            <input id="portfolio-image" type="file" className="hidden" onChange={handlePortfolioImageUpload} />
                            {portfolioImageUrl ? (
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                                <img src={portfolioImageUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white text-xs font-black uppercase tracking-widest">Replace Asset</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-center text-slate-400 group-hover/upload:scale-110 transition-transform">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-bold text-muted-foreground mt-4 group-hover/upload:text-primary transition-colors">UPLOAD THUMBNAIL</div>
                                {uploadingPortfolioImage && <div className="text-[10px] text-primary mt-2 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> COMMITTING...</div>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20">Publish to Showcase</Button>
                      <Button variant="ghost" className="px-10 h-14 rounded-2xl font-bold" onClick={() => setIsAddingPortfolio(false)}>Discard</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="grid gap-8 md:grid-cols-2">
                {portfolios.map((portfolio) => (
                  <Card key={portfolio._id} className="group border-none shadow-md hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {portfolio.image_url ? (
                        <img src={portfolio.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Briefcase className="w-10 h-10 text-slate-200" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full shadow-lg"
                          onClick={() => deletePortfolio(portfolio._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="flex-1 p-6 pb-0">
                      <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{portfolio.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3 leading-relaxed font-medium italic">
                        {portfolio.description || "Experimental work focused on modular design and scalability."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-5">
                      {portfolio.project_link && (
                        <a
                          href={portfolio.project_link}
                          target="_blank"
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-primary hover:tracking-[0.2em] transition-all"
                        >
                          Exploration <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {portfolios.length === 0 && (
                  <Card className="md:col-span-2 border-dashed border-2 bg-transparent shadow-none p-20 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-inner mb-6 text-slate-300">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Portfolio Empty</h3>
                    <p className="text-sm text-slate-400">Add your first project to start showing off your expertise.</p>
                    <Button variant="outline" className="mt-6 rounded-full border-slate-200" onClick={() => setIsAddingPortfolio(true)}>Upload Your First Work</Button>
                  </Card>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Insights - Right Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Progress / Completion */}
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black tracking-tight uppercase">Profile Integrity</h3>
                <div className="w-12 h-12 rounded-full border-4 border-primary/10 flex items-center justify-center text-xs font-black text-primary">
                  {profileCompletion}%
                </div>
              </div>
              <div className="space-y-4">
                <Progress value={profileCompletion} className="h-2 rounded-full bg-slate-50 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Presence</span>
                    <div className={`w-2 h-2 rounded-full ${profileCompletion > 60 ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Searchable</span>
                    <span className="text-[10px] font-black tracking-tighter text-slate-400">ACTIVE</span>
                  </div>
                </div>
                {profileCompletion < 100 && (
                  <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                    Complete your digital presence to rank higher in professional searches.
                  </p>
                )}
              </div>
            </Card>

            {/* Workspace Settings / Sidebar Cards */}
            <div className="sticky top-24 space-y-8">
              <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl p-8">
                <h3 className="text-lg font-black tracking-tight uppercase mb-6">Quick Overview</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-sm font-bold text-muted-foreground">Active Domain</span>
                    <span className="text-sm font-black text-primary">
                      {domains.find(d => d._id === (freelancerProfile?.domain_id || freelancerProfile?.domain))?.name || "Global"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-sm font-bold text-muted-foreground">Rating Tier</span>
                    <span className="text-sm font-black flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${totalRatings > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      {totalRatings > 0 ? "EXPERT" : "EMERGING"}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-8 rounded-2xl h-12 border-slate-200 hover:bg-slate-50 text-sm font-black" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  GO TO SUMMARY
                </Button>
              </Card>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}