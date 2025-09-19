import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Users, 
  Book, 
  TrendingUp,
  Bot,
  Star,
  Target
} from "lucide-react";
import { VirtualPet } from "@/components/VirtualPet";
import { QuickMoodCheck } from "@/components/QuickMoodCheck";

// Mock user data - would come from API
const mockUserData = {
  userCode: "U-A7X9M2K8",
  latestPHQ: { score: 8, severity: "Mild", date: "2024-01-15" },
  latestGAD: { score: 6, severity: "Mild", date: "2024-01-15" },
  currentMood: 6,
  streak: 12,
  nextBooking: { 
    date: "2024-01-20", 
    time: "14:00", 
    counselor: "Dr. Sarah Chen",
    type: "Video"
  }
};

const Dashboard = () => {
  const [currentMood, setCurrentMood] = useState(mockUserData.currentMood);
  
  const getMoodStatus = (mood: number) => {
    if (mood <= 2) return { text: "Taking it slow", color: "bg-mood-sad", emoji: "😔" };
    if (mood <= 4) return { text: "Getting by", color: "bg-mood-neutral", emoji: "😐" };
    return { text: "Feeling good", color: "bg-mood-happy", emoji: "😊" };
  };

  const moodStatus = getMoodStatus(currentMood);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="font-mono text-xs">
                  {mockUserData.userCode}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className={`w-3 h-3 rounded-full ${moodStatus.color}`} />
                  <span>{moodStatus.text}</span>
                  <span>{moodStatus.emoji}</span>
                </div>
              </div>
            </div>
            <Button className="gradient-primary text-white rounded-full">
              <Bot className="w-4 h-4 mr-2" />
              Quick Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Wellness Check-ins</span>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Latest PHQ-9</p>
                      <p className="text-2xl font-bold text-foreground">
                        {mockUserData.latestPHQ.score}/27
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs mt-1"
                      >
                        {mockUserData.latestPHQ.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Latest GAD-7</p>
                      <p className="text-2xl font-bold text-foreground">
                        {mockUserData.latestGAD.score}/21
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs mt-1"
                      >
                        {mockUserData.latestGAD.severity}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Take Assessment
                  </Button>
                </CardContent>
              </Card>

              <Card className="gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Next Session</span>
                    <Calendar className="w-5 h-5 text-secondary-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockUserData.nextBooking ? (
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {mockUserData.nextBooking.date} at {mockUserData.nextBooking.time}
                      </p>
                      <p className="text-muted-foreground">
                        {mockUserData.nextBooking.type} session with {mockUserData.nextBooking.counselor}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1">Join Session</Button>
                        <Button size="sm" variant="outline">Reschedule</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground mb-3">No upcoming sessions</p>
                      <Button className="w-full gradient-secondary text-secondary-foreground">
                        Book Counseling
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>What would you like to do today?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                  >
                    <Heart className="w-6 h-6" />
                    <span className="text-sm">Mood Check</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                  >
                    <Bot className="w-6 h-6" />
                    <span className="text-sm">AI Companion</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Community</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                  >
                    <Book className="w-6 h-6" />
                    <span className="text-sm">Resources</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Recent activity and milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-success/10 rounded-lg">
                  <Star className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">12-day mood tracking streak! 🎉</p>
                    <p className="text-sm text-muted-foreground">Keep it up - consistency helps build awareness</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-primary/10 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Completed PHQ-9 assessment</p>
                    <p className="text-sm text-muted-foreground">Your scores show mild symptoms - great work tracking your wellness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pet & Mood */}
          <div className="lg:col-span-4 space-y-6">
            {/* Virtual Pet */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Your Wellness Companion</CardTitle>
                <CardDescription className="text-center">
                  Your pet reflects your recent mood patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <VirtualPet mood={currentMood} />
                <p className="mt-4 text-sm text-muted-foreground">
                  Mood Level: {currentMood}/7 - {moodStatus.text}
                </p>
              </CardContent>
            </Card>

            {/* Quick Mood Check */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Today's Mood Check</CardTitle>
                <CardDescription>
                  How are you feeling right now?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickMoodCheck 
                  currentMood={currentMood}
                  onMoodChange={setCurrentMood}
                />
              </CardContent>
            </Card>

            {/* Streak Counter */}
            <Card className="gradient-secondary border-0 shadow-lg">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-secondary-foreground mb-2">
                  {mockUserData.streak}
                </div>
                <p className="text-secondary-foreground">Days Streak</p>
                <p className="text-xs text-secondary-foreground/70 mt-1">
                  Keep tracking your mood daily!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;