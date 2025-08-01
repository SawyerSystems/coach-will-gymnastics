import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SetPasswordPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setTokenError("Missing password reset token. Please use the link from your email.");
    }
  }, [token]);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    if (!token) {
      setError("Missing password reset token");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/parent-auth/set-password', {
        token,
        password: values.password,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to set password");
      }
    } catch (err) {
      console.error("Error setting password:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    setLocation('/parent-login');
  };

  if (tokenError) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Invalid Token</CardTitle>
            <CardDescription>
              {tokenError}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/parent-login')} className="w-full">
              Go to Login Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4">Password Set Successfully</CardTitle>
            <CardDescription>
              Your password has been set. You can now log in to your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleLogin} className="w-full">
              Go to Login Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Set Your Password</CardTitle>
          <CardDescription className="text-center">
            Create a password for your Coach Will Tumbles account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  "Set Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
