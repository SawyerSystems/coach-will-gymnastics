import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePerformanceMonitor } from "@/utils/performance";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
// Simple loading component
const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600 mx-auto" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Lazy load all page components for better performance
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Booking = lazy(() => import("@/pages/booking"));
const Blog = lazy(() => import("@/pages/blog"));
const Tips = lazy(() => import("@/pages/tips"));
const Contact = lazy(() => import("@/pages/contact"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const ProgressShare = lazy(() => import("@/pages/progress-share"));
const ParentLogin = lazy(() => import("@/pages/parent/login"));
const ParentRegister = lazy(() => import("@/pages/parent-register"));
const ParentSetupSuccess = lazy(() => import("@/pages/parent-setup-success"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const Checkout = lazy(() => import("@/pages/checkout"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const TipDetail = lazy(() => import("@/pages/tip-detail"));
const BookingSuccess = lazy(() => import("@/pages/booking-success").catch(() => ({
  default: () => <div className="p-8 text-center">Booking Success page failed to load</div>
})));
const ParentDashboard = lazy(() => import("@/pages/parent-dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [location] = useLocation();
  const { startMeasure } = usePerformanceMonitor('Router');

  // Scroll reset on page navigation with performance optimization
  useEffect(() => {
    const measure = startMeasure();
    
    // Smooth scroll reset for better UX
    window.scrollTo({ 
      top: 0, 
      left: 0, 
      behavior: 'instant' 
    });
    
    measure();
  }, [location, startMeasure]);

  return (
    <>
      <Navigation />
      <Suspense fallback={<PageLoadingSpinner />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/booking" component={Booking} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogPost} />
          <Route path="/tips" component={Tips} />
          <Route path="/tips/:id" component={TipDetail} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/progress/:token" component={ProgressShare} />
          <Route path="/parent/login" component={ParentLogin} />
          <Route path="/parent/confirm-booking" component={lazy(() => import("@/pages/parent/confirm-booking"))} />
          <Route path="/parent/set-password" component={lazy(() => import("@/pages/parent/set-password"))} />
          <Route path="/parent-register" component={ParentRegister} />
          <Route path="/parent-setup-success" component={ParentSetupSuccess} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/parent-dashboard" component={ParentDashboard} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/booking-success" component={BookingSuccess} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  // Register service worker for caching and performance - only in production
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered: ', registration);
      }).catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-root">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
