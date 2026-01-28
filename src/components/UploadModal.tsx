import { useState, useCallback } from "react";
import { X, Upload, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[]) => void;
  milestone?: string;
}

export function UploadModal({ isOpen, onClose, onSubmit, milestone = "Milestone" }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    // Simulate IPFS upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIpfsHash("QmX7b...d4f2a9");
    setIsUploading(false);
    onSubmit(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-vendor to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Upload Proof of Work</h3>
            <p className="text-sm text-muted-foreground">{milestone}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
              isDragging 
                ? "border-vendor bg-vendor/10" 
                : "border-border hover:border-vendor/50 hover:bg-vendor/5"
            )}
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className={cn(
                "w-12 h-12 mx-auto mb-4 transition-colors",
                isDragging ? "text-vendor" : "text-muted-foreground"
              )} />
              <p className="text-sm text-foreground font-medium">
                Drag & drop files here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <FileText className="w-4 h-4 text-vendor" />
                  <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* IPFS Hash Display */}
          {ipfsHash && (
            <div className="p-4 rounded-xl bg-public/10 border border-public/30">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-public" />
                <span className="text-sm font-medium text-public">Uploaded to IPFS</span>
              </div>
              <code className="text-xs text-muted-foreground mt-2 block font-mono">
                Hash: {ipfsHash}
              </code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="vendor" 
            className="flex-1"
            disabled={files.length === 0 || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Submit Proof"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
