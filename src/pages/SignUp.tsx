import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ArrowLeft, Eye, EyeOff, Shield, Users, Bot } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userCode, setUserCode] = useState("");

  // Generate mock user code (would be done server-side)
  const generateUserCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'U-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      throw new Error('Please fill in all fields');
    }
    if (formData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (!agreedToTerms) {
      throw new Error('Please agree to the terms and privacy policy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      validateForm();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate user code
      const newUserCode = generateUserCode();
      setUserCode(newUserCode);
      
      // Store auth token
      localStorage.setItem('auth_token', 'mock_jwt_token');
      localStorage.setItem('user_code', newUserCode);
      
      // Would redirect to onboarding PHQ/GAD assessments
      setTimeout(() => {
        navigate('/onboarding');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Show user code after successful registration
  if (userCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md gradient-card border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success rounded-2xl mx-auto mb-4 flex items-center justify-center animate-soft-pulse">
              <Shield className="w-8 h-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl text-success-foreground">Welcome to Clarity Connect!</CardTitle>
            <CardDescription>Your account has been created successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-success/10 p-6 rounded-xl border-2 border-dashed border-success/30">
              <p className="text-sm font-medium text-foreground mb-2">Your Anonymous User Code</p>
              <div className="text-2xl font-bold font-mono text-success bg-success/5 py-3 px-4 rounded-lg">
                {userCode}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Save this code! It's your only identifier - no personal info needed.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-left">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Your identity is completely anonymous</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <Users className="w-5 h-5 text-secondary-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Connect safely with the community</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <Bot className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">AI support personalized to you</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to your wellness assessment...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>

        <Card className="gradient-card border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Join Clarity Connect</CardTitle>
            <CardDescription>
              Start your anonymous mental wellness journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-destructive/20 bg-destructive/10">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Only used for authentication - never shared publicly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full gradient-primary text-white rounded-xl py-6 text-lg"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/signin" 
                  className="text-primary font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </div>

              <div className="pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-3">
                  Need immediate support?
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                >
                  Crisis Resources
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Features */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Anonymous user code instead of personal info</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Safe, judgment-free peer community</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Bot className="w-4 h-4" />
            <span>24/7 AI companion for support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;