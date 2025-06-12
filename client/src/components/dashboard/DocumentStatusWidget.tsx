import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Calendar,
  Award
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface Document {
  id: number;
  documentType: string;
  documentCategory: string;
  fileName: string;
  verificationStatus: string;
  expirationDate?: string;
  uploadedAt: string;
}

export function DocumentStatusWidget() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/glovebox/documents"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const verifiedDocs = documents.filter((doc: Document) => doc.verificationStatus === 'approved');
  const pendingDocs = documents.filter((doc: Document) => doc.verificationStatus === 'pending');
  const rejectedDocs = documents.filter((doc: Document) => doc.verificationStatus === 'rejected');
  
  const expiringDocs = documents.filter((doc: Document) => {
    if (!doc.expirationDate) return false;
    const expiry = new Date(doc.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  });

  const certificationDocs = verifiedDocs.filter((doc: Document) => doc.documentCategory === 'certification');
  const complianceDocs = verifiedDocs.filter((doc: Document) => doc.documentCategory === 'compliance');

  const completionPercentage = documents.length > 0 ? (verifiedDocs.length / documents.length) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </div>
          <Link href="/glovebox">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Verified</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{verifiedDocs.length}</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-700">{pendingDocs.length}</div>
          </div>
        </div>

        {/* Category Breakdown */}
        {verifiedDocs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Verified Categories</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>Certifications</span>
                </div>
                <Badge variant="secondary">{certificationDocs.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Compliance</span>
                </div>
                <Badge variant="secondary">{complianceDocs.length}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {expiringDocs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Expiring Soon</span>
            </div>
            <div className="space-y-1">
              {expiringDocs.slice(0, 2).map((doc: Document) => (
                <div key={doc.id} className="text-xs text-amber-700 flex items-center justify-between">
                  <span>{doc.documentType.replace(/_/g, ' ')}</span>
                  <span>{doc.expirationDate ? format(new Date(doc.expirationDate), 'MMM dd') : ''}</span>
                </div>
              ))}
              {expiringDocs.length > 2 && (
                <div className="text-xs text-amber-600">+{expiringDocs.length - 2} more</div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Documents</h4>
            <div className="space-y-2">
              {documents.slice(0, 3).map((doc: Document) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.verificationStatus)}
                    <span className="truncate max-w-[120px]">
                      {doc.documentType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(doc.verificationStatus)}>
                    {doc.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No documents uploaded yet</p>
            <Link href="/glovebox">
              <Button size="sm">
                Upload First Document
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {documents.length > 0 && (
          <div className="pt-2 border-t">
            <Link href="/glovebox">
              <Button variant="outline" size="sm" className="w-full">
                Manage Documents
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}