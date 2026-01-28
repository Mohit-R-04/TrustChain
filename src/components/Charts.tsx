import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const barData = [
  { name: "Jan", donated: 450000, utilized: 380000, escrow: 70000 },
  { name: "Feb", donated: 520000, utilized: 410000, escrow: 110000 },
  { name: "Mar", donated: 380000, utilized: 320000, escrow: 60000 },
  { name: "Apr", donated: 610000, utilized: 490000, escrow: 120000 },
  { name: "May", donated: 480000, utilized: 420000, escrow: 60000 },
  { name: "Jun", donated: 550000, utilized: 450000, escrow: 100000 },
];

const pieData = [
  { name: "Water", value: 35, color: "hsl(217, 91%, 60%)" },
  { name: "Education", value: 28, color: "hsl(270, 70%, 60%)" },
  { name: "Health", value: 22, color: "hsl(142, 71%, 45%)" },
  { name: "Infrastructure", value: 15, color: "hsl(174, 72%, 46%)" },
];

export function FundUtilizationChart() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Fund Utilization Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 18%)" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(215, 20%, 65%)" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(215, 20%, 65%)" 
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `₹${value / 1000}K`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(220, 40%, 10%)",
              border: "1px solid hsl(220, 30%, 18%)",
              borderRadius: "12px",
              color: "hsl(210, 40%, 98%)"
            }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
          />
          <Bar dataKey="donated" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Donated" />
          <Bar dataKey="utilized" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Utilized" />
          <Bar dataKey="escrow" fill="hsl(270, 70%, 60%)" radius={[4, 4, 0, 0]} name="In Escrow" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-donor" />
          <span className="text-sm text-muted-foreground">Donated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-public" />
          <span className="text-sm text-muted-foreground">Utilized</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-vendor" />
          <span className="text-sm text-muted-foreground">In Escrow</span>
        </div>
      </div>
    </div>
  );
}

export function CategoryDistributionChart() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(220, 40%, 10%)",
              border: "1px solid hsl(220, 30%, 18%)",
              borderRadius: "12px",
              color: "hsl(210, 40%, 98%)"
            }}
            formatter={(value: number) => [`${value}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {pieData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium text-foreground ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
