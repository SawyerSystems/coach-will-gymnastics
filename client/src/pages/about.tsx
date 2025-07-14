import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, Heart, Star, Users } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  // Fetch dynamic site content
  const { data: siteContent, isLoading } = useQuery({
    queryKey: ["/api/site-content"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/site-content");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const aboutData = siteContent?.about || {
    bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson.',
    experience: 'Nearly 10 years of coaching experience with athletes of all levels',
    certifications: ['USA Gymnastics Certified', 'CPR/First Aid Certified', 'Background Checked']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                Meet <span className="text-purple-600">Coach Will</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {aboutData.bio}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {aboutData.certifications.map((cert: any, index: number) => {
                  const certConfig = [
                    { color: "purple", icon: Award, label: "ACHIEVEMENT UNLOCKED" },
                    { color: "red", icon: Heart, label: "SAFETY CERTIFIED" }, 
                    { color: "green", icon: CheckCircle, label: "VERIFIED COACH" },
                    { color: "orange", icon: Users, label: "EXPERIENCE LEVEL" }
                  ];
                  const config = certConfig[index] || certConfig[0];
                  const Icon = config.icon;
                  
                  return (
                    <div key={index} className={`bg-gradient-to-br from-${config.color}-100 to-${config.color === 'red' ? 'pink' : config.color === 'orange' ? 'yellow' : config.color === 'green' ? 'emerald' : config.color}-200 p-4 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-${config.color}-600 rounded-full flex items-center justify-center shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold text-${config.color}-800`}>{config.label}</p>
                          <p className="text-sm font-bold text-gray-800">{cert}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Experience Level - Always show */}
                <div className="bg-gradient-to-br from-orange-100 to-yellow-200 p-4 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-800">EXPERIENCE LEVEL</p>
                      <p className="text-sm font-bold text-gray-800">{aboutData.experience}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/booking">
                <Button className="gym-gradient-purple text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg">
                  Start Your Journey
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Coach teaching young gymnast" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover" 
              />
              
              {/* Floating testimonial */}
              <Card className="absolute -bottom-6 -left-6 max-w-xs shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">Parent Review</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "My daughter absolutely loves her lessons with Coach Will! 
                    She's gained so much confidence and skill."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">- Sarah M.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              My Coaching <span className="text-blue-600">Philosophy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every child is unique, and my approach reflects that. I believe in creating a positive, 
              encouraging environment where kids can learn, grow, and most importantly, have fun.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fun First</h3>
                <p className="text-gray-600">
                  Gymnastics should be exciting. I create a positive environment where kids are excited to learn new skills every week.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Individual Focus</h3>
                <p className="text-gray-600">
                  Every athlete gets personalized attention and drills tailored to their age, skill level, and learning style.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Progressive Development</h3>
                <p className="text-gray-600">
                  Skills build on skills. We focus on mastering each movement so your child gains confidence with every step.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Experience & <span className="text-teal-600">Qualifications</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Certified Gymnastics Coach</h3>
                <p className="text-gray-600">
                  USA Gymnastics certified with training in developmental progressions and safety.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Nearing 10 Years Experience</h3>
                <p className="text-gray-600">
                  Extensive experience coaching athletes of all ages—from first timers to returning gymnasts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Competition Background</h3>
                <p className="text-gray-600">
                  Has worked with athletes preparing for shows and competitions in multiple states and formats.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Youth Development Focus</h3>
                <p className="text-gray-600">
                  Specialized in building confidence and consistency in young athletes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Certifications */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Certifications & Training</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Badge variant="outline" className="p-3 text-center">
                USA Gymnastics Professional Member
              </Badge>
              <Badge variant="outline" className="p-3 text-center">
                CPR/AED Certified
              </Badge>
              <Badge variant="outline" className="p-3 text-center">
                First Aid Certified
              </Badge>
              <Badge variant="outline" className="p-3 text-center">
                Background Checked
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              What Parents <span className="text-orange-600">Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Coach Will has been amazing with our daughter Emma. She went from being afraid 
                  of cartwheels to confidently doing back handsprings in just 6 months!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Emma's Mom</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "My twins love their semi-private lessons. Coach Will makes learning fun while 
                  keeping them challenged. Highly recommend!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Maria Rodriguez</p>
                    <p className="text-sm text-gray-600">Alex & Sam's Mom</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The best investment we've made for our son's confidence and physical development. 
                  Coach Will is patient, encouraging, and truly cares about each child."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    D
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">David Chen</p>
                    <p className="text-sm text-gray-600">Lily's Dad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Meet Coach Will?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Schedule your athlete's first lesson today and see why families trust Coach Will's approach to gymnastics and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button 
                size="lg"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-200 shadow-lg hover:bg-gray-100"
              >
                Start Journey
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transform transition-all duration-200 shadow-lg"
              >
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
