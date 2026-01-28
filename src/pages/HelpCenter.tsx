import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Search, Shield, Lock, FileText, Users, Eye, DollarSign } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Escrow & Payments",
    icon: Lock,
    color: "donor",
    questions: [
      {
        q: "How does escrow work in TrustChain?",
        a: "When you donate, funds are locked in a Polygon smart contract (escrow). They are only released when a milestone is completed and verified by NGO, Donor, and Auditor. This ensures your donation is used for its intended purpose."
      },
      {
        q: "What happens if a milestone is not approved?",
        a: "If any party (NGO, Donor, or Auditor) rejects the milestone, funds remain locked. The vendor must resubmit proof or the milestone can be reassigned to another vendor."
      },
      {
        q: "How long does payment release take?",
        a: "Once all parties approve, smart contract releases payment instantly. The transaction is confirmed on Polygon blockchain within seconds."
      },
    ]
  },
  {
    category: "Proof Verification",
    icon: FileText,
    color: "vendor",
    questions: [
      {
        q: "What is IPFS and why is it used?",
        a: "IPFS (InterPlanetary File System) is a decentralized storage network. We store all proof documents (invoices, receipts, photos) on IPFS so they cannot be tampered with or deleted. Each document gets a unique CID (Content Identifier)."
      },
      {
        q: "How do I verify a document on IPFS?",
        a: "Click on any IPFS link or CID in the platform. It will open the document on IPFS gateway. The CID itself is a cryptographic hash - if anyone changes even one byte, the hash changes."
      },
      {
        q: "What documents count as valid proof?",
        a: "Valid proof includes: vendor invoices with GST, payment receipts, work completion photos, delivery confirmations, and beneficiary acknowledgments. Each milestone may have specific requirements."
      },
    ]
  },
  {
    category: "Auditor & Fraud Prevention",
    icon: Eye,
    color: "auditor",
    questions: [
      {
        q: "How do auditors prevent fraud?",
        a: "Auditors review all transactions for anomalies: duplicate invoices, amount mismatches, suspicious vendors, and pattern analysis. They must approve before any payment release. Flagged transactions are investigated."
      },
      {
        q: "What is the vendor blacklist?",
        a: "Vendors found to be fraudulent (fake invoices, non-existent companies, etc.) are added to the blacklist. Blacklisted vendors cannot participate in any future schemes."
      },
      {
        q: "Can I report suspicious activity?",
        a: "Yes! Citizens, donors, and NGOs can flag suspicious proofs or transactions. Reports go directly to auditors for investigation."
      },
    ]
  },
  {
    category: "Citizen Feedback",
    icon: Users,
    color: "citizen",
    questions: [
      {
        q: "How do citizens give feedback?",
        a: "Citizens can verify service delivery through the Citizen Portal. They rate the quality, upload photos if needed, and their feedback is recorded on-chain as proof of successful completion."
      },
      {
        q: "What is Community Needs Portal?",
        a: "Community Needs allows citizens to post welfare requirements (healthcare, water, education). Popular needs get upvoted, NGOs can respond, and government may convert them into official schemes."
      },
      {
        q: "Is citizen feedback mandatory?",
        a: "Citizen verification is highly recommended as it provides ground-truth confirmation. Some schemes may require citizen feedback before final milestone approval."
      },
    ]
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleQuestion = (question: string) => {
    setOpenQuestions(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-government/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-public/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-government/10 border border-government/30 mb-6">
              <HelpCircle className="w-4 h-4 text-government" />
              <span className="text-sm font-medium text-government">Help Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to know about TrustChain's blockchain-verified transparency system.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {filteredFaqs.map((category) => (
              <div key={category.category} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", `bg-${category.color}/10`)}>
                      <category.icon className={cn("w-5 h-5", `text-${category.color}`)} />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{category.category}</h2>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {category.questions.map((faq) => (
                    <div key={faq.q} className="p-6">
                      <button
                        onClick={() => toggleQuestion(faq.q)}
                        className="w-full flex items-start justify-between text-left"
                      >
                        <span className="font-medium text-foreground pr-4">{faq.q}</span>
                        {openQuestions.includes(faq.q) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      {openQuestions.includes(faq.q) && (
                        <p className="mt-4 text-muted-foreground animate-fade-in">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="max-w-xl mx-auto mt-12 text-center">
            <div className="bg-card rounded-2xl border border-border p-8">
              <HelpCircle className="w-12 h-12 text-government mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a 
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-government text-government-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
