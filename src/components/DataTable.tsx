import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  onVerifyClick?: (row: any) => void;
  variant?: "donor" | "ngo" | "vendor" | "public";
}

export function DataTable({ columns, data, searchable = false, onVerifyClick, variant = "public" }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

  const variantColor = {
    donor: "text-donor",
    ngo: "text-ngo",
    vendor: "text-vendor",
    public: "text-public",
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {onVerifyClick && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Verify
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-foreground">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {onVerifyClick && (
                  <td className="px-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onVerifyClick(row)}
                      className={cn("gap-1", variantColor[variant])}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verify
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground px-3">
              {page} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
