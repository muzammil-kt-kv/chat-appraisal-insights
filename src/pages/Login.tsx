import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Crown } from 'lucide-react';
import corporateHeader from '@/assets/corporate-header.jpg';

interface LoginFormData {
  email: string;
  password: string;
  role: 'employee' | 'team-lead' | 'hr' | null;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleSelect = (role: 'employee' | 'team-lead' | 'hr') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a role.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Replace with actual Supabase authentication
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${formData.role} dashboard...`
      });
      
      // TODO: Redirect to appropriate dashboard based on role
      console.log('Redirecting to:', formData.role, 'dashboard');
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfig = {
    employee: {
      title: 'Employee Login',
      description: 'Access your self-appraisal portal',
      icon: User,
      variant: 'employee' as const,
      bgClass: 'bg-employee-muted'
    },
    'team-lead': {
      title: 'Team Lead Login',
      description: 'Review and approve team appraisals',
      icon: Shield,
      variant: 'team-lead' as const,
      bgClass: 'bg-team-lead-muted'
    },
    hr: {
      title: 'HR Login',
      description: 'Access comprehensive analytics dashboard',
      icon: Crown,
      variant: 'hr' as const,
      bgClass: 'bg-hr-muted'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-32 bg-gradient-corporate overflow-hidden">
        <img 
          src={corporateHeader} 
          alt="Corporate header" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Performance Appraisal System</h1>
            <p className="text-blue-100">Secure role-based access portal</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Role Selection */}
          {!formData.role && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Your Role</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <Card 
                      key={role}
                      className="cursor-pointer hover:shadow-role transition-shadow duration-200 border-2 hover:border-primary/50"
                      onClick={() => handleRoleSelect(role as any)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 mx-auto rounded-full ${config.bgClass} flex items-center justify-center mb-4`}>
                          <IconComponent className="w-8 h-8 text-foreground" />
                        </div>
                        <CardTitle className="text-xl">{config.title}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login Form */}
          {formData.role && (
            <div className="max-w-md mx-auto">
              <Card className="shadow-medium">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${roleConfig[formData.role].bgClass} flex items-center justify-center mb-4`}>
                    {(() => {
                      const IconComponent = roleConfig[formData.role].icon;
                      return <IconComponent className="w-8 h-8 text-foreground" />;
                    })()}
                  </div>
                  <CardTitle className="text-2xl">{roleConfig[formData.role].title}</CardTitle>
                  <CardDescription>{roleConfig[formData.role].description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <Separator className="my-6" />

                    <Button 
                      type="submit" 
                      variant={roleConfig[formData.role].variant}
                      className="w-full h-12 text-base font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : `Sign In as ${roleConfig[formData.role].title.replace(' Login', '')}`}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setFormData({ email: '', password: '', role: null })}
                    >
                      Choose Different Role
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Supabase Integration Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> To enable authentication and backend functionality, connect this project to Supabase using the integration button in the top right.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;