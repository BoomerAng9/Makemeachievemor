import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UniversalNav } from "@/components/UniversalNav";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Upload, 
  Download, 
  Share2, 
  Trash2, 
  Eye, 
  Calendar,
  Shield,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  Award
} from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: number;
  documentType: string;
  documentCategory: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  expirationDate?: string;
  verificationStatus: string;
  tags?: string[];
  notes?: string;
  isShared: boolean;
  shareableUntil?: string;
  uploadedAt: string;
  updatedAt: string;
}

interface DocumentShare {
  id: number;
  shareToken: string;
  documentIds: number[];
  recipientCompany?: string;
  recipientEmail?: string;
  message?: string;
  expiresAt: string;
  viewCount: number;
  maxViews: number;
  isActive: boolean;
  createdAt: string;
}

const DOCUMENT_CATEGORIES = [
  { value: "compliance", label: "DOT Compliance", icon: Shield },
  { value: "vehicle", label: "Vehicle Documents", icon: FileText },
  { value: "business", label: "Business Documents", icon: FileText },
  { value: "certification", label: "Certifications", icon: CheckCircle },
];

const DOCUMENT_TYPES = {
  compliance: [
    "dot_medical_card",
    "drug_test_results",
    "background_check",
    "safety_training",
    "hazmat_endorsement"
  ],
  vehicle: [
    "vehicle_registration",
    "insurance_policy",
    "inspection_certificate",
    "maintenance_records",
    "lease_agreement"
  ],
  business: [
    "mc_authority",
    "operating_authority",
    "boc3_filing",
    "ifta_permit",
    "irp_registration"
  ],
  certification: [
    "cdl_certificate",
    "endorsements",
    "training_certificates",
    "safety_awards",
    "compliance_certificates"
  ]
};

export default function Glovebox() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  // Fetch user documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/glovebox/documents"],
    enabled: isAuthenticated,
  });

  // Fetch active shares
  const { data: activeShares = [] } = useQuery({
    queryKey: ["/api/glovebox/shares"],
    enabled: isAuthenticated,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/glovebox/upload", {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glovebox/documents"] });
      setIsUploadOpen(false);
    },
  });

  // Create share mutation
  const shareMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/glovebox/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glovebox/shares"] });
      setIsShareOpen(false);
      setSelectedDocs([]);
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest(`/api/glovebox/documents/${documentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glovebox/documents"] });
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Note: Driver licenses are NOT stored - they must be uploaded fresh each time
    const documentType = formData.get("documentType") as string;
    if (documentType === "drivers_license") {
      alert("Driver licenses cannot be stored for security reasons. Please upload fresh when needed.");
      return;
    }
    
    uploadMutation.mutate(formData);
  };

  const handleShare = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const shareData = {
      documentIds: selectedDocs,
      recipientCompany: formData.get("recipientCompany"),
      recipientEmail: formData.get("recipientEmail"),
      message: formData.get("message"),
      expiresIn: parseInt(formData.get("expiresIn") as string) || 24, // hours
      maxViews: parseInt(formData.get("maxViews") as string) || 5,
    };
    
    shareMutation.mutate(shareData);
  };

  const handleSocialShare = async (platform: string) => {
    const verifiedDocs = documents.filter((doc: Document) => doc.verificationStatus === 'approved');
    const certificationDocs = verifiedDocs.filter((doc: Document) => doc.documentCategory === 'certification');
    const complianceDocs = verifiedDocs.filter((doc: Document) => doc.documentCategory === 'compliance');
    
    const shareText = `🚛 Proud to share my professional credentials as a verified ACHIEVEMOR driver!

✅ ${verifiedDocs.length} verified documents
🏆 ${certificationDocs.length} certifications
📋 ${complianceDocs.length} compliance records

Ready for new opportunities in the transportation industry!

#ACHIEVEMOR #TruckDriver #Professional #Verified #Transportation #Logistics`;

    const profileUrl = `${window.location.origin}/profile/${user?.id}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(shareText)}`,
      instagram: shareText // Copy text for Instagram
    };

    if (platform === 'instagram') {
      await navigator.clipboard.writeText(shareText);
      alert('Text copied to clipboard! Paste it in your Instagram post.');
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const copyShareText = async () => {
    const verifiedDocs = documents.filter((doc: Document) => doc.verificationStatus === 'approved');
    const shareText = `🚛 Proud to share my professional credentials as a verified ACHIEVEMOR driver!

✅ ${verifiedDocs.length} verified documents
Ready for new opportunities in the transportation industry!

#ACHIEVEMOR #TruckDriver #Professional #Verified`;
    
    await navigator.clipboard.writeText(shareText);
    alert('Share text copied to clipboard!');
  };

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesCategory = selectedCategory === "all" || doc.documentCategory === selectedCategory;
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Access Your Glovebox</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your secure document storage.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <UniversalNav />
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Glovebox</h1>
              <p className="text-muted-foreground">Secure document storage and fast credential sharing</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Security Notice</span>
            </div>
            <p className="text-amber-700 mt-1">
              Driver licenses are never stored for security compliance. Upload fresh copies when needed for verification.
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isSocialShareOpen} onOpenChange={setIsSocialShareOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Credentials
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Share Your Professional Credentials</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Your Verified Documents</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-blue-700">
                        ✅ {documents.filter((doc: Document) => doc.verificationStatus === 'approved').length} Verified
                      </div>
                      <div className="text-blue-700">
                        🏆 {documents.filter((doc: Document) => doc.documentCategory === 'certification' && doc.verificationStatus === 'approved').length} Certifications
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleSocialShare('linkedin')} className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialShare('facebook')} className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-700" />
                      Facebook
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialShare('twitter')} className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-sky-500" />
                      Twitter
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialShare('instagram')} className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      Instagram
                    </Button>
                  </div>
                  
                  <Button variant="outline" onClick={copyShareText} className="w-full flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Share Text
                  </Button>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Privacy:</strong> Only verification status is shared. Document content remains private.
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="documentCategory">Category</Label>
                    <Select name="documentCategory" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="documentType">Document Type</Label>
                    <Input
                      id="documentType"
                      name="documentType"
                      placeholder="e.g., insurance_policy"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                    <Input
                      id="expirationDate"
                      name="expirationDate"
                      type="date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="Comma-separated tags"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Add any notes about this document"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            {selectedDocs.length > 0 && (
              <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Selected ({selectedDocs.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Documents</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleShare} className="space-y-4">
                    <div>
                      <Label htmlFor="recipientCompany">Company Name</Label>
                      <Input
                        id="recipientCompany"
                        name="recipientCompany"
                        placeholder="Company requesting documents"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recipientEmail">Contact Email</Label>
                      <Input
                        id="recipientEmail"
                        name="recipientEmail"
                        type="email"
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Additional message for the recipient"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiresIn">Expires In (Hours)</Label>
                        <Select name="expiresIn" defaultValue="24">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="24">24 Hours</SelectItem>
                            <SelectItem value="72">3 Days</SelectItem>
                            <SelectItem value="168">1 Week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="maxViews">Max Views</Label>
                        <Select name="maxViews" defaultValue="5">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 View</SelectItem>
                            <SelectItem value="3">3 Views</SelectItem>
                            <SelectItem value="5">5 Views</SelectItem>
                            <SelectItem value="10">10 Views</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={shareMutation.isPending}>
                      {shareMutation.isPending ? "Creating Share..." : "Create Share Link"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="shares">Active Shares</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start by uploading your first document to your Glovebox"
                  }
                </p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Document
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc: Document) => (
                  <Card key={doc.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium truncate">
                            {doc.originalFileName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {doc.documentType.replace(/_/g, ' ').toUpperCase()}
                          </CardDescription>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocs([...selectedDocs, doc.id]);
                            } else {
                              setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(doc.verificationStatus)}>
                          {doc.verificationStatus}
                        </Badge>
                        {isExpiringSoon(doc.expirationDate) && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      
                      {doc.expirationDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Expires: {format(new Date(doc.expirationDate), "MMM dd, yyyy")}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Uploaded: {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                      </div>
                      
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{doc.notes}</p>
                      )}
                      
                      <div className="flex gap-1 pt-2">
                        <Button size="sm" variant="outline" className="h-8 flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => deleteMutation.mutate(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shares" className="space-y-4">
            {activeShares.length === 0 ? (
              <Card className="p-8 text-center">
                <Share2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Shares</h3>
                <p className="text-muted-foreground">
                  Select documents and create shares to send credentials to companies quickly
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeShares.map((share: DocumentShare) => (
                  <Card key={share.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{share.recipientCompany}</h4>
                          <p className="text-sm text-muted-foreground">{share.recipientEmail}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Created: {format(new Date(share.createdAt), "MMM dd, yyyy HH:mm")}</span>
                            <span>Expires: {format(new Date(share.expiresAt), "MMM dd, yyyy HH:mm")}</span>
                            <span>Views: {share.viewCount}/{share.maxViews}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Copy Link</Button>
                          <Button size="sm" variant="outline">Deactivate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}