import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { LogOut, Mail, User as UserIcon, Settings } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      // If the user object from context doesn't have profile_image, we might need to fetch it.
      // Assuming for now user object has it or we fetch it.
      // Let's fetch fresh profile data to be sure.
      loadProfile(user._id);
      loadUnreadCount();
    }
  }, [user]);

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      if (data) {
        setProfileImage(data.profile_image);
        setFullName(data.full_name);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/messages/unread');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Failed to load unread count", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          WorkNest
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/messages")}
                className="relative hover:bg-primary/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {fullName ? fullName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hover:bg-primary/10">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};