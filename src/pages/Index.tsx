import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-24 px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(14, 165, 233, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to WorkNest
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with top freelance talent or showcase your skills to clients worldwide
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How WorkNest Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Browse Domains</h3>
                <p className="text-muted-foreground">
                  Explore freelancers across various professional domains
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">View Portfolios</h3>
                <p className="text-muted-foreground">
                  Review work samples and project showcases
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Connect Directly</h3>
                <p className="text-muted-foreground">
                  Message freelancers and discuss your project
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Grow Together</h3>
                <p className="text-muted-foreground">
                  Build lasting professional relationships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of freelancers and clients building successful projects together
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="px-8"
          >
            Join WorkNest Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2024 WorkNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
