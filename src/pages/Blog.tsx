import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, ExternalLink } from 'lucide-react';

const Blog = () => {
  const featuredPost = {
    id: 1,
    title: "5 Common Car Repairs That Cost UK Drivers Thousands – And How to Avoid Them",
    excerpt: "Discover the top car repairs that hit UK drivers hardest – and how a vehicle warranty can save you from surprise bills.",
    author: "Steve Wilkinson",
    date: "2024-01-12",
    readTime: "5 min read",
    category: "Car Maintenance",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=400&fit=crop&crop=entropy&auto=format&q=60",
    content: {
      metaDescription: "Discover the top car repairs that hit UK drivers hardest – and how a vehicle warranty can save you from surprise bills.",
      sections: [
        {
          title: "Introduction",
          content: "Car ownership comes with freedom – but also unexpected costs. From engine faults to electrical issues, UK drivers often face repair bills that stretch into the thousands. The good news? A vehicle warranty can protect you from these financial shocks."
        },
        {
          title: "1. Engine Repairs – £1,500+",
          content: "The engine is the heart of your car. When it fails, repairs can be extensive and expensive. Common issues include timing belt failures, oil leaks, and overheating – all of which can be covered under a comprehensive warranty."
        },
        {
          title: "2. Gearbox Replacement – £1,200–£3,000",
          content: "Automatic and manual gearboxes are complex systems. Replacing one can cost more than a month's salary. A good warranty plan will cover both parts and labour, saving you from a major financial hit."
        },
        {
          title: "3. Electrical Faults – £300–£1,000",
          content: "Modern cars rely heavily on electronics – from dashboard displays to sensors and control units. Diagnosing and fixing electrical faults often requires specialist equipment and expertise, which can be costly without cover."
        },
        {
          title: "4. Suspension Issues – £400–£1,500",
          content: "Worn-out shocks, struts, or control arms can affect your car's handling and safety. These repairs are common, especially in older vehicles, and are often covered under extended warranty plans."
        },
        {
          title: "5. Turbocharger Failure – £800–£2,000",
          content: "Turbochargers boost engine performance but are prone to wear. Replacing one is a major job, and without a warranty, you'll be footing the entire bill."
        },
        {
          title: "How a Vehicle Warranty Can Help",
          content: "With a Buy-a-Warranty plan, you're protected from these costly repairs. Our cover includes: Parts & Labour, Breakdown Recovery, Flexible Monthly Plans, £0 Excess, Nationwide Cover. Even if your car is older or has high mileage, you can still get protected."
        },
        {
          title: "Real Story: \"I Saved Over £1,200 on My Engine Repair\"",
          content: "Corey, a UK driver, shares: \"I thought I'd be stuck with a massive bill. But Buy-a-Warranty covered everything – diagnostics, parts, labour. I didn't pay a penny.\""
        },
        {
          title: "Final Thoughts",
          content: "Car repairs are inevitable – but paying for them out of pocket doesn't have to be. With the right warranty, you can drive with confidence and peace of mind."
        }
      ]
    }
  };

  const recentPosts = [
    {
      id: 2,
      title: "Winter Driving: Essential Tips to Avoid Costly Breakdowns",
      excerpt: "Prepare your vehicle for winter with our expert guide to avoiding seasonal breakdowns and repair bills.",
      author: "Gary Flinch",
      date: "2024-01-09",
      readTime: "4 min read",
      category: "Seasonal Advice",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop&crop=entropy&auto=format&q=60"
    },
    {
      id: 3,
      title: "Used Car Buying Guide: Questions to Ask About Warranty Cover",
      excerpt: "Essential questions every UK driver should ask when buying a used car to ensure proper warranty protection.",
      author: "Steve Wilkinson",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Buying Guide",
      image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&h=250&fit=crop&crop=entropy&auto=format&q=60"
    },
    {
      id: 4,
      title: "Warranty vs Insurance: Understanding the Difference",
      excerpt: "Learn the key differences between car insurance and vehicle warranties, and why you might need both.",
      author: "Gary Flinch",
      date: "2024-01-02",
      readTime: "3 min read",
      category: "Education",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&crop=entropy&auto=format&q=60"
    }
  ];

  const categories = [
    "Car Maintenance",
    "Seasonal Advice", 
    "Buying Guide",
    "Education",
    "Customer Stories",
    "Cost Comparisons"
  ];

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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>New posts every Tuesday & Friday at 12pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Expert authors: Steve Wilkinson & Gary Flinch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Featured Article */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.image}
                    alt="Mechanic inspecting car engine"
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {featuredPost.category}
                    </Badge>
                    <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
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
                        <p className="font-medium text-gray-900">{featuredPost.author}</p>
                        <p className="text-sm text-gray-500">{featuredPost.date}</p>
                      </div>
                    </div>
                    
                    <Button 
                      asChild
                      className="bg-[#224380] hover:bg-[#1a3464] text-white"
                    >
                      <Link to={`/thewarrantyhub/article/${featuredPost.id}`}>
                        Read Full Article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Posts</h2>
              <div className="space-y-8">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img 
                          src={post.image}
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-gray-500 text-sm">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#224380] cursor-pointer">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{post.author}</p>
                              <p className="text-xs text-gray-500">{post.date}</p>
                            </div>
                          </div>
                          
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm"
                          >
                            <Link to={`/thewarrantyhub/article/${post.id}`}>
                              Read More
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button 
                      key={category}
                      variant="ghost" 
                      className="w-full justify-start text-left hover:bg-blue-50"
                    >
                      {category}
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
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm"
                  />
                  <Button className="w-full bg-white text-[#224380] hover:bg-gray-100">
                    Subscribe
                  </Button>
                </div>
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
              <Link to="https://buyawarranty.co.uk/">
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