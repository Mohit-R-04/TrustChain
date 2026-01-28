import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DonorDashboard from "./pages/DonorDashboard";
import NGOAdminDashboard from "./pages/NGOAdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import PublicDashboard from "./pages/PublicDashboard";
import TrustSecurityPage from "./pages/TrustSecurityPage";
import VendorMarketplace from "./pages/VendorMarketplace";
import GovernmentPortal from "./pages/GovernmentPortal";
import CitizenPortal from "./pages/CitizenPortal";
import AuditorPortal from "./pages/AuditorPortal";
import CommunityNeeds from "./pages/CommunityNeeds";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HelpCenter from "./pages/HelpCenter";
import ImpactReports from "./pages/ImpactReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/government" element={<GovernmentPortal />} />
          <Route path="/ngo-admin" element={<NGOAdminDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/auditor" element={<AuditorPortal />} />
          <Route path="/citizen" element={<CitizenPortal />} />
          <Route path="/public" element={<PublicDashboard />} />
          <Route path="/community-needs" element={<CommunityNeeds />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/impact" element={<ImpactReports />} />
          <Route path="/security" element={<TrustSecurityPage />} />
          <Route path="/marketplace" element={<VendorMarketplace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
