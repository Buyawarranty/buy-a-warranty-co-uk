import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { CartProvider } from "@/contexts/CartContext";

// Eager load critical components
import Index from "./pages/Index";
import WebsiteFooter from "@/components/WebsiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "./pages/NotFound";
import { CookieBanner } from "@/components/CookieBanner";

// Lazy load pages
const FAQ = lazy(() => import("./pages/FAQ"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const PaymentFallback = lazy(() => import("./pages/PaymentFallback"));
const Cart = lazy(() => import("./pages/Cart"));
const Widget = lazy(() => import("./pages/Widget"));
const Terms = lazy(() => import("./pages/Terms"));
const Protected = lazy(() => import("./pages/Protected"));
const Claims = lazy(() => import("./pages/Claims"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Complaints = lazy(() => import("./pages/Complaints"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const WarrantyPlan = lazy(() => import("./pages/WarrantyPlan"));
const BuyCarWarranty = lazy(() => import("./pages/BuyCarWarranty"));
const VanWarranty = lazy(() => import("./pages/VanWarranty"));
const EVWarranty = lazy(() => import("./pages/EVWarranty"));
const MotorbikeWarranty = lazy(() => import("./pages/MotorbikeWarranty"));

// Admin and auth pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const AdminTest = lazy(() => import("./pages/AdminTest"));
const PasswordReset = lazy(() => import("./components/PasswordReset"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const QuickPasswordReset = lazy(() => import("./pages/QuickPasswordReset"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SetupAdmin = lazy(() => import("./pages/SetupAdmin"));

// Demo components
const CarJourneyDemo = lazy(() => import("./pages/CarJourneyDemo"));
const CarSpinnerPreview = lazy(() => import("./components/CarSpinnerPreview"));
const OriginalPricing = lazy(() => import("./pages/OriginalPricing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (failureCount < 2) return true;
        return false;
      },
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
            <CookieBanner />
            <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
              <main className="flex-1 pb-16 w-full">
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="/payment-fallback" element={<PaymentFallback />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/widget" element={<Widget />} />
                    
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-test" element={<AdminTest />} />
                    <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route path="/password-reset" element={<ResetPassword />} />
                    <Route path="/quick-reset" element={<QuickPasswordReset />} />
                    <Route path="/setup-admin" element={<SetupAdmin />} />
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
                    <Route path="/thewarrantyhub/:slug" element={<BlogArticle />} />
                    <Route path="/warranty-plan" element={<WarrantyPlan />} />
                    <Route path="/buy-a-used-car-warranty-reliable-warranties" element={<BuyCarWarranty />} />
                    <Route path="/van-warranty-companies-uk-warranties" element={<VanWarranty />} />
                    <Route path="/best-warranty-on-ev-cars-uk-warranties" element={<EVWarranty />} />
                    <Route path="/motorbike-repair-warranty-uk-warranties" element={<MotorbikeWarranty />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
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
