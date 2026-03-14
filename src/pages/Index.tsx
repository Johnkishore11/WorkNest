import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500 hover:bg-primary/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The #1 Platform for Hiring Freelancers
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Find Your Perfect <br className="hidden md:block" />
            <span className="text-gradient">Freelancer Match</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Connect with top-tier professionals across 50+ domains.
            Build exceptional projects with the world's best talent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
            >
              Start Hiring Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 rounded-xl backdrop-blur-md bg-background/50 border-primary/20 hover:bg-muted/50 transition-all hover:scale-105"
            >
              Join as Freelancer
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Why Professionals Choose <span className="text-gradient">WorkNest</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the ecosystem you need to build, scale, and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6 text-primary" />,
                title: "Smart Matching",
                description: "Our AI-driven matching system pairs you with the perfect talent for your specific needs."
              },
              {
                icon: <Briefcase className="w-6 h-6 text-accent" />,
                title: "Verified Portfolios",
                description: "Every freelancer is vetted. Review detailed portfolios and past project success rates."
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
                title: "Seamless Chat",
                description: "Connect instantly. Our integrated messaging ensures smooth communication and collaboration."
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
                title: "Growth Focused",
                description: "Tools and insights designed to help both clients and freelancers scale their business."
              }
            ].map((feature, index) => (
              <Card key={index} className="glass dark:glass-dark border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-background shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Freelancers" },
              { number: "50+", label: "Skill Domains" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-foreground/80 text-sm md:text-base font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="glass dark:glass-dark p-12 md:p-20 rounded-3xl shadow-2xl border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg md:text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
                Join 10,000+ professionals who trust WorkNest to build exceptional projects.
                Get started today and experience the future of work.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Get Started for Free
              </Button>
            </div>
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
