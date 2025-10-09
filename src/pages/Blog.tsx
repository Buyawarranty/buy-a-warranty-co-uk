import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, ArrowRight, ExternalLink, Search, Shield, Clock, Award, MapPin, CheckCircle2, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import pandaHeroImage from '@/assets/panda-car-warranty-hero.png';

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

  // Schema markup for SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Warranty Hub",
    "description": "Expert car warranty advice, vehicle maintenance tips, and driving guides for UK motorists",
    "url": "https://buyawarranty.co.uk/thewarrantyhub",
    "publisher": {
      "@type": "Organization",
      "name": "Buy a Warranty",
      "logo": {
        "@type": "ImageObject",
        "url": "https://buyawarranty.co.uk/lovable-uploads/baw-logo-new-2025.png"
      }
    }
  };

  return (
    <>
      <SEOHead 
        title="Best Car Warranty UK | Expert Vehicle Protection Advice & Tips"
        description="Get expert advice on car warranties across the UK. Compare car and van warranties in Manchester, Birmingham, London & nationwide. Affordable cover and peace of mind today."
        keywords="best car warranty UK, UK car warranty advice, car warranty Manchester, vehicle warranty Birmingham, van warranty London, car protection plans UK, affordable car cover UK, driving tips UK, car maintenance UK, used car warranty UK"
        canonical="https://buyawarranty.co.uk/thewarrantyhub"
        ogImage={pandaHeroImage}
      />
      
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="min-h-screen bg-background">
        {/* Sticky Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-lg font-bold text-primary hover:text-primary/80">
                Buy a Warranty
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link to="/thewarrantyhub" className="font-semibold text-primary">Warranty Guides</Link>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQs</Link>
                <Link to="/claims" className="text-muted-foreground hover:text-foreground">Claims</Link>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
              </nav>
              <Button asChild size="sm" className="bg-[#eb4b00] hover:bg-[#d43e00]">
                <Link to="/">Get Free Quote</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">The Warranty Hub</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#224380] via-[#2a5299] to-[#1a3464] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Protect Your Vehicle with the UK's Most Trusted Warranty Provider
                </h1>
                <p className="text-xl md:text-2xl text-blue-100">
                  Flexible cover for cars and vans across the UK – get peace of mind today with expert advice from The Warranty Hub
                </p>
                
                {/* Trust Signals */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-sm font-medium">FCA Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm font-medium">5-Star Reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-300" />
                    <span className="text-sm font-medium">24/7 Claims</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-[#eb4b00] hover:bg-[#d43e00] text-white text-lg px-8 py-6 shadow-lg"
                  >
                    <Link to="/">
                      Get Your Free Quote
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline"
                    size="lg"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6"
                  >
                    <Link to="/faq">
                      Learn More
                    </Link>
                  </Button>
                </div>

                {/* Trustpilot */}
                <div className="pt-6">
                  <TrustpilotHeader className="justify-start" />
                </div>
              </div>

              <div className="hidden md:block">
                <img 
                  src={pandaHeroImage}
                  alt="UK driver protected by comprehensive car warranty coverage - affordable vehicle protection for used cars and vans across Manchester, Birmingham, London and nationwide"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Search Bar - Prominent Position */}
          <div className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
            <Card className="max-w-2xl mx-auto p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Search Our Expert Guides</h2>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. 'Is a car warranty worth it in the UK?'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 h-12 text-base"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* UK Coverage Section */}
        <section className="bg-muted/30 py-12 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                <MapPin className="w-8 h-8 text-primary" />
                UK-Wide Coverage
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We provide car warranty and van warranty coverage across England, Scotland, Wales and Northern Ireland
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {['London', 'Manchester', 'Birmingham', 'Glasgow', 'Edinburgh', 'Leeds', 'Bristol', 'Liverpool'].map((city) => (
                <div key={city} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{city}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              ...and everywhere else across the UK
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Featured Article */}
          {featuredPost && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">Featured Article</h2>
                <Badge variant="secondary" className="bg-[#eb4b00] text-white px-3 py-1">
                  Editor's Pick
                </Badge>
              </div>
              <Card className="overflow-hidden border shadow-xl hover:shadow-2xl transition-shadow">
                <div className="md:flex">
                  {featuredPost.featured_image_url && (
                    <div className="md:w-1/2">
                      <img 
                        src={featuredPost.featured_image_url}
                        alt={`${featuredPost.title} - expert car warranty advice for UK drivers`}
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

          {/* CTA Banner */}
          <section className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Need help choosing the right warranty?
                </h3>
                <p className="text-gray-700">
                  Speak to our UK warranty experts. Call now for instant advice or get your personalised quote online.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-[#224380] hover:bg-[#1a3464]">
                  <a href="tel:08000014990" className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    0800 001 4990
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/">Get Quote Online</Link>
                </Button>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-foreground mb-8">Latest Articles</h2>
              
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  Loading expert guides...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-4">No articles found matching your search</p>
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden border shadow-md hover:shadow-xl transition-all hover:border-primary/50">
                      <div className="md:flex">
                        {post.featured_image_url && (
                          <div className="md:w-1/3">
                            <img 
                              src={post.featured_image_url}
                              alt={`${post.title} - UK car warranty guide`}
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
              {/* Quick CTA */}
              <Card className="p-6 bg-gradient-to-br from-[#eb4b00] to-[#d43e00] text-white border-0 shadow-lg">
                <h3 className="text-xl font-bold mb-3">Get Your Quote Now</h3>
                <p className="text-white/90 mb-4 text-sm">
                  Instant online quotes for car and van warranties. UK-wide coverage from just £12.99/month.
                </p>
                <Button asChild className="w-full bg-white text-[#eb4b00] hover:bg-gray-100">
                  <Link to="/">Get Free Quote</Link>
                </Button>
              </Card>

              {/* Trust Signals */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Why Choose Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">FCA Approved</p>
                      <p className="text-xs text-muted-foreground">Fully regulated warranty provider</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">5-Star Reviews</p>
                      <p className="text-xs text-muted-foreground">Rated excellent on Trustpilot</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">24/7 Claims Support</p>
                      <p className="text-xs text-muted-foreground">UK-based claims team</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <TrustpilotHeader className="justify-center" />
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Browse Topics</h3>
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
              <Card className="p-6 bg-gradient-to-br from-[#224380] to-[#2a5299] text-white border-0 shadow-lg">
                <h3 className="text-xl font-bold mb-3">📧 Join 10,000+ UK Drivers</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get the latest car warranty tips, money-saving advice and exclusive offers delivered to your inbox.
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
                <h3 className="text-xl font-bold text-foreground mb-4">Helpful Resources</h3>
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

          {/* Popular Topics Section */}
          <section className="mt-16 mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Popular Warranty Topics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">Is a car warranty worth it in the UK?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover if extended warranty cover is right for your vehicle and budget.
                </p>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link to="/thewarrantyhub">Read Guide →</Link>
                </Button>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">What does a van warranty cover?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn exactly what's included in van warranty protection plans.
                </p>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link to="/van-warranty">Read Guide →</Link>
                </Button>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">How to claim on a used car warranty</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step guide to making a successful warranty claim in the UK.
                </p>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link to="/claims">Read Guide →</Link>
                </Button>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-16 bg-gradient-to-r from-[#224380] via-[#2a5299] to-[#1a3464] rounded-2xl p-12 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0NGg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10">
              <Shield className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Protect Your Vehicle?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get your free, no-obligation quote in 60 seconds. Join over 50,000 UK drivers who've already protected their vehicles with our award-winning warranty cover.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-[#eb4b00] hover:bg-[#d43e00] text-white px-10 py-6 text-lg shadow-xl"
                >
                  <Link to="/">
                    Get Your Free Quote Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">No payment required</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-blue-200 mb-4">Or speak to our UK warranty experts</p>
                <a href="tel:08000014990" className="text-2xl font-bold hover:text-blue-200 transition-colors">
                  📞 0800 001 4990
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Blog;