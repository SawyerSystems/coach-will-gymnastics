import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const relationshipOptions = [
  "Parent", 
  "Guardian", 
  "Grandparent", 
  "Aunt/Uncle", 
  "Sibling", 
  "Family Friend", 
  "Other"
];

const safetyInfoSchema = z.object({
  dropoffPersonName: z.string().min(1, "Dropoff person name is required"),
  dropoffPersonRelationship: z.string().min(1, "Dropoff person relationship is required"),
  dropoffPersonPhone: z.string().min(1, "Dropoff person phone is required"),
  pickupPersonName: z.string().min(1, "Pickup person name is required"),
  pickupPersonRelationship: z.string().min(1, "Pickup person relationship is required"),
  pickupPersonPhone: z.string().min(1, "Pickup person phone is required"),
  altPickupPersonName: z.string().optional(),
  altPickupPersonRelationship: z.string().optional(),
  altPickupPersonPhone: z.string().optional(),
  updateCurrentBookings: z.boolean().default(false),
});

type SafetyInfoData = z.infer<typeof safetyInfoSchema>;

interface SafetyInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentInfo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // Safety info if already set
    dropoffPersonName?: string;
    dropoffPersonRelationship?: string;
    dropoffPersonPhone?: string;
    pickupPersonName?: string;
    pickupPersonRelationship?: string;
    pickupPersonPhone?: string;
    altPickupPersonName?: string;
    altPickupPersonRelationship?: string;
    altPickupPersonPhone?: string;
  };
  hasCurrentBookings: boolean;
}

export function SafetyInformationDialog({
  open,
  onOpenChange,
  parentInfo,
  hasCurrentBookings,
}: SafetyInfoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SafetyInfoData>({
    resolver: zodResolver(safetyInfoSchema),
    defaultValues: {
      dropoffPersonName: parentInfo?.dropoffPersonName || parentInfo?.firstName + " " + parentInfo?.lastName || "",
      dropoffPersonRelationship: parentInfo?.dropoffPersonRelationship || "Parent",
      dropoffPersonPhone: parentInfo?.dropoffPersonPhone || parentInfo?.phone || "",
      pickupPersonName: parentInfo?.pickupPersonName || parentInfo?.firstName + " " + parentInfo?.lastName || "",
      pickupPersonRelationship: parentInfo?.pickupPersonRelationship || "Parent",
      pickupPersonPhone: parentInfo?.pickupPersonPhone || parentInfo?.phone || "",
      altPickupPersonName: parentInfo?.altPickupPersonName || "",
      altPickupPersonRelationship: parentInfo?.altPickupPersonRelationship || "",
      altPickupPersonPhone: parentInfo?.altPickupPersonPhone || "",
      updateCurrentBookings: false,
    },
  });

  const onSubmit = async (data: SafetyInfoData) => {
    try {
      setIsSubmitting(true);
      
      // Save safety information to parent profile
      await apiRequest("POST", "/api/parent/safety-info", data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/parent/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/bookings"] });
      
      toast({
        title: "Safety Information Updated",
        description: data.updateCurrentBookings 
          ? "Your safety information and current bookings have been updated."
          : "Your safety information has been updated.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update safety information:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your safety information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-xl md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
        <DialogHeader className="px-0 pt-0">
          <DialogTitle className="text-xl md:text-2xl text-blue-900">Safety Information</DialogTitle>
          <DialogDescription className="text-sm md:text-base text-gray-700">
            Set who is authorized for pickup and dropoff at your gymnastics sessions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dropoff Person */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Authorized Dropoff Person</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dropoffPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dropoffPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dropoffPersonRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Athlete</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pickup Person */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Authorized Pickup Person</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pickupPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pickupPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pickupPersonRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Athlete</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Alternative Pickup Person */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Alternative Pickup Person (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="altPickupPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="altPickupPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="altPickupPersonRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Athlete</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Option to update current bookings */}
            {hasCurrentBookings && (
              <FormField
                control={form.control}
                name="updateCurrentBookings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-amber-50 p-4 rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium text-amber-800">Update Current Bookings</FormLabel>
                      <p className="text-sm text-amber-700">
                        Apply these safety details to all your upcoming bookings
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Save Safety Information"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
