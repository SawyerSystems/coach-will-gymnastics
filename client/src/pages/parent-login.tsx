import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const codeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export default function ParentLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Check if already logged in
  const { data: authStatus } = useQuery<{ loggedIn: boolean; parentId?: number; email?: string }>({
    queryKey: ['/api/parent-auth/status'],
  });

  // Send code mutation
  const sendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/parent-auth/send-code', { email });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send code');
      }
      return response.json();
    },
    onSuccess: () => {
      setStep('code');
      toast({
        title: 'Code Sent!',
        description: 'Please check your email for the 6-digit login code.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Verify code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const response = await apiRequest('POST', '/api/parent-auth/verify-code', { email, code });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify code');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: 'Login Successful!',
        description: 'Welcome to your parent dashboard.',
      });
      
      // Invalidate auth status to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ['/api/parent-auth/status'] });
      
      // Small delay to ensure session is established
      setTimeout(() => {
        setLocation('/parent-dashboard');
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: 'Invalid Code',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (authStatus && authStatus.loggedIn) {
      setLocation('/parent-dashboard');
    }
  }, [authStatus, setLocation]);

  // Show loading while checking auth status
  if (authStatus === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If logged in, show loading while redirecting
  if (authStatus && authStatus.loggedIn) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: 'Invalid Email',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }
    sendCodeMutation.mutate(email);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = codeSchema.safeParse({ email, code });
    if (!result.success) {
      toast({
        title: 'Invalid Code',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }
    verifyCodeMutation.mutate({ email, code });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            {step === 'email' ? (
              <Mail className="h-8 w-8 text-white" />
            ) : (
              <Lock className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {step === 'email' ? 'Parent Login' : 'Enter Code'}
          </CardTitle>
          <p className="text-gray-600">
            {step === 'email' 
              ? 'Enter your email to receive a login code'
              : `We sent a 6-digit code to ${email}`
            }
          </p>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={sendCodeMutation.isPending}
              >
                {sendCodeMutation.isPending ? (
                  'Sending Code...'
                ) : (
                  <>
                    Send Login Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">6-Digit Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    className="pl-10 text-center text-lg tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyCodeMutation.isPending || code.length !== 6}
              >
                {verifyCodeMutation.isPending ? (
                  'Verifying...'
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Access Dashboard
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                  }}
                  className="text-sm text-gray-600"
                >
                  Use different email
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => sendCodeMutation.mutate(email)}
                  disabled={sendCodeMutation.isPending}
                  className="text-sm text-purple-600"
                >
                  Resend code
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setLocation('/')}
              className="text-sm text-gray-600"
            >
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}