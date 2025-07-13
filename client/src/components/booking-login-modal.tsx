import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BookingLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (parentData: any) => void;
}

export function BookingLoginModal({ isOpen, onClose, onLoginSuccess }: BookingLoginModalProps) {
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/parent-auth/send-code", { email });
      
      if (response.ok) {
        setShowCodeInput(true);
        toast({
          title: "Code sent!",
          description: "Check your email for the login code"
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!authCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/parent-auth/verify-code", { 
        email, 
        code: authCode 
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Also authenticate into main site if parent has admin access
        try {
          await apiRequest("POST", "/api/auth/parent-cross-auth", { 
            parentId: data.parent?.id,
            parentEmail: data.parent?.email 
          });
        } catch (crossAuthError) {
          // Cross-auth failed but parent auth succeeded, continue
          console.log("Cross-auth failed:", crossAuthError);
        }
        
        toast({
          title: "Welcome back!",
          description: "Login successful"
        });
        onLoginSuccess(data.parent);
      } else {
        const error = await response.json();
        toast({
          title: "Invalid code",
          description: error.message || "Please check your code and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewParent = () => {
    onClose();
    onLoginSuccess(null); // Pass null to indicate new parent flow
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parent Login</DialogTitle>
          <DialogDescription>
            Sign in to continue with your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showCodeInput ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                />
              </div>

              <Button 
                onClick={handleSendCode} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Login Code
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleNewParent}
                className="w-full"
              >
                I'm a New Parent
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  We sent a code to {email}
                </p>
              </div>

              <Button 
                onClick={handleVerifyCode} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Continue
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setShowCodeInput(false);
                  setAuthCode("");
                }}
                className="w-full"
              >
                Use Different Email
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}