import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import TrustpilotHeader from '@/components/TrustpilotHeader';

const BlogArticle = () => {
  const { id } = useParams();

  // Article data - in a real app this would come from a database
  const articles = {
    "1": {
      id: 1,
      title: "5 Common Car Repairs That Cost UK Drivers Thousands – And How to Avoid Them",
      excerpt: "Discover the top car repairs that hit UK drivers hardest – and how a vehicle warranty can save you from surprise bills.",
      author: "Steve Wilkinson",
      date: "2024-01-12",
      readTime: "5 min read",
      category: "Car Maintenance",
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=400&fit=crop&crop=entropy&auto=format&q=60",
      content: [
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
    },
    "2": {
      id: 2,
      title: "Winter Driving: Essential Tips to Avoid Costly Breakdowns",
      excerpt: "Prepare your vehicle for winter with our expert guide to avoiding seasonal breakdowns and repair bills.",
      author: "Gary Flinch",
      date: "2024-01-09",
      readTime: "4 min read",
      category: "Seasonal Advice",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop&crop=entropy&auto=format&q=60",
      content: [
        {
          title: "Introduction",
          content: "Winter driving in the UK brings unique challenges. Cold temperatures, wet roads, and shorter days can take a toll on your vehicle. Here's how to prepare and protect yourself from costly winter breakdowns."
        },
        {
          title: "Battery Care in Cold Weather",
          content: "Cold weather is your car battery's worst enemy. Batteries lose up to 50% of their power in freezing conditions. Check your battery regularly, clean the terminals, and consider a battery warmer for extreme conditions."
        },
        {
          title: "Tyre Maintenance",
          content: "Proper tyre pressure is crucial in winter. Cold air causes pressure to drop, affecting grip and fuel economy. Check weekly and consider winter tyres if you regularly drive in harsh conditions."
        },
        {
          title: "Engine Protection",
          content: "Use the right grade of oil for winter conditions. Consider a winter-grade oil if you live in particularly cold areas. This helps your engine start more easily and protects components during warm-up."
        },
        {
          title: "Emergency Kit Essentials",
          content: "Always carry: jump leads, torch, first aid kit, warm blankets, food and water, ice scraper, and de-icer. Being prepared can save you from expensive recovery charges."
        },
        {
          title: "Warranty Protection",
          content: "Winter breakdowns are more common and often more expensive due to emergency call-out charges. A comprehensive warranty with breakdown cover gives you peace of mind during the coldest months."
        }
      ]
    },
    "3": {
      id: 3,
      title: "Used Car Buying Guide: Questions to Ask About Warranty Cover",
      excerpt: "Essential questions every UK driver should ask when buying a used car to ensure proper warranty protection.",
      author: "Steve Wilkinson",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Buying Guide",
      image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&h=400&fit=crop&crop=entropy&auto=format&q=60",
      content: [
        {
          title: "Introduction",
          content: "Buying a used car is exciting, but it's essential to understand what warranty protection you're getting. The right questions can save you thousands in unexpected repair bills."
        },
        {
          title: "What's Covered Under Existing Warranty?",
          content: "Ask the seller for full warranty details. Check what's included, excluded, and how long coverage lasts. Don't assume anything – get it in writing."
        },
        {
          title: "Can the Warranty Be Transferred?",
          content: "Some manufacturer warranties are transferable, others aren't. Extended warranties often can be transferred but may require a fee. Clarify this before purchase."
        },
        {
          title: "What About Independent Warranty Options?",
          content: "Even if the car comes without warranty, you can still get protection. Independent warranty providers like Buy-a-Warranty offer comprehensive cover for vehicles up to 15 years old."
        },
        {
          title: "Service History Requirements",
          content: "Most warranties require proof of regular servicing. Check if the service history is complete and meets warranty requirements. Missing services could void your cover."
        },
        {
          title: "Understanding Excess and Claims",
          content: "Know what you'll pay if you need to claim. Some warranties have high excess charges or complex claims processes. Look for £0 excess options for better value."
        },
        {
          title: "Making the Right Choice",
          content: "Don't let warranty concerns stop you buying the right car. With flexible, affordable warranty options available, you can protect any vehicle and drive with confidence."
        }
      ]
    }
  };

  const article = articles[id as keyof typeof articles];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead 
          title="Article Not Found | The Warranty Hub"
          description="The article you're looking for doesn't exist."
        />
        <div className="w-full px-4 pt-4">
          <div className="max-w-6xl mx-auto">
            <TrustpilotHeader />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/thewarrantyhub">
              <Button variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to The Warranty Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${article.title} | The Warranty Hub`}
        description={article.excerpt}
        keywords={`${article.category.toLowerCase()}, car warranty, vehicle warranty, ${article.title.toLowerCase()}`}
        canonical={`https://buyawarranty.co.uk/thewarrantyhub/article/${article.id}`}
      />
      
      {/* Trustpilot header */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <TrustpilotHeader />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/thewarrantyhub" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to The Warranty Hub
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {article.category}
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {article.excerpt}
          </p>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {article.author}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(article.date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {article.readTime}
            </div>
          </div>
        </header>

        {/* Featured image */}
        <div className="mb-8">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Article content */}
        <article className="prose prose-lg max-w-none">
          {article.content.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </article>

        {/* Call to action */}
        <div className="mt-12 p-8 bg-primary/5 rounded-lg border">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to protect your vehicle?
          </h3>
          <p className="text-muted-foreground mb-6">
            Get fast, affordable warranty cover for your car, van, SUV or motorbike today.
          </p>
          <Link to="/">
            <Button size="lg">
              Get Your Quote Now
            </Button>
          </Link>
        </div>

        {/* Related articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">More from The Warranty Hub</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.values(articles)
              .filter(a => a.id !== article.id)
              .slice(0, 2)
              .map((relatedArticle) => (
              <Link 
                key={relatedArticle.id} 
                to={`/thewarrantyhub/article/${relatedArticle.id}`}
                className="group"
              >
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
                  <img 
                    src={relatedArticle.image} 
                    alt={relatedArticle.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {relatedArticle.category}
                    </Badge>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {relatedArticle.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {relatedArticle.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogArticle;