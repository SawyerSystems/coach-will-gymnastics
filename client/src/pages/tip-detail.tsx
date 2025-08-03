import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateField } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { Tip } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link, useParams } from "wouter";

export default function TipDetail() {
  const { id } = useParams();
  
  const { data: tip, isLoading, error } = useQuery<Tip>({
    queryKey: ['/api/tips', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tips/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tip');
      }
      return response.json();
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Tip Not Found</h1>
            <p className="text-gray-600 mb-8">Sorry, we couldn't find the tip you're looking for.</p>
            <Link href="/tips">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tips
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/tips">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tips
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{tip.category}</Badge>
                <Badge 
                  variant={tip.difficulty === 'Beginner' ? 'default' : 
                          tip.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                >
                  {tip.difficulty}
                </Badge>
              </div>
              
              <CardTitle className="text-3xl mb-4">{tip.title}</CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(getDateField(tip, ['published_at', 'publishedAt']), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-lg max-w-none">
                {/* Main content intro */}
                <p className="mb-8 leading-relaxed text-gray-700 text-lg">
                  {tip.content}
                </p>
                
                {/* Sections */}
                {tip.sections && tip.sections.length > 0 ? (
                  <div className="space-y-8">
                    {tip.sections.map((section, index) => (
                      <div key={index} className="border-l-4 border-purple-400 pl-6">
                        <h3 className="text-xl font-semibold mb-4 text-purple-700">
                          {section.title}
                        </h3>
                        
                        {section.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={section.imageUrl} 
                              alt={section.title}
                              className="w-full max-w-md rounded-lg shadow-md"
                            />
                          </div>
                        )}
                        
                        <div className="mb-4">
                          {section.content.split('\n').map((paragraph, pIndex) => {
                            if (paragraph.trim() === '') return null;
                            
                            if (paragraph.startsWith('- ')) {
                              return (
                                <li key={pIndex} className="ml-4 mb-1 text-gray-700">
                                  {paragraph.slice(2)}
                                </li>
                              );
                            }
                            
                            return (
                              <p key={pIndex} className="mb-3 leading-relaxed text-gray-700">
                                {paragraph}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback to original content display if no sections
                  <div>
                    {tip.content ? tip.content.split('\n').map((paragraph, index) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-purple-800">
                            {paragraph.slice(2, -2)}
                          </h3>
                        );
                      } else if (paragraph.startsWith('- ')) {
                        return (
                          <li key={index} className="ml-4 mb-1">
                            {paragraph.slice(2)}
                          </li>
                        );
                      } else if (paragraph.trim() === '') {
                        return <br key={index} />;
                      } else {
                        return (
                          <p key={index} className="mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        );
                      }
                    }) : (
                      <p className="text-gray-500 italic">Content not available.</p>
                    )}
                  </div>
                )}
              </div>

              {tip.videoUrl && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Practice Video</h3>
                  <div className="aspect-video">
                    <iframe
                      src={tip.videoUrl}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link href="/tips">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View More Tips
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}