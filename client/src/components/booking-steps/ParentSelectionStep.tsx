import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { UserPlus, Users } from "lucide-react";

export function ParentSelectionStep() {
  const { state, updateState, nextStep } = useBookingFlow();

  const handleNewParent = () => {
    updateState({
      parentInfo: null,
      parentId: undefined
    });
    nextStep();
  };

  const handleExistingParent = () => {
    // This will trigger a login flow
    // For now, we'll just proceed to the parent info form
    // but mark it as existing parent mode
    updateState({
      parentInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
      }
    });
    nextStep();
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Parent Information</h2>
        <p className="text-muted-foreground">
          Are you a new parent or do you have an existing account?
        </p>
      </div>

      <div className="grid gap-4 max-w-md mx-auto">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
          onClick={handleNewParent}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">New Parent</h3>
              <p className="text-sm text-muted-foreground">
                Create a new account and enter your information
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-500"
          onClick={handleExistingParent}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Existing Parent</h3>
              <p className="text-sm text-muted-foreground">
                Log in with your existing account information
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
