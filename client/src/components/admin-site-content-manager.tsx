import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, Image, Mail, MapPin, Phone, Save, Upload, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SiteContent {
  bannerVideo: string;
  heroImages: string[];
  about: {
    bio: string;
    certifications: string[];
    experience: string;
  };
  contact: {
    phone: string;
    email: string;
    address: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  hours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  apparatus: string[];
  skills: {
    [apparatus: string]: string[];
  };
  sideQuests: string[];
  testimonials: Array<{
    name: string;
    text: string;
    rating: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
}

export function AdminSiteContentManager() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent>({
    bannerVideo: '',
    heroImages: [],
    about: {
      bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson...',
      certifications: ['USA Gymnastics Certified', 'CPR/First Aid Certified', 'Background Checked'],
      experience: 'Nearly 10 years of coaching experience with athletes of all levels'
    },
    contact: {
      phone: '(585) 755-8122',
      email: 'Admin@coachwilltumbles.com',
      address: {
        name: 'Oceanside Gymnastics',
        street: '1935 Ave. del Oro #A',
        city: 'Oceanside',
        state: 'CA',
        zip: '92056'
      }
    },
    hours: {
      Monday: { start: '09:00', end: '17:00', available: true },
      Tuesday: { start: '09:00', end: '17:00', available: true },
      Wednesday: { start: '09:00', end: '17:00', available: true },
      Thursday: { start: '09:00', end: '17:00', available: true },
      Friday: { start: '09:00', end: '17:00', available: true },
      Saturday: { start: '08:00', end: '16:00', available: true },
      Sunday: { start: '10:00', end: '15:00', available: false }
    },
    apparatus: ['Floor Exercise', 'Balance Beam', 'Uneven Bars', 'Vault', 'Trampoline', 'Tumble Track'],
    skills: {
      'Floor Exercise': ['Forward Roll', 'Backward Roll', 'Cartwheel', 'Round Off', 'Handstand'],
      'Balance Beam': ['Straight Line Walk', 'Heel-to-Toe Walk', 'Straight Leg Kick', 'Scale', 'Cartwheel'],
      'Uneven Bars': ['Support Hold', 'Pull-ups', 'Cast', 'Back Hip Circle', 'Glide Swing'],
      'Vault': ['Straight Jump', 'Squat On', 'Straddle On', 'Handstand Flat Back', 'Cartwheel'],
      'Trampoline': ['Seat Drop', 'Knee Drop', 'Front Drop', 'Back Drop', 'Swivel Hips'],
      'Tumble Track': ['Forward Roll', 'Backward Roll', 'Handstand Forward Roll', 'Back Walkover', 'Front Walkover']
    },
    sideQuests: ['Flexibility Training', 'Strength Building', 'Agility Drills', 'Mental Focus', 'Confidence Building'],
    testimonials: [
      {
        name: 'Sarah M.',
        text: 'Coach Will transformed my daughter\'s confidence! She went from shy to performing amazing routines.',
        rating: 5
      },
      {
        name: 'Mike & Lisa P.',
        text: 'Best investment we\'ve made in our son\'s athletic development. Will is patient and encouraging.',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'What age groups do you work with?',
        answer: 'I work with athletes ages 6 and up, from complete beginners to advanced gymnasts preparing for competitive levels.',
        category: 'General'
      },
      {
        question: 'Do you provide equipment?',
        answer: 'Yes! All lessons are conducted at Oceanside Gymnastics with professional-grade equipment including floor, beam, bars, vault, and trampoline.',
        category: 'Equipment'
      },
      {
        question: 'What should my child wear?',
        answer: 'Athletes should wear comfortable athletic clothing they can move freely in. Avoid loose clothing with strings or zippers. Bare feet or gymnastics shoes are recommended.',
        category: 'Preparation'
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('media');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load site content on component mount
  useEffect(() => {
    const loadSiteContent = async () => {
      try {
        const response = await fetch('/api/site-content');
        if (response.ok) {
          const data = await response.json();
          setContent(prevContent => ({
            ...prevContent,
            ...data
          }));
        }
      } catch (error) {
        console.error('Error loading site content:', error);
        toast({
          title: 'Load Error',
          description: 'Failed to load site content. Using default values.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSiteContent();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save content to backend
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (response.ok) {
        toast({
          title: 'Content Saved',
          description: 'Site content has been updated successfully.',
        });
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save site content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path: string, value: any) => {
    setContent(prev => {
      const newContent = { ...prev } as any;
      const keys = path.split('.');
      let current = newContent;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  const addArrayItem = (path: string, item: any) => {
    const current = path.split('.').reduce((obj: any, key: string) => obj[key], content as any);
    if (Array.isArray(current)) {
      updateContent(path, [...current, item]);
    }
  };

  const removeArrayItem = (path: string, index: number) => {
    const current = path.split('.').reduce((obj: any, key: string) => obj[key], content as any);
    if (Array.isArray(current)) {
      updateContent(path, current.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Site Content Management</h2>
          <Button disabled className="btn-athletic-gold">
            <Save className="w-4 h-4 mr-2" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Site Content Management</h2>
        <Button onClick={handleSave} disabled={saving} className="btn-athletic-gold">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Banner Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="banner-video">Video URL or File Path</Label>
                <Input
                  id="banner-video"
                  value={content.bannerVideo}
                  onChange={(e) => updateContent('bannerVideo', e.target.value)}
                  placeholder="https://example.com/video.mp4 or /assets/banner.mp4"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // For now, just show the filename
                        updateContent('bannerVideo', file.name);
                        toast({
                          title: "Video Selected",
                          description: `Selected: ${file.name}`,
                        });
                      }
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      document.getElementById('video-upload')?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
                <Button variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Hero Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.heroImages.map((image, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={image}
                    onChange={(e) => {
                      const newImages = [...content.heroImages];
                      newImages[index] = e.target.value;
                      updateContent('heroImages', newImages);
                    }}
                    placeholder="Image URL or path"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('heroImages', index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('heroImages', '')}
              >
                Add Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Coach Will</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={content.about.bio}
                  onChange={(e) => updateContent('about.bio', e.target.value)}
                  rows={6}
                  placeholder="Tell your story..."
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={content.about.experience}
                  onChange={(e) => updateContent('about.experience', e.target.value)}
                  placeholder="Years of experience and background"
                />
              </div>

              <div>
                <Label>Certifications</Label>
                <div className="space-y-2">
                  {content.about.certifications.map((cert, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={cert}
                        onChange={(e) => {
                          const newCerts = [...content.about.certifications];
                          newCerts[index] = e.target.value;
                          updateContent('about.certifications', newCerts);
                        }}
                        placeholder="Certification name"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeArrayItem('about.certifications', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem('about.certifications', '')}
                  >
                    Add Certification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={content.contact.phone}
                    onChange={(e) => updateContent('contact.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={content.contact.email}
                    onChange={(e) => updateContent('contact.email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Training Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location-name">Facility Name</Label>
                <Input
                  id="location-name"
                  value={content.contact.address.name}
                  onChange={(e) => updateContent('contact.address.name', e.target.value)}
                  placeholder="Gymnastics facility name"
                />
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={content.contact.address.street}
                  onChange={(e) => updateContent('contact.address.street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={content.contact.address.city}
                    onChange={(e) => updateContent('contact.address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={content.contact.address.state}
                    onChange={(e) => updateContent('contact.address.state', e.target.value)}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={content.contact.address.zip}
                    onChange={(e) => updateContent('contact.address.zip', e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hours of Operation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(content.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="font-medium w-24">{day}</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.start}
                      onChange={(e) => updateContent(`hours.${day}.start`, e.target.value)}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={hours.end}
                      onChange={(e) => updateContent(`hours.${day}.end`, e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.available}
                      onChange={(e) => updateContent(`hours.${day}.available`, e.target.checked)}
                    />
                    Available
                  </label>
                </div>
              ))}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Days marked as unavailable will show "Ask us about availability!" on the website.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apparatus & Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {content.apparatus.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeArrayItem('apparatus', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new apparatus"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('apparatus', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button variant="outline">Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Side Quests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {content.sideQuests.map((quest, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {quest}
                    <button
                      onClick={() => removeArrayItem('sideQuests', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new side quest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('sideQuests', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button variant="outline">Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Testimonials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Parent Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => {
                          const newTestimonials = [...content.testimonials];
                          newTestimonials[index].name = e.target.value;
                          updateContent('testimonials', newTestimonials);
                        }}
                        placeholder="Parent name"
                      />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) => {
                          const newTestimonials = [...content.testimonials];
                          newTestimonials[index].rating = Number(e.target.value);
                          updateContent('testimonials', newTestimonials);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Testimonial Text</Label>
                    <Textarea
                      value={testimonial.text}
                      onChange={(e) => {
                        const newTestimonials = [...content.testimonials];
                        newTestimonials[index].text = e.target.value;
                        updateContent('testimonials', newTestimonials);
                      }}
                      placeholder="Parent testimonial..."
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('testimonials', index)}
                  >
                    Remove Testimonial
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('testimonials', { name: '', text: '', rating: 5 })}
              >
                Add Testimonial
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.faqs.map((faq, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Question</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...content.faqs];
                          newFaqs[index].question = e.target.value;
                          updateContent('faqs', newFaqs);
                        }}
                        placeholder="Enter the question"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={faq.category}
                        onChange={(e) => {
                          const newFaqs = [...content.faqs];
                          newFaqs[index].category = e.target.value;
                          updateContent('faqs', newFaqs);
                        }}
                        placeholder="e.g., General, Equipment, Pricing"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...content.faqs];
                        newFaqs[index].answer = e.target.value;
                        updateContent('faqs', newFaqs);
                      }}
                      placeholder="Enter the answer to this question..."
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('faqs', index)}
                  >
                    Remove FAQ
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('faqs', { question: '', answer: '', category: 'General' })}
              >
                Add FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Template Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Email Templates</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Manage all email templates used throughout the platform. Each template is automatically sent based on specific triggers and events.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Parent Authorization</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent when parents need access codes to login</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Session Confirmation</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent after successful payment confirmation</p>
                    <Badge variant="default" className="text-xs">Automatic</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Session Reminder</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent 24 hours before scheduled sessions</p>
                    <Badge variant="default" className="text-xs">Automatic</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Reschedule Confirmation</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent when bookings are rescheduled</p>
                    <Badge variant="default" className="text-xs">Automatic</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Session Cancellation</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent when sessions are cancelled</p>
                    <Badge variant="destructive" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Birthday Email</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent on athlete birthdays</p>
                    <Badge variant="default" className="text-xs">Automatic</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Waiver Reminder</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent when waivers need completion</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Signed Waiver Confirmation</h5>
                    <p className="text-xs text-gray-600 mb-2">Sent after waiver completion with PDF</p>
                    <Badge variant="default" className="text-xs">Automatic</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Reservation Payment</h5>
                    <p className="text-xs text-gray-600 mb-2">Payment links for new athletes</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Waiver Completion</h5>
                    <p className="text-xs text-gray-600 mb-2">Links for waiver completion</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">Safety Information</h5>
                    <p className="text-xs text-gray-600 mb-2">Important safety information links</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                  <div className="bg-white rounded border p-3">
                    <h5 className="font-medium text-sm mb-1">New Tips/Blog Posts</h5>
                    <p className="text-xs text-gray-600 mb-2">Notifications for new content</p>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">🔧 Email Template Editing</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Email templates are currently managed as React components in the <code>/emails</code> directory. 
                  To edit email content, styles, or add new templates:
                </p>
                <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                  <li>Navigate to the <code>/workspaces/coach-will-gymnastics-clean/emails/</code> folder</li>
                  <li>Edit the desired <code>.tsx</code> template file</li>
                  <li>Templates use React Email components for styling</li>
                  <li>Changes are automatically applied after server restart</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">📬 Automatic Email Triggers</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <p><strong>Session Reminders:</strong> Sent daily at ~24 hours before scheduled sessions</p>
                  <p><strong>Birthday Emails:</strong> Sent daily for athletes with birthdays on current date</p>
                  <p><strong>Reschedule Confirmations:</strong> Sent immediately when bookings are rescheduled</p>
                  <p><strong>Payment Confirmations:</strong> Sent via Stripe webhook after successful payments</p>
                  <p><strong>Waiver Confirmations:</strong> Sent immediately after waiver completion</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">📋 Available Email Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p><code>BirthdayEmail.tsx</code> - Birthday wishes</p>
                    <p><code>ManualBookingConfirmation.tsx</code> - Manual booking confirmations</p>
                    <p><code>NewTipOrBlog.tsx</code> - Content notifications</p>
                    <p><code>ParentAuthorization.tsx</code> - Login access codes</p>
                    <p><code>RescheduleConfirmation.tsx</code> - Reschedule confirmations</p>
                    <p><code>ReservationPaymentLink.tsx</code> - Payment links</p>
                    <p><code>SafetyInformationLink.tsx</code> - Safety information</p>
                  </div>
                  <div className="space-y-1">
                    <p><code>SessionCancellation.tsx</code> - Cancellation notices</p>
                    <p><code>SessionConfirmation.tsx</code> - Session confirmations</p>
                    <p><code>SessionFollowUp.tsx</code> - Post-session follow-up</p>
                    <p><code>SessionReminder.tsx</code> - Session reminders</p>
                    <p><code>SignedWaiverConfirmation.tsx</code> - Waiver confirmations</p>
                    <p><code>WaiverCompletionLink.tsx</code> - Waiver completion links</p>
                    <p><code>WaiverReminder.tsx</code> - Waiver reminders</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">⚠️ Email Configuration</h4>
                <p className="text-sm text-red-700 mb-2">
                  Email delivery requires proper configuration of the <code>RESEND_API_KEY</code> environment variable.
                </p>
                <p className="text-sm text-red-700">
                  In development mode, emails are logged to the console instead of being sent.
                  Check the server logs to verify email trigger functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}