import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    CheckCircle,
    Clock,
    Facebook,
    Instagram,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Youtube
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  athleteInfo: z.string().min(5, "Please tell us about your athlete"),
  message: z.string().min(10, "Please provide a detailed message"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Ordered days array for consistent display
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch dynamic site content
  const { data: siteContent } = useQuery({
    queryKey: ['/api/site-content'],
    queryFn: () => apiRequest('GET', '/api/site-content').then(res => res.json())
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      athleteInfo: "",
      message: "",
    },
  });

  const submitContact = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you within 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: error.message || "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContact.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
            Reach Out to <span className="text-purple-600">Coach Will</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have more questions or want to chat before booking? I'm here to help every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-xl">
              <CardContent className="p-8">
                {!isSubmitted ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parent/Guardian Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="Your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="athleteInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Athlete's Name & Age</FormLabel>
                              <FormControl>
                                <Input placeholder="Emma, 8 years old" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={4} 
                                  placeholder="Tell us about your athlete's gymnastics experience and goals..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          disabled={submitContact.isPending}
                          className="w-full gym-gradient-blue text-white py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
                        >
                          {submitContact.isPending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out! I'll get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Phone</p>
                        <p className="text-gray-600">{siteContent?.contact?.phone || '(585) 755-8122'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <p className="text-gray-600">{siteContent?.contact?.email || 'Admin@coachwilltumbles.com'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Location</p>
                        <p className="text-gray-600">
                          {siteContent?.contact?.address ? (
                            <>
                              {siteContent.contact.address.name}<br />
                              {siteContent.contact.address.street}<br />
                              {siteContent.contact.address.city}, {siteContent.contact.address.state} {siteContent.contact.address.zip}
                            </>
                          ) : (
                            <>
                              Oceanside Gymnastics<br />
                              1935 Ave. del Oro #A<br />
                              Oceanside, CA 92056
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Hours</p>
                        <div className="text-gray-600">
                          {siteContent?.hours?.hours ? (
                            orderedDays.map((day) => {
                              const hours = siteContent.hours.hours[day.toLowerCase()];
                              
                              // Format time from 24-hour to 12-hour
                              const formatTime = (timeStr: string) => {
                                if (!timeStr) return '';
                                const [hourStr, minutes] = timeStr.split(':');
                                const hour = parseInt(hourStr);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                return `${displayHour}:${minutes} ${ampm}`;
                              };
                              
                              return (
                                <div key={day}>
                                  {day}: {hours?.available && hours.start && hours.end 
                                    ? `${formatTime(hours.start)} - ${formatTime(hours.end)}` 
                                    : 'Ask about availability'}
                                </div>
                              );
                            })
                          ) : (
                            <>
                              Mon/Wed/Fri: 9:00 AM – 4:00 PM<br />
                              Tue/Thu: 9:00 AM – 3:30 PM<br />
                              Sat: 10:00 AM – 2:00 PM<br />
                              Sun: Ask about availability
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Follow Our Journey</h3>
                  <div className="flex space-x-4 mb-6">
                    <Button 
                      size="icon"
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full"
                    >
                      <Instagram className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon"
                      className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full"
                    >
                      <Facebook className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon"
                      className="w-12 h-12 bg-teal-600 hover:bg-teal-700 rounded-full"
                    >
                      <Youtube className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon"
                      className="w-12 h-12 bg-orange-600 hover:bg-orange-700 rounded-full"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>
                  <p className="text-gray-600">
                    Follow me on social media for daily gymnastics tips, student highlights, 
                    and behind-the-scenes content!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Frequently Asked <span className="text-teal-600">Questions</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {(siteContent?.faqs || [
              {
                question: "What age should my child start gymnastics?",
                answer: "Most kids are ready by age 4 or 5 — especially if they're constantly moving, flipping off the couch, or can't sit still. We adapt to each child's pace.",
                category: "General"
              },
              {
                question: "What should they wear?",
                answer: "Leotards or fitted activewear works best. No skirts, baggy clothes, or zippers. Hair up, no jewelry — just comfort and focus.",
                category: "Preparation"
              },
              {
                question: "Do I need to bring anything?",
                answer: "Nope — we provide all the mats, equipment, and safety gear. Just bring a water bottle and good energy.",
                category: "Equipment"
              },
              {
                question: "Can I stay and watch?",
                answer: "Absolutely. We have a designated viewing area in the lobby where parents can comfortably watch and cheer from a distance.",
                category: "General"
              }
            ]).map((faq: any, index: number) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              "I believe every child has a superpower. Gymnastics helps bring it out."
            </blockquote>
            <p className="text-lg text-gray-600">– Coach Will</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Have more questions or want to chat before booking?
            I'm here to help every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg hover:bg-gray-100"
            >
              Start Their Journey
            </Button>
            <Button 
              size="lg"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform transition-all duration-200 shadow-lg"
            >
              Call Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
