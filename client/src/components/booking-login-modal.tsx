import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface BookingLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (parentData: any) => void;
}

export function BookingLoginModal({ isOpen, onClose, onLoginSuccess }: BookingLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/parent-auth/login", { 
        email, 
        password 
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Also authenticate into main site if parent has admin access
        try {
          await apiRequest("POST", "/api/auth/parent-cross-auth", { 
            parentId: data.parentId,
            parentEmail: data.parentEmail 
          });
        } catch (crossAuthError) {
          // Cross-auth failed but parent auth succeeded, continue
          console.log("Cross-auth failed:", crossAuthError);
        }
        
        toast({
          title: "Welcome back!",
          description: "Login successful"
        });
        
        // Create parent object from login response
        const parentData = {
          id: data.parentId,
          email: data.parentEmail
        };
        
        onLoginSuccess(parentData);
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Login failed",
          description: error.error || "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
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
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
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
        </div>
      </DialogContent>
    </Dialog>
  );
}