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
  Star
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

      // TODO: Load ratings (Not implemented in backend yet)

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

      // Update user profile with new image URL
      // We need an endpoint for this or update the user model directly via /users/:id
      // Assuming the image URL returned is relative path, we need to prepend base URL if needed or handle in backend
      // My backend returns relative path /uploads/filename.ext

      const fullImageUrl = `http://localhost:5000${imageUrl}`; // Hardcoded for now, should be from config

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
        domain_id: freelancerProfile?.domain_id // Ensure other fields are kept
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Freelancer Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">Manage your professional presence and showcase your work</p>
            </div>
            <div className="flex items-center gap-3 bg-card p-4 rounded-xl shadow-sm border-2 border-border hover:border-primary/50 transition-all">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold">Availability Status</span>
                <span className="text-xs text-muted-foreground">
                  {isAvailable ? "Open to work" : "Unavailable"}
                </span>
              </div>
              <Switch checked={isAvailable} onCheckedChange={async (val) => {
                setIsAvailable(val);
                // Update availability immediately
                try {
                  await api.post('/freelancers', { ...freelancerProfile, available: val });
                } catch (e) {
                  toast.error("Failed to update status");
                }
              }} />
            </div>
          </div>

          {/* Profile Header with Avatar */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 hover:border-primary/40 transition-all mb-6 shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                    <AvatarImage src={profile?.profile_image || ""} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-10 w-10 text-white" />
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingProfileImage}
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{profile?.full_name || "Set your name"}</CardTitle>
                  <CardDescription className="text-base">{profile?.bio || "Add a bio to tell clients about yourself"}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Completion */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold">Profile Completion</span>
                <span className="text-lg font-bold text-primary">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-3" />
              {profileCompletion < 100 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Complete your profile to attract more clients and stand out
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Portfolio Projects</CardTitle>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{portfolios.length}</div>
              <p className="text-sm text-muted-foreground">Showcase pieces</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Average Rating</CardTitle>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Star className="h-6 w-6 text-white fill-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-4xl font-bold">{totalRatings > 0 ? averageRating.toFixed(1) : '0.0'}</div>
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">{totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Hourly Rate</CardTitle>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">${freelancerProfile?.hourly_rate || 0}</div>
              <p className="text-sm text-muted-foreground">Per hour</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-2 border-orange-500/20 hover:border-orange-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Skills Listed</CardTitle>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{freelancerProfile?.skills?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Technical skills</p>
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
                            <SelectItem key={domain._id} value={domain._id}>
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
                            {domains.find(d => d._id === freelancerProfile.domain)?.name || "Not set"}
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
                    <p className="text-muted-foreground text-sm">No skills added yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} size="sm" type="button">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Portfolio */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-success/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-success" />
                      Portfolio
                    </CardTitle>
                    <CardDescription>Your best work</CardDescription>
                  </div>
                  {!isAddingPortfolio && (
                    <Button onClick={() => setIsAddingPortfolio(true)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isAddingPortfolio && (
                  <form onSubmit={handleAddPortfolio} className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border">
                    <div>
                      <Label htmlFor="title">Project Title *</Label>
                      <Input id="title" name="title" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" rows={3} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="projectLink">Project Link</Label>
                      <Input id="projectLink" name="projectLink" type="url" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="portfolio-image" className="mb-2 block">
                        Project Image
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('portfolio-image')?.click()}
                          disabled={uploadingPortfolioImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingPortfolioImage ? "Uploading..." : "Upload Image"}
                        </Button>
                        {portfolioImageUrl && (
                          <img
                            src={portfolioImageUrl}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded"
                          />
                        )}
                      </div>
                      <input
                        id="portfolio-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePortfolioImageUpload}
                        disabled={uploadingPortfolioImage}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Add Portfolio</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingPortfolio(false);
                          setPortfolioImageUrl("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {portfolios.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      No portfolio items yet. Add your first project!
                    </p>
                  ) : (
                    portfolios.map((portfolio) => (
                      <Card key={portfolio._id} className="group hover:shadow-md transition-all overflow-hidden">
                        {portfolio.image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={portfolio.image_url}
                              alt={portfolio.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{portfolio.title}</CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deletePortfolio(portfolio._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          {portfolio.description && (
                            <CardDescription className="text-sm line-clamp-2">
                              {portfolio.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        {portfolio.project_link && (
                          <CardContent className="pt-0">
                            <a
                              href={portfolio.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View Project <ExternalLink className="h-3 w-3" />
                            </a>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}