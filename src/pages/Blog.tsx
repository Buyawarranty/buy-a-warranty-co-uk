import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, ArrowRight, ExternalLink, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: string;
  read_time_minutes: number;
  is_featured: boolean;
  blog_authors: { name: string } | null;
  blog_categories: { name: string } | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    loadBlogData();
  }, [selectedCategory, searchQuery]);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      // Load featured post
      const { data: featuredData } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_authors(name),
          blog_categories(name)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (featuredData) setFeaturedPost(featuredData);

      // Load other posts
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_authors(name),
          blog_categories(name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data: postsData, error } = await query;

      if (error) throw error;
      if (postsData) setPosts(postsData.filter(p => !p.is_featured));

      // Load categories
      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesData) setCategories(categoriesData);
    } catch (error: any) {
      toast.error('Failed to load blog posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const { error } = await supabase
        .from('newsletter_signups')
        .insert([{ email: newsletterEmail, source: 'blog' }]);

      if (error) throw error;
      toast.success('Thanks for subscribing!');
      setNewsletterEmail('');
    } catch (error: any) {
      toast.error('Failed to subscribe');
    }
  };

  return (
    <>
      <SEOHead 
        title="The Warranty Hub - Expert Car Warranty Advice & Tips | Buy a Warranty"
        description="Get expert advice on car warranties, maintenance tips, and driving guides. Learn how to protect your vehicle and save money on repairs with our UK car warranty experts."
        keywords="UK car warranty, vehicle repair costs, car protection plans, affordable car cover, driving tips, car maintenance"
        canonical="https://buyawarranty.co.uk/thewarrantyhub"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#224380] to-[#2a5299] text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                The Warranty Hub
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-blue-100">
                Your trusted source for car warranty advice and driving tips
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/90 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Featured Article */}
          {featuredPost && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Article</h2>
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="md:flex">
                  {featuredPost.featured_image_url && (
                    <div className="md:w-1/2">
                      <img 
                        src={featuredPost.featured_image_url}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {featuredPost.blog_categories?.name}
                      </Badge>
                      <span className="text-gray-500 text-sm">{featuredPost.read_time_minutes} min read</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 text-lg">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#224380] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{featuredPost.blog_authors?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(featuredPost.published_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        asChild
                        className="bg-[#224380] hover:bg-[#1a3464] text-white"
                      >
                        <Link to={`/thewarrantyhub/${featuredPost.slug}`}>
                          Read Full Article
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Posts</h2>
              
              {loading ? (
                <div className="text-center py-12">Loading articles...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No articles found</div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        {post.featured_image_url && (
                          <div className="md:w-1/3">
                            <img 
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`${post.featured_image_url ? 'md:w-2/3' : 'w-full'} p-6`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {post.blog_categories?.name}
                            </Badge>
                            <span className="text-gray-500 text-sm">{post.read_time_minutes} min read</span>
                          </div>
                          
                          <Link to={`/thewarrantyhub/${post.slug}`}>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#224380] cursor-pointer">
                              {post.title}
                            </h3>
                          </Link>
                          
                          <p className="text-gray-600 mb-4">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{post.blog_authors?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(post.published_at).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            </div>
                            
                            <Button 
                              asChild
                              variant="outline" 
                              size="sm"
                            >
                              <Link to={`/thewarrantyhub/${post.slug}`}>
                                Read More
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <Button 
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Posts
                  </Button>
                  {categories.map((category) => (
                    <Button 
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start text-left hover:bg-blue-50"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-[#224380] to-[#2a5299] text-white">
                <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get the latest car warranty tips and driving advice delivered to your inbox.
                </p>
                <form onSubmit={handleNewsletterSignup} className="space-y-3">
                  <Input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm"
                    required
                  />
                  <Button type="submit" className="w-full bg-white text-[#224380] hover:bg-gray-100">
                    Subscribe
                  </Button>
                </form>
              </Card>

              {/* Helpful Links */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Helpful Resources</h3>
                <div className="space-y-3">
                  <a 
                    href="https://www.rac.co.uk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#224380] hover:underline text-sm"
                  >
                    RAC Breakdown Services
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.theaa.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#224380] hover:underline text-sm"
                  >
                    AA Motoring Services
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.gov.uk/browse/driving" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#224380] hover:underline text-sm"
                  >
                    GOV.UK Driving & Transport
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link 
                    to="/faq"
                    className="flex items-center gap-2 text-[#224380] hover:underline text-sm"
                  >
                    Warranty FAQs
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <section className="mt-16 bg-gradient-to-r from-[#224380] to-[#2a5299] rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Protect Your Vehicle?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Get your free quote in 60 seconds and join thousands of UK drivers who've already protected their vehicles.
            </p>
            <Button 
              asChild
              className="bg-[#eb4b00] hover:bg-[#d43e00] text-white px-8 py-3 text-lg"
            >
              <Link to="/">
                Get Your Quote Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Blog;