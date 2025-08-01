import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (!token) {
          setError("Verification token is missing. Please check your email link.");
          setLoading(false);
          return;
        }
        
        // Call the API to verify the email
        const response = await apiRequest('GET', `/api/parent-auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.error || "Failed to verify your email. Please try again.");
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setError("An error occurred during verification. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {loading ? (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          ) : success ? (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          ) : (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">
            {loading ? "Verifying Your Email" : success ? "Email Verified Successfully" : "Verification Failed"}
          </CardTitle>
          
          <CardDescription>
            {loading 
              ? "Please wait while we verify your email address..."
              : success 
                ? "Your email has been successfully verified. You can now log in to your account."
                : error
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!loading && (
            <div className="flex flex-col gap-3 pt-4">
              {success ? (
                <Button 
                  variant="default"
                  className="w-full" 
                  onClick={() => setLocation('/parent/login')}
                >
                  Go to Login Page
                </Button>
              ) : (
                <Button 
                  variant="default"
                  className="w-full" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
