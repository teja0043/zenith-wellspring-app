import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";

const AdminAccess = () => {
  const navigate = useNavigate();
  const [adminCode, setAdminCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Check against the admin gate code (admin4u)
      if (adminCode === "admin4u") {
        setIsCodeVerified(true);
        setShowSignIn(true);
      } else {
        throw new Error("Invalid admin access code");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store admin auth token
      localStorage.setItem('admin_token', 'mock_admin_jwt_token');
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCodeVerified) {
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
              <div className="w-16 h-16 bg-warning rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-warning-foreground" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Enter the admin access code to continue
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

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Access Code</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter admin code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    className="rounded-xl font-mono text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    This code is provided to authorized administrators only
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full gradient-primary text-white rounded-xl py-6 text-lg"
                >
                  {isLoading ? "Verifying..." : "Verify Access"}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground">
                  Are you a student looking for support?{" "}
                  <Link 
                    to="/signup" 
                    className="text-primary font-medium hover:underline"
                  >
                    Create a student account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => {
              setIsCodeVerified(false);
              setShowSignIn(false);
              setAdminCode("");
              setError("");
            }}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to code entry
          </button>
        </div>

        <Card className="gradient-card border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {showSignIn ? "Admin Sign In" : "Create Admin Account"}
            </CardTitle>
            <CardDescription>
              {showSignIn 
                ? "Sign in to access the admin dashboard" 
                : "Set up your administrator account"
              }
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

            <form onSubmit={(e) => handleAuthSubmit(e, !showSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={showSignIn ? "Enter password" : "Create password"}
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

              {!showSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="rounded-xl"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full gradient-primary text-white rounded-xl py-6 text-lg"
              >
                {isLoading 
                  ? (showSignIn ? "Signing in..." : "Creating Account...") 
                  : (showSignIn ? "Sign In" : "Create Account")
                }
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowSignIn(!showSignIn);
                  setError("");
                  setFormData({ email: "", password: "", confirmPassword: "" });
                }}
                className="text-sm text-primary hover:underline"
              >
                {showSignIn 
                  ? "Need to create an admin account?" 
                  : "Already have an admin account?"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            Admin accounts have elevated privileges to manage the platform and support students.
            Only authorized personnel should access this area.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;