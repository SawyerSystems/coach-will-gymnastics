import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import { getDateField } from "@/lib/date-utils";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:id");
  const id = params?.id;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <article>
            {/* Hero Image */}
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg mb-8"
              />
            )}

            {/* Title and Meta */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  variant="secondary"
                  className={`px-3 py-1 rounded-full font-medium ${
                    post.category === 'Tips' ? 'bg-blue-100 text-blue-800' :
                    post.category === 'Story' ? 'bg-purple-100 text-purple-800' :
                    'bg-teal-100 text-teal-800'
                  }`}
                >
                  {post.category}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {getDateField(post, ['published_at', 'publishedAt']).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Coach Will
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  5 min read
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed">
                {post.content ? post.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    // Bold headers
                    return (
                      <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-purple-800">
                        {paragraph.slice(2, -2)}
                      </h3>
                    );
                  } else if (paragraph.startsWith('- ')) {
                    // Bullet points
                    return (
                      <li key={index} className="ml-4 mb-1">
                        {paragraph.slice(2)}
                      </li>
                    );
                  } else if (paragraph.trim() === '') {
                    // Empty lines
                    return <br key={index} />;
                  } else {
                    // Regular paragraphs
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
            </div>
          </article>

          {/* Related Posts */}
          <div className="mt-16 pt-16 border-t">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">Tips</Badge>
                  <h4 className="text-lg font-semibold mb-2">Perfect Your Cartwheel</h4>
                  <p className="text-gray-600 text-sm mb-4">Learn the essential steps to master this fundamental gymnastics skill...</p>
                  <Link href="/tips">
                    <Button size="sm" variant="outline">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">Guide</Badge>
                  <h4 className="text-lg font-semibold mb-2">Building Confidence</h4>
                  <p className="text-gray-600 text-sm mb-4">Discover techniques to help young gymnasts overcome fears and build confidence...</p>
                  <Link href="/blog">
                    <Button size="sm" variant="outline">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}