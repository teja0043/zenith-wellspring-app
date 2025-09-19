import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, Bot, Calendar, Book } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Clarity Connect</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/signin">
              <Button variant="outline" className="rounded-full">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary text-white rounded-full">Get Started</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="w-20 h-20 gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center animate-soft-pulse">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Your Safe Space for 
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Mental Wellness</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Anonymous, supportive, and always available. Connect with peers, track your mood, 
              and access professional counseling in a judgment-free environment.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-white rounded-full px-8 py-6 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/resources">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg">
                Explore Resources
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Anonymous & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Peer Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Everything You Need for Mental Wellness</h2>
            <p className="text-muted-foreground text-lg">Comprehensive support tools designed with your privacy and wellbeing in mind</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI Wellness Chatbot</CardTitle>
                <CardDescription>
                  Get instant, personalized support with our AI companion trained on evidence-based mental health practices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Professional Counseling</CardTitle>
                <CardDescription>
                  Book sessions with licensed counselors. Video, voice, or in-person options available
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Anonymous Community</CardTitle>
                <CardDescription>
                  Connect with peers who understand. Share experiences and support each other anonymously
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-happy rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Mood Tracking</CardTitle>
                <CardDescription>
                  Track your emotional journey with daily check-ins and watch your virtual wellness companion grow
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-warning-foreground" />
                </div>
                <CardTitle>Crisis Support</CardTitle>
                <CardDescription>
                  Immediate access to crisis helplines and emergency resources when you need them most
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-success-foreground" />
                </div>
                <CardTitle>Wellness Resources</CardTitle>
                <CardDescription>
                  Curated library of videos, podcasts, articles and tools for your mental health journey
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border/20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">Clarity Connect</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Your mental health matters. You're not alone.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/crisis" className="hover:text-foreground transition-colors">Crisis Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;