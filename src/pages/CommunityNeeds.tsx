import { useState } from "react";
import { Heart, ThumbsUp, MessageSquare, MapPin, TrendingUp, Users, Plus, CheckCircle, Building2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import communityNeedsBanner from "@/assets/community-needs-banner.png";
const communityNeeds = [
  {
    id: 1,
    title: "Mobile Health Clinic for Remote Villages",
    category: "Healthcare",
    location: "Tumkur District, Karnataka",
    description: "Many elderly and pregnant women in remote villages cannot travel to hospitals. Need a mobile health unit for regular checkups.",
    upvotes: 342,
    comments: 28,
    author: "Ramesh K.",
    postedDate: "2 days ago",
    status: "trending",
    ngoResponse: null,
    governmentAction: null,
  },
  {
    id: 2,
    title: "School Bus for Tribal Children",
    category: "Education",
    location: "Wayanad, Kerala",
    description: "Children from tribal areas walk 8km daily to reach school. A dedicated school bus would increase attendance.",
    upvotes: 289,
    comments: 15,
    author: "Priya M.",
    postedDate: "5 days ago",
    status: "in-review",
    ngoResponse: "EduCare NGO has shown interest",
    governmentAction: null,
  },
  {
    id: 3,
    title: "Clean Drinking Water Purifier",
    category: "Water",
    location: "Jaisalmer, Rajasthan",
    description: "Our village relies on bore water which has high fluoride content. Children are developing dental fluorosis.",
    upvotes: 456,
    comments: 42,
    author: "Fatima B.",
    postedDate: "1 week ago",
    status: "accepted",
    ngoResponse: "WaterAid has adopted this need",
    governmentAction: "Converted to official scheme on Jan 20",
  },
  {
    id: 4,
    title: "Evening Skill Training Classes",
    category: "Livelihood",
    location: "Dharavi, Mumbai",
    description: "Young adults working in small jobs want to learn computer skills and English. Need evening classes.",
    upvotes: 178,
    comments: 12,
    author: "Amit S.",
    postedDate: "3 days ago",
    status: "open",
    ngoResponse: null,
    governmentAction: null,
  },
];

const categories = [
  { name: "All", icon: Heart },
  { name: "Healthcare", icon: Heart },
  { name: "Education", icon: Users },
  { name: "Water", icon: Heart },
  { name: "Livelihood", icon: TrendingUp },
  { name: "Infrastructure", icon: Building2 },
];

export default function CommunityNeeds() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPostForm, setShowPostForm] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<number[]>([]);

  const filteredNeeds = selectedCategory === "All" 
    ? communityNeeds 
    : communityNeeds.filter(n => n.category === selectedCategory);

  const handleUpvote = (id: number) => {
    setUpvotedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-citizen/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ngo/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Image Banner */}
          <div className="mb-8 animate-fade-in">
            <img
              src={communityNeedsBanner}
              alt="Community Needs Portal"
              className="w-full max-h-[300px] object-cover rounded-2xl border border-border transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_hsl(var(--citizen)/0.3)]"
            />
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-citizen/10 border border-citizen/30 mb-6">
              <Heart className="w-4 h-4 text-citizen" />
              <span className="text-sm font-medium text-citizen">Community-Driven Governance</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Community <span className="text-gradient-primary">Needs Portal</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Voice your community's needs. Popular requests become official government schemes.
            </p>
            <Button 
              variant="citizen" 
              size="lg"
              onClick={() => setShowPostForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Post a Community Need
            </Button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat.name
                  ? "bg-citizen text-citizen-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-citizen/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Post Form Modal */}
        {showPostForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl border border-border p-8 max-w-xl w-full mx-4 animate-scale-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">Post a Community Need</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">What does your community need?</label>
                  <input
                    type="text"
                    placeholder="e.g., Mobile health clinic for regular checkups"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50">
                    <option value="">Select category</option>
                    {categories.slice(1).map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <input
                    type="text"
                    placeholder="Village/Town, District, State"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Explain the problem and how many people would benefit..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-citizen/50"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPostForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="citizen" 
                    className="flex-1"
                    onClick={() => setShowPostForm(false)}
                  >
                    Submit Need
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Needs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredNeeds.map((need) => (
            <div 
              key={need.id}
              className={cn(
                "bg-card rounded-2xl border p-6 transition-all card-hover",
                need.status === "accepted" 
                  ? "border-public/30" 
                  : need.status === "trending"
                  ? "border-citizen/30"
                  : "border-border"
              )}
            >
              {/* Status Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  need.status === "accepted" && "bg-public/10 text-public",
                  need.status === "trending" && "bg-citizen/10 text-citizen",
                  need.status === "in-review" && "bg-government/10 text-government",
                  need.status === "open" && "bg-muted text-muted-foreground"
                )}>
                  {need.status === "trending" && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {need.status === "accepted" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {need.status.replace("-", " ")}
                </span>
                <span className="text-xs text-muted-foreground">{need.postedDate}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{need.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{need.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-citizen" />
                  {need.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {need.location}
                </span>
                <span className="text-xs">by {need.author}</span>
              </div>

              {/* NGO/Government Response */}
              {(need.ngoResponse || need.governmentAction) && (
                <div className="mb-4 space-y-2">
                  {need.ngoResponse && (
                    <div className="p-2 rounded-lg bg-ngo/5 border border-ngo/20 text-xs text-ngo">
                      🤝 {need.ngoResponse}
                    </div>
                  )}
                  {need.governmentAction && (
                    <div className="p-2 rounded-lg bg-public/5 border border-public/20 text-xs text-public">
                      ✅ {need.governmentAction}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button 
                  onClick={() => handleUpvote(need.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    upvotedIds.includes(need.id) 
                      ? "bg-citizen/10 text-citizen"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ThumbsUp className={cn(
                    "w-4 h-4",
                    upvotedIds.includes(need.id) && "fill-citizen"
                  )} />
                  <span className="text-sm font-medium">
                    {need.upvotes + (upvotedIds.includes(need.id) ? 1 : 0)}
                  </span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{need.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
