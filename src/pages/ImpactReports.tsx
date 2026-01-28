import { useState } from "react";
import { TrendingUp, Users, AlertTriangle, CheckCircle, Download, BarChart3, PieChart, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";

const impactStats = [
  { title: "Schemes Completed", value: 89, icon: CheckCircle, variant: "public" as const },
  { title: "Beneficiaries Served", value: 245000, icon: Users, variant: "citizen" as const },
  { title: "Fraud Alerts Detected", value: 23, icon: AlertTriangle, variant: "auditor" as const },
  { title: "Payments Released", value: 178000000, icon: TrendingUp, prefix: "₹", variant: "donor" as const },
];

const districtData = [
  { name: "Karnataka", schemes: 28, amount: 4.5 },
  { name: "Maharashtra", schemes: 24, amount: 3.8 },
  { name: "Tamil Nadu", schemes: 18, amount: 2.9 },
  { name: "Rajasthan", schemes: 15, amount: 2.2 },
  { name: "Kerala", schemes: 12, amount: 1.8 },
  { name: "Gujarat", schemes: 10, amount: 1.5 },
];

const utilizationData = [
  { name: "Utilized", value: 67, color: "hsl(var(--public))" },
  { name: "In Escrow", value: 23, color: "hsl(var(--government))" },
  { name: "Pending", value: 10, color: "hsl(var(--vendor))" },
];

const categoryData = [
  { name: "Healthcare", value: 32, color: "hsl(var(--citizen))" },
  { name: "Education", value: 28, color: "hsl(var(--donor))" },
  { name: "Food", value: 20, color: "hsl(var(--ngo))" },
  { name: "Water", value: 12, color: "hsl(var(--auditor))" },
  { name: "Infrastructure", value: 8, color: "hsl(var(--vendor))" },
];

export default function ImpactReports() {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("quarter");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-public/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-donor/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-public/10 border border-public/30 mb-4">
                <TrendingUp className="w-4 h-4 text-public" />
                <span className="text-sm font-medium text-public">Impact & Reports</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                TrustChain <span className="text-gradient-primary">Impact Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-2">Real-time metrics on welfare scheme effectiveness</p>
            </div>

            <div className="flex gap-2">
              {(["month", "quarter", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {impactStats.map((stat, i) => (
              <StatsCard key={stat.title} {...stat} delay={i * 100} />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* District-wise Distribution */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-government/10">
                  <MapPin className="w-5 h-5 text-government" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">District-wise Scheme Distribution</h2>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={80} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px"
                      }}
                    />
                    <Bar dataKey="schemes" fill="hsl(var(--government))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fund Utilization */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-donor/10">
                  <PieChart className="w-5 h-5 text-donor" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Fund Utilization Status</h2>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px"
                      }}
                      formatter={(value: number) => `${value}%`}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-ngo/10">
                  <BarChart3 className="w-5 h-5 text-ngo" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Category-wise Fund Allocation</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categoryData.map((cat) => (
                <div 
                  key={cat.name}
                  className="p-4 rounded-xl bg-muted/30 border border-border text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <span className="text-lg font-bold" style={{ color: cat.color }}>{cat.value}%</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Download Reports */}
          <div className="bg-card rounded-2xl border border-public/30 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-public mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Download Audit Report</h2>
            <p className="text-muted-foreground mb-6">
              Get the complete blockchain-verified audit report with all transactions and proofs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="public" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Export CSV Data
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
