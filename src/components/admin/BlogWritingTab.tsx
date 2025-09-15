import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogEditor } from './blog/BlogEditor';
import { SEOToolkit } from './blog/SEOToolkit';
import { MediaManager } from './blog/MediaManager';
import { ContentOrganizer } from './blog/ContentOrganizer';
import { PerformanceInsights } from './blog/PerformanceInsights';
import { PreviewTools } from './blog/PreviewTools';
import { AIOptimizationTools } from './blog/AIOptimizationTools';
import { ContentCalendar } from './blog/ContentCalendar';
import { PenTool, Search, Image, FolderOpen, BarChart3, Eye, Brain, Calendar } from 'lucide-react';

export const BlogWritingTab = () => {
  const [activePost, setActivePost] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Getting Started with Car Warranties',
      status: 'draft',
      author: 'John Smith',
      lastModified: '2025-01-15',
      seoScore: 85,
      readabilityScore: 92
    },
    {
      id: 2,
      title: 'EV Warranty vs Traditional Car Warranties',
      status: 'published',
      author: 'Sarah Johnson',
      lastModified: '2025-01-10',
      seoScore: 78,
      readabilityScore: 88
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Writing Portal</h1>
          <p className="text-gray-600 mt-2">Create, optimize, and publish expert content that performs</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <PenTool className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <PenTool className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg SEO Score</p>
                <p className="text-2xl font-bold">82</p>
              </div>
              <Search className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Views</p>
                <p className="text-2xl font-bold">15.2K</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="organize" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Organize
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Continue working on your latest articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>By {post.author}</span>
                        <span>Modified {post.lastModified}</span>
                        <span>SEO: {post.seoScore}%</span>
                        <span>Readability: {post.readabilityScore}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <BlogEditor />
        </TabsContent>

        <TabsContent value="seo">
          <SEOToolkit />
        </TabsContent>

        <TabsContent value="media">
          <MediaManager />
        </TabsContent>

        <TabsContent value="organize">
          <ContentOrganizer />
        </TabsContent>

        <TabsContent value="insights">
          <PerformanceInsights />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewTools />
        </TabsContent>

        <TabsContent value="ai">
          <AIOptimizationTools />
        </TabsContent>

        <TabsContent value="calendar">
          <ContentCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};