import { useState } from "react";
import { User, MapPin, CheckCircle, MessageSquare, AlertTriangle, Star, Camera, ThumbsUp, Clock, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activeSchemes = [
  { id: 1, title: "Mid-Day Meal Program", region: "Bangalore Urban", progress: 85, status: "On Track", deliveryDate: "Feb 15, 2026" },
  { id: 2, title: "Free Health Checkup Camp", region: "Bangalore Rural", progress: 60, status: "In Progress", deliveryDate: "Mar 1, 2026" },
  { id: 3, title: "Clean Drinking Water Initiative", region: "Mysore", progress: 100, status: "Delivered", deliveryDate: "Jan 20, 2026" },
];

const pendingFeedback = [
  { id: 1, title: "School Uniform Distribution", deliveryDate: "Jan 22, 2026", vendor: "TextilePro Ltd" },
  { id: 2, title: "Ration Kit Delivery", deliveryDate: "Jan 25, 2026", vendor: "FoodCare Services" },
];

export default function CitizenPortal() {
  const [activeTab, setActiveTab] = useState<"home" | "feedback" | "query" | "needs">("home");
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [querySubmitted, setQuerySubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-citizen/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-citizen/10 border border-citizen/30">
              <User className="w-8 h-8 text-citizen" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Citizen Portal</h1>
              <p className="text-muted-foreground">Track schemes, provide feedback, raise queries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 p-1 bg-card rounded-xl border border-border w-fit">
          {[
            { id: "home", label: "My Area Schemes", icon: MapPin },
            { id: "feedback", label: "Verify Delivery", icon: CheckCircle },
            { id: "query", label: "Raise Query", icon: MessageSquare },
            { id: "needs", label: "Post Community Need", icon: ThumbsUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-citizen text-citizen-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Location Filter */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search schemes in your area..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-citizen" />
                  <span>Bangalore, Karnataka</span>
                </div>
              </div>
            </div>

            {/* Active Schemes */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Schemes in Your Area</h2>
              {activeSchemes.map((scheme) => (
                <div 
                  key={scheme.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:border-citizen/30 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{scheme.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {scheme.region}
                      </p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      scheme.status === "Delivered" 
                        ? "bg-public/10 text-public" 
                        : scheme.status === "On Track"
                        ? "bg-citizen/10 text-citizen"
                        : "bg-government/10 text-government"
                    )}>
                      {scheme.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-citizen font-medium">{scheme.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          scheme.progress === 100 ? "bg-public" : "bg-citizen"
                        )}
                        style={{ width: `${scheme.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Expected: {scheme.deliveryDate}
                  </div>

                  {scheme.status === "Delivered" && (
                    <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-public/10 border border-public/30">
                      <CheckCircle className="w-5 h-5 text-public" />
                      <span className="text-sm font-medium text-public">Service Verified & Completed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-foreground">Pending Service Verification</h2>
            
            {!feedbackSubmitted ? (
              <div className="space-y-4">
                {pendingFeedback.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-card rounded-2xl border border-border p-6"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Delivered on {item.deliveryDate} by {item.vendor}
                    </p>

                    {/* Rating */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground block mb-2">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star className={cn(
                              "w-8 h-8 transition-colors",
                              star <= rating ? "fill-government text-government" : "text-muted-foreground"
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground block mb-2">Comments</label>
                      <textarea
                        placeholder="Share your experience..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-foreground block mb-2">Upload Photo Proof (Optional)</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-citizen/50 transition-colors cursor-pointer">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload photo</p>
                      </div>
                    </div>

                    <Button 
                      variant="citizen" 
                      className="w-full"
                      onClick={() => setFeedbackSubmitted(true)}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Service Delivery
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-public/30 p-8 text-center animate-fade-up">
                <div className="w-20 h-20 rounded-full bg-public/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-public" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Service Verified!</h3>
                <p className="text-muted-foreground mb-4">
                  Thank you for confirming the delivery. Your feedback has been recorded on the blockchain.
                </p>
                <p className="text-sm text-public font-mono">
                  Verification Hash: 0x9f2a...7c4e
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "query" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Raise a Query or Concern</h2>
              
              {!querySubmitted ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Query Type</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50">
                      <option value="">Select type</option>
                      <option value="delay">Delayed Milestone</option>
                      <option value="misuse">Suspected Misuse</option>
                      <option value="quality">Quality Issues</option>
                      <option value="support">General Support</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Related Scheme</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50">
                      <option value="">Select scheme</option>
                      {activeSchemes.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Describe Your Issue</label>
                    <textarea
                      placeholder="Provide details about your concern..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                    />
                  </div>

                  <Button 
                    variant="citizen" 
                    className="w-full"
                    onClick={() => setQuerySubmitted(true)}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Submit Query
                  </Button>
                </div>
              ) : (
                <div className="text-center animate-fade-up">
                  <div className="w-20 h-20 rounded-full bg-citizen/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-citizen" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Query Submitted!</h3>
                  <p className="text-muted-foreground">
                    Your query has been logged. You will receive updates via SMS.
                  </p>
                  <p className="text-sm text-citizen font-mono mt-2">
                    Query ID: QRY-2026-0127
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "needs" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Post Community Need</h2>
              <p className="text-muted-foreground mb-6">
                Let the government know what your community needs. Popular requests may become official schemes.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50">
                    <option value="">Select category</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="water">Water & Sanitation</option>
                    <option value="food">Food Security</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">What does your community need?</label>
                  <input
                    type="text"
                    placeholder="e.g., Mobile health clinic visits"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Whitefield, Bangalore"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Additional Details</label>
                  <textarea
                    placeholder="Explain why this is needed and how many people would benefit..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <Button variant="citizen" className="w-full">
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Post Community Need
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
