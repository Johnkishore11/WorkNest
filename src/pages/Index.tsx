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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-accent/90" />
        </div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
              🚀 The #1 Platform for Hiring Freelancers
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 tracking-tight">
              Find Your Perfect
              <span className="block mt-3 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Freelancer Match
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-white/90 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 max-w-3xl mx-auto leading-relaxed font-light">
              Connect with top-tier professionals across 50+ domains. Build exceptional projects with the world's best talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/95 text-lg px-12 py-7 shadow-2xl hover:shadow-white/30 transition-all hover:scale-105 font-semibold"
              >
                Start Hiring Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="bg-white/5 text-white border-2 border-white/40 hover:bg-white/15 hover:border-white/60 text-lg px-12 py-7 backdrop-blur-md font-semibold"
              >
                Join as Freelancer
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-white/80 text-sm md:text-base">Active Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-white/80 text-sm md:text-base">Skill Domains</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
                <div className="text-white/80 text-sm md:text-base">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How WorkNest Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to connect with world-class talent
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-primary/50 group">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Search className="h-8 w-8" />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/5">01</div>
                <h3 className="font-bold text-xl mb-3">Browse Domains</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Explore 50+ professional domains and find the perfect expertise for your project
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-primary/50 group">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/5">02</div>
                <h3 className="font-bold text-xl mb-3">View Portfolios</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Review detailed portfolios, ratings, and project histories to make informed decisions
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-primary/50 group">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/5">03</div>
                <h3 className="font-bold text-xl mb-3">Connect Directly</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Message freelancers instantly to discuss requirements and negotiate terms
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-primary/50 group">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/5">04</div>
                <h3 className="font-bold text-xl mb-3">Grow Together</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build lasting partnerships and scale your business with reliable talent
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="bg-gradient-to-br from-primary to-accent p-12 md:p-16 rounded-3xl shadow-2xl text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join 10,000+ professionals who trust WorkNest to build exceptional projects
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/95 px-12 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">WorkNest</h3>
              <p className="text-sm text-muted-foreground">
                The premier platform for connecting clients with world-class freelancers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Find Freelancers</li>
                <li>Browse Domains</li>
                <li>How It Works</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Create Profile</li>
                <li>Build Portfolio</li>
                <li>Get Hired</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 WorkNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
