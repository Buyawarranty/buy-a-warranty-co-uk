import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { CartProvider } from "@/contexts/CartContext";
import PerformanceOptimizedSuspense from "@/components/PerformanceOptimizedSuspense";

// Eager load critical components
import Index from "./pages/Index";
import WebsiteFooter from "@/components/WebsiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "./pages/NotFound";

// Lazy load public pages with optimized chunking
const FAQ = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/FAQ"));
const ThankYou = lazy(() => import(/* webpackChunkName: "payment-pages" */ "./pages/ThankYou"));
const PaymentFallback = lazy(() => import(/* webpackChunkName: "payment-pages" */ "./pages/PaymentFallback"));
const Cart = lazy(() => import(/* webpackChunkName: "cart" */ "./pages/Cart"));
const Widget = lazy(() => import(/* webpackChunkName: "widget" */ "./pages/Widget"));
const Terms = lazy(() => import(/* webpackChunkName: "legal-pages" */ "./pages/Terms"));
const Protected = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/Protected"));
const Claims = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/Claims"));
const ContactUs = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/ContactUs"));
const Complaints = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/Complaints"));
const Blog = lazy(() => import(/* webpackChunkName: "blog" */ "./pages/Blog"));
const BlogArticle = lazy(() => import(/* webpackChunkName: "blog" */ "./pages/BlogArticle"));
const CookiePolicy = lazy(() => import(/* webpackChunkName: "legal-pages" */ "./pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "legal-pages" */ "./pages/PrivacyPolicy"));
const WarrantyPlan = lazy(() => import(/* webpackChunkName: "public-pages" */ "./pages/WarrantyPlan"));

// Debug component for route matching
const RouteDebug = ({ routeName, children }: { routeName: string; children: React.ReactNode }) => {
  console.log(`🚀 ${routeName} route matched`);
  return <>{children}</>;
};

// Error boundary for lazy loading
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Lazy loading error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      console.error('🚨 Component failed to load:', this.state.error);
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Temporary eager loading for debugging - remove after fixing
import AdminDashboardEager from "./pages/AdminDashboard";
import AuthEager from "./pages/Auth";

// Admin pages (heavy, separate chunks) - with debugging
const AdminDashboard = lazy(() => {
  console.log('🔥 Loading AdminDashboard component');
  return import(/* webpackChunkName: "admin" */ "./pages/AdminDashboard").catch(error => {
    console.error('💥 Failed to load AdminDashboard:', error);
    throw error;
  });
});
const Auth = lazy(() => {
  console.log('🔥 Loading Auth component'); 
  return import(/* webpackChunkName: "auth" */ "./pages/Auth").catch(error => {
    console.error('💥 Failed to load Auth:', error);
    throw error;
  });
});
const CustomerDashboard = lazy(() => import(/* webpackChunkName: "customer" */ "./pages/CustomerDashboard"));
const AdminTest = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/AdminTest"));
const PasswordReset = lazy(() => import(/* webpackChunkName: "auth" */ "./components/PasswordReset"));
const ResetPassword = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/ResetPassword"));
const QuickPasswordReset = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/QuickPasswordReset"));
const ForgotPassword = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/ForgotPassword"));

// Demo and preview components (separate chunk)
const CarJourneyDemo = lazy(() => import(/* webpackChunkName: "demo" */ "./pages/CarJourneyDemo"));
const CarSpinnerPreview = lazy(() => import(/* webpackChunkName: "demo" */ "./components/CarSpinnerPreview"));
const OriginalPricing = lazy(() => import(/* webpackChunkName: "demo" */ "./pages/OriginalPricing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
      retry: (failureCount, error) => {
        if (failureCount < 2) return true;
        return false;
      },
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
              <main className="flex-1 pb-16 w-full">
                <PerformanceOptimizedSuspense height="100vh">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="/payment-fallback" element={<PaymentFallback />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/widget" element={<Widget />} />
                    
                    <Route path="/auth" element={
                      <RouteDebug routeName="Auth">
                        <LazyLoadErrorBoundary fallback={<div>Failed to load Auth page</div>}>
                          <AuthEager />
                        </LazyLoadErrorBoundary>
                      </RouteDebug>
                    } />
                    <Route path="/admin" element={
                      <RouteDebug routeName="Admin">
                        <LazyLoadErrorBoundary fallback={<div>Failed to load Admin page</div>}>
                          <AdminDashboardEager />
                        </LazyLoadErrorBoundary>
                      </RouteDebug>
                    } />
                    <Route path="/admin-dashboard" element={
                      <RouteDebug routeName="Admin-dashboard">
                        <LazyLoadErrorBoundary fallback={<div>Failed to load Admin page</div>}>
                          <AdminDashboardEager />
                        </LazyLoadErrorBoundary>
                      </RouteDebug>
                    } />
                    <Route path="/admin-test" element={<AdminTest />} />
                    <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route path="/password-reset" element={<ResetPassword />} />
                    <Route path="/quick-reset" element={<QuickPasswordReset />} />
                    <Route path="/car-journey" element={<CarJourneyDemo />} />
                    <Route path="/car-preview" element={<CarSpinnerPreview />} />
                    <Route path="/original-pricing" element={<OriginalPricing />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/what-is-covered" element={<Protected />} />
                    <Route path="/claims" element={<Claims />} />
                    <Route path="/make-a-claim" element={<Claims />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/thewarrantyhub" element={<Blog />} />
                    <Route path="/thewarrantyhub/article/:id" element={<BlogArticle />} />
                    <Route path="/warranty-plan" element={<WarrantyPlan />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PerformanceOptimizedSuspense>
              </main>
              <WebsiteFooter />
            </div>
          </BrowserRouter>
        </CartProvider>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
