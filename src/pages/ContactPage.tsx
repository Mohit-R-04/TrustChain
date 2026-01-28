import { useState } from "react";
import { Mail, MessageSquare, Upload, Send, CheckCircle, HelpCircle, AlertCircle, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const issueTypes = [
  "Technical Issue",
  "Payment/Escrow Query",
  "Proof Verification",
  "Account Access",
  "Report Fraud",
  "Feature Request",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    role: "",
    issueType: "",
    subject: "",
    message: "",
    attachment: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ngo/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-donor/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ngo/10 border border-ngo/30 mb-6">
              <MessageSquare className="w-4 h-4 text-ngo" />
              <span className="text-sm font-medium text-ngo">Contact Support</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Can We <span className="text-gradient-primary">Help You?</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Raise a support ticket and our team will respond within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="p-3 rounded-xl bg-donor/10 w-fit mb-4">
                  <Mail className="w-6 h-6 text-donor" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">For general inquiries</p>
                <a href="mailto:support@trustchain.gov" className="text-donor hover:underline">
                  support@trustchain.gov
                </a>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="p-3 rounded-xl bg-auditor/10 w-fit mb-4">
                  <Shield className="w-6 h-6 text-auditor" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fraud Reporting</h3>
                <p className="text-sm text-muted-foreground mb-2">Report suspicious activity</p>
                <a href="mailto:fraud@trustchain.gov" className="text-auditor hover:underline">
                  fraud@trustchain.gov
                </a>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="p-3 rounded-xl bg-government/10 w-fit mb-4">
                  <HelpCircle className="w-6 h-6 text-government" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Help Center</h3>
                <p className="text-sm text-muted-foreground mb-2">Browse FAQs and guides</p>
                <a href="/help" className="text-government hover:underline">
                  Visit Help Center →
                </a>
              </div>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-2">
              {!submitted ? (
                <div className="bg-card rounded-2xl border border-border p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6">Raise a Support Ticket</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Your Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select role</option>
                          <option value="citizen">Citizen</option>
                          <option value="donor">Donor</option>
                          <option value="government">Government</option>
                          <option value="ngo">NGO</option>
                          <option value="vendor">Vendor</option>
                          <option value="auditor">Auditor</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Issue Type</label>
                        <select
                          value={formData.issueType}
                          onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select issue type</option>
                          {issueTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief description of your issue"
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Attach Proof (Optional)</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">Screenshots, invoices, or documents</p>
                        <input type="file" className="hidden" />
                      </div>
                    </div>

                    <Button type="submit" variant="ngo" size="lg" className="w-full mt-4">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-public/30 p-8 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-public/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-public" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Ticket Submitted!</h2>
                  <p className="text-muted-foreground mb-4">
                    Your support ticket has been created. We'll respond within 24 hours.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ticket ID: <span className="font-mono text-public">TKT-2026-00847</span>
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Ticket
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
