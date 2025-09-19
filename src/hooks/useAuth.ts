import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

interface User {
  userCode: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    if (token) {
      // Validate token and get user info
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      // Mock validation - would verify JWT with API
      const mockUser: User = {
        userCode: 'U-A7X9M2K8',
        role: localStorage.getItem('admin_token') ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      socketService.connect(mockUser.userCode);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      setIsLoading(true);
      
      const response: any = isAdmin 
        ? await apiService.adminLogin({ email, password })
        : await apiService.login({ email, password });

      const tokenKey = isAdmin ? 'admin_token' : 'auth_token';
      localStorage.setItem(tokenKey, response.token);
      
      setUser(response.user);
      socketService.connect(response.user.userCode);
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in",
      });

      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
      return response;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, isAdmin = false, adminCode?: string) => {
    try {
      setIsLoading(true);
      
      if (isAdmin && adminCode) {
        await apiService.verifyAdminCode(adminCode);
      }

      const response: any = isAdmin
        ? await apiService.adminRegister({ email, password, adminCode: adminCode! })
        : await apiService.register({ email, password });

      const tokenKey = isAdmin ? 'admin_token' : 'auth_token';
      localStorage.setItem(tokenKey, response.token);
      
      setUser(response.user);
      socketService.connect(response.user.userCode);
      
      toast({
        title: "Account created!",
        description: `Welcome to MindEasy! ${!isAdmin ? `Your User Code: ${response.user.userCode}` : ''}`,
      });

      navigate(isAdmin ? '/admin/dashboard' : '/onboarding');
      return response;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    setUser(null);
    socketService.disconnect();
    navigate('/');
    
    toast({
      title: "Signed out",
      description: "See you soon!",
    });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
};