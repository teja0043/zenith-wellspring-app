import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowRight, CheckCircle } from "lucide-react";

// PHQ-9 Questions
const phqQuestions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless", 
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// GAD-7 Questions  
const gadQuestions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things", 
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const answerOptions = [
  { value: "0", label: "Not at all", score: 0 },
  { value: "1", label: "Several days", score: 1 },
  { value: "2", label: "More than half the days", score: 2 },
  { value: "3", label: "Nearly every day", score: 3 }
];

const OnboardingAssessment = () => {
  const navigate = useNavigate();
  const [currentAssessment, setCurrentAssessment] = useState<'phq' | 'gad' | 'complete'>('phq');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [phqAnswers, setPhqAnswers] = useState<number[]>(new Array(9).fill(-1));
  const [gadAnswers, setGadAnswers] = useState<number[]>(new Array(7).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQuestions = currentAssessment === 'phq' ? phqQuestions : gadQuestions;
  const currentAnswers = currentAssessment === 'phq' ? phqAnswers : gadAnswers;
  const totalQuestions = currentQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const getSeverityLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (currentAssessment === 'phq') {
      if (score <= 4) return { level: 'Minimal', color: 'text-success' };
      if (score <= 9) return { level: 'Mild', color: 'text-warning' };
      if (score <= 14) return { level: 'Moderate', color: 'text-destructive' };
      if (score <= 19) return { level: 'Moderately Severe', color: 'text-destructive' };
      return { level: 'Severe', color: 'text-destructive' };
    } else {
      if (score <= 4) return { level: 'Minimal', color: 'text-success' };
      if (score <= 9) return { level: 'Mild', color: 'text-warning' };
      if (score <= 14) return { level: 'Moderate', color: 'text-destructive' };
      return { level: 'Severe', color: 'text-destructive' };
    }
  };

  const handleAnswerSelect = (value: string) => {
    const score = parseInt(value);
    if (currentAssessment === 'phq') {
      const newAnswers = [...phqAnswers];
      newAnswers[currentQuestion] = score;
      setPhqAnswers(newAnswers);
    } else {
      const newAnswers = [...gadAnswers];
      newAnswers[currentQuestion] = score;
      setGadAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // End of current assessment
      if (currentAssessment === 'phq') {
        setCurrentAssessment('gad');
        setCurrentQuestion(0);
      } else {
        setCurrentAssessment('complete');
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    // Calculate scores
    const phqScore = phqAnswers.reduce((sum, score) => sum + score, 0);
    const gadScore = gadAnswers.reduce((sum, score) => sum + score, 0);
    
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store results (would be sent to API)
    localStorage.setItem('onboarding_complete', 'true');
    localStorage.setItem('phq_score', phqScore.toString());
    localStorage.setItem('gad_score', gadScore.toString());
    
    navigate('/dashboard');
  };

  if (currentAssessment === 'complete') {
    const phqScore = phqAnswers.reduce((sum, score) => sum + score, 0);
    const gadScore = gadAnswers.reduce((sum, score) => sum + score, 0);
    const phqSeverity = getSeverityLevel(phqScore, 27);
    const gadSeverity = getSeverityLevel(gadScore, 21);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="gradient-card border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-success rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success-foreground" />
              </div>
              <CardTitle className="text-2xl">Assessment Complete</CardTitle>
              <CardDescription>
                Thank you for completing your wellness check-in
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Results Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Depression Screen (PHQ-9)</h3>
                  <div className="text-2xl font-bold text-primary">{phqScore}/27</div>
                  <div className={`text-sm font-medium ${phqSeverity.color}`}>
                    {phqSeverity.level}
                  </div>
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Anxiety Screen (GAD-7)</h3>
                  <div className="text-2xl font-bold text-secondary-foreground">{gadScore}/21</div>
                  <div className={`text-sm font-medium ${gadSeverity.color}`}>
                    {gadSeverity.level}
                  </div>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-muted/50 p-6 rounded-xl">
                <h3 className="font-semibold mb-4 text-foreground">Your Personalized Recommendations</h3>
                <div className="space-y-3 text-sm">
                  {(phqScore > 9 || gadScore > 9) && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <span>Consider booking a counseling session - professional support can be very helpful</span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Start daily mood tracking to build awareness of your patterns</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary-foreground rounded-full mt-2 flex-shrink-0" />
                    <span>Explore our AI wellness companion for 24/7 support</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-accent-foreground rounded-full mt-2 flex-shrink-0" />
                    <span>Connect with the peer community when you feel ready</span>
                  </div>
                </div>
              </div>

              {/* Crisis Resources */}
              {(phqScore > 14 || gadScore > 14) && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-destructive mb-2">Immediate Support Available</h4>
                  <p className="text-sm text-destructive mb-3">
                    Your scores indicate you may benefit from immediate support. You're not alone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="destructive" size="sm">
                      Crisis Helpline
                    </Button>
                    <Button variant="outline" size="sm">
                      Book Urgent Session
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="gradient-primary text-white px-8 py-6 text-lg rounded-xl"
                >
                  {isSubmitting ? "Setting up your dashboard..." : "Continue to Dashboard"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentAnswer = currentAnswers[currentQuestion];
  const canProceed = currentAnswer !== -1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="gradient-card border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {currentAssessment === 'phq' ? 'Depression Screen (PHQ-9)' : 'Anxiety Screen (GAD-7)'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} of {totalQuestions}
              </span>
            </div>
            
            <Progress value={progress} className="mb-6" />
            
            <CardTitle className="text-xl">
              Over the last 2 weeks, how often have you been bothered by:
            </CardTitle>
            <CardDescription className="text-lg text-foreground mt-2">
              "{currentQuestions[currentQuestion]}"
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <RadioGroup
              value={currentAnswer.toString()}
              onValueChange={handleAnswerSelect}
            >
              {answerOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="text-primary"
                  />
                  <Label 
                    htmlFor={option.value} 
                    className="text-base cursor-pointer flex-1 py-2"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-muted-foreground">
                This assessment helps us understand how to best support you
              </div>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="gradient-primary text-white px-6 py-3 rounded-xl"
              >
                {currentQuestion === totalQuestions - 1 ? (
                  currentAssessment === 'phq' ? (
                    <>Next Assessment <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>View Results <ArrowRight className="w-4 h-4 ml-2" /></>
                  )
                ) : (
                  <>Next Question <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            {currentAssessment === 'phq' 
              ? 'This assessment takes about 3-5 minutes' 
              : 'Almost done! This is the final assessment'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingAssessment;