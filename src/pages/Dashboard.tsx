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
  Target,
  Download,
  Trash2
} from "lucide-react";
import { VirtualPet } from "@/components/VirtualPet";
import { QuickMoodCheck } from "@/components/QuickMoodCheck";
import { useAuth } from "@/hooks/useAuth";
import { useMood } from "@/hooks/useMood";
import { useAssessments } from "@/hooks/useAssessments";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { currentMood, streak, submitMood } = useMood();
  const { getLatestAssessment, loadHistory } = useAssessments();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const latestPHQ = getLatestAssessment('phq');
  const latestGAD = getLatestAssessment('gad');
  
  const getMoodStatus = (mood: number) => {
    if (mood <= 2) return { text: "Taking it slow", color: "bg-mood-sad", emoji: "😔" };
    if (mood <= 4) return { text: "Getting by", color: "bg-mood-neutral", emoji: "😐" };
    return { text: "Feeling good", color: "bg-mood-happy", emoji: "😊" };
  };

  const handleQuickAction = async (action: string) => {
    setIsLoadingAction(true);
    try {
      switch (action) {
        case 'assessment':
          navigate('/onboarding');
          break;
        case 'chatbot':
          navigate('/chatbot');
          break;
        case 'community':
          navigate('/community');
          break;
        case 'resources':
          navigate('/resources');
          break;
        case 'booking':
          navigate('/booking');
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoadingAction(true);
    try {
      // Mock data export
      const data = {
        userCode: user?.userCode,
        moodHistory: [],
        assessmentHistory: [],
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindeasy-data-${user?.userCode}.json`;
      a.click();
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsLoadingAction(true);
      try {
        // Mock account deletion
        toast({
          title: "Account deleted",
          description: "Your account and all data have been removed",
        });
        logout();
      } catch (error) {
        toast({
          title: "Deletion failed",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAction(false);
      }
    }
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
                  {user?.userCode || 'Loading...'}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className={`w-3 h-3 rounded-full ${moodStatus.color}`} />
                  <span>{moodStatus.text}</span>
                  <span>{moodStatus.emoji}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleQuickAction('chatbot')}
                disabled={isLoadingAction}
                className="gradient-primary text-white rounded-full"
              >
                <Bot className="w-4 h-4 mr-2" />
                Quick Chat
              </Button>
              <Button 
                onClick={logout}
                variant="outline" 
                size="sm"
                className="rounded-full"
              >
                Sign Out
              </Button>
            </div>
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
                        {latestPHQ?.score || 0}/27
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs mt-1"
                      >
                        {latestPHQ?.severity || 'Not taken'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Latest GAD-7</p>
                      <p className="text-2xl font-bold text-foreground">
                        {latestGAD?.score || 0}/21
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs mt-1"
                      >
                        {latestGAD?.severity || 'Not taken'}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleQuickAction('assessment')}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? 'Loading...' : 'Take Assessment'}
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
                  <div>
                    <p className="text-muted-foreground mb-3">No upcoming sessions</p>
                    <Button 
                      className="w-full gradient-secondary text-secondary-foreground"
                      onClick={() => handleQuickAction('booking')}
                      disabled={isLoadingAction}
                    >
                      {isLoadingAction ? 'Loading...' : 'Book Counseling'}
                    </Button>
                  </div>
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
                    onClick={() => handleQuickAction('mood')}
                    disabled={isLoadingAction}
                  >
                    <Heart className="w-6 h-6" />
                    <span className="text-sm">Mood Check</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleQuickAction('chatbot')}
                    disabled={isLoadingAction}
                  >
                    <Bot className="w-6 h-6" />
                    <span className="text-sm">AI Companion</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleQuickAction('community')}
                    disabled={isLoadingAction}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Community</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleQuickAction('resources')}
                    disabled={isLoadingAction}
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
                    <p className="font-medium text-foreground">{streak.current}-day mood tracking streak! 🎉</p>
                    <p className="text-sm text-muted-foreground">Keep it up - consistency helps build awareness</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-primary/10 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {latestPHQ ? 'Completed PHQ-9 assessment' : 'Ready to start your wellness journey'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {latestPHQ 
                        ? `Your scores show ${latestPHQ.severity.toLowerCase()} symptoms - great work tracking your wellness`
                        : 'Take your first assessment to get personalized insights'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Account Management */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-foreground">Account</h4>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDataExport}
                        disabled={isLoadingAction}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export Data
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={isLoadingAction}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Account
                      </Button>
                    </div>
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
                  onMoodChange={submitMood}
                />
              </CardContent>
            </Card>

            {/* Streak Counter */}
            <Card className="gradient-secondary border-0 shadow-lg">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-secondary-foreground mb-2">
                  {streak.current}
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