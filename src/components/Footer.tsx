import { Link, useLocation } from "react-router-dom";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    Mail,
    MapPin,
    Phone,
    ArrowRight,
    Globe
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const location = useLocation();

    const allowedPaths = ["/", "/dashboard"];
    if (!allowedPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="text-3xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent inline-block">
                            WorkNest
                        </Link>
                        <p className="text-sm leading-relaxed max-w-sm font-medium italic">
                            A full-stack freelance marketplace developed by Kishore J. Showcasing modern web development, scalable architecture, and premium UI design.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.linkedin.com/in/kishore-j11" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-lg group">
                                <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://github.com/Johnkishore11" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-lg group">
                                <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://www.instagram.com/__johnkishore__/" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-lg group">
                                <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em]">App Features</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    Browse Talent
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    User Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/messages" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    Real-time Chat
                                </Link>
                            </li>
                            <li>
                                <Link to="/auth" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    Authentication
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em]">Tech Stack</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://react.dev" target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    React & Vite
                                </a>
                            </li>
                            <li>
                                <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    Tailwind CSS
                                </a>
                            </li>
                            <li>
                                <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    Node.js & Express
                                </a>
                            </li>
                            <li>
                                <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                    MongoDB Atlas
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em]">Hire Me</h4>
                        <p className="text-sm font-medium italic">
                            Currently open for new roles and freelance opportunities. Let's build something great together.
                        </p>
                        <div className="pt-2 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Hosur, Tamil Nadu</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <Globe className="h-4 w-4 text-primary" />
                                <span>Kishore J</span>
                            </div>
                            <div className="mt-4">
                                <Button className="w-full h-12 rounded-xl shadow-lg font-bold shadow-primary/20 hover:scale-105 transition-transform" onClick={() => window.location.href = 'mailto:johnkishore43@gmail.com'}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Get In Touch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-600">
                        &copy; {currentYear} BUILT WITH ❤️ BY KISHORE J.
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="https://github.com/Johnkishore11" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">GitHub</a>
                        <a href="https://github.com/Johnkishore11" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Portfolio</a>
                        <a href="https://www.linkedin.com/in/kishore-j11" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Resume</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
