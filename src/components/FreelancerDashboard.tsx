import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Freelancer Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and portfolio</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your professional information</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile?.full_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile?.bio}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="domainId">Domain</Label>
                  <Select name="domainId" defaultValue={freelancerProfile?.domain_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
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
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    defaultValue={freelancerProfile?.hourly_rate}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.bio || "No bio yet"}</p>
                </div>
                {freelancerProfile && (
                  <>
                    <div>
                      <p className="text-sm font-medium">Hourly Rate</p>
                      <p className="text-lg font-semibold text-primary">
                        ${freelancerProfile.hourly_rate || "Not set"}/hr
                      </p>
                    </div>
                  </>
                )}
                <Button onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your expertise and capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {freelancerProfile?.skills?.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Showcase your best work</CardDescription>
          </div>
          <Button onClick={() => setIsAddingPortfolio(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent>
          {isAddingPortfolio && (
            <form onSubmit={handleAddPortfolio} className="mb-6 p-4 border rounded-lg space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div>
                <Label htmlFor="projectLink">Project Link</Label>
                <Input id="projectLink" name="projectLink" type="url" />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" type="url" />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Project</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingPortfolio(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {portfolios.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No portfolio items yet</p>
              <Button
                onClick={() => setIsAddingPortfolio(true)}
                variant="outline"
                className="mt-4"
              >
                Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {portfolios.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <div className="flex gap-2">
                      {item.project_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.project_link, "_blank")}
                        >
                          View Project
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
  );
}