import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import FreelancerDashboard from "@/components/FreelancerDashboard";
import ClientDashboard from "@/components/ClientDashboard";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {user.role === "freelancer" ? (
        <FreelancerDashboard userId={user._id!} />
      ) : (
        <ClientDashboard userId={user._id!} />
      )}
    </div>
  );
}