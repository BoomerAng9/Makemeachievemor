import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { useUploadDocument } from "@/hooks/useContractor";
import { useToast } from "@/hooks/use-toast";
import { IdCard, Shield } from "lucide-react";

interface IdentityVerificationStepProps {
  contractorId: number;
  onComplete: (data: any) => void;
}

export function IdentityVerificationStep({ contractorId, onComplete }: IdentityVerificationStepProps) {
  const [licenseFiles, setLicenseFiles] = useState<File[]>([]);
  const [ssnLast4, setSsnLast4] = useState("");
  const { toast } = useToast();
  const uploadDocument = useUploadDocument(contractorId);

  const handleLicenseUpload = (file: File) => {
    setLicenseFiles(prev => [...prev, file]);
  };

  const handleRemoveLicenseFile = (index: number) => {
    setLicenseFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Upload driver's license files
      for (const file of licenseFiles) {
        await uploadDocument.mutateAsync({
          file,
          documentType: 'drivers_license'
        });
      }

      toast({
        title: "Documents uploaded successfully",
        description: "Your identity verification documents have been submitted for review.",
      });

      onComplete({ ssnLast4, documentsUploaded: licenseFiles.length });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center">
            <IdCard className="h-4 w-4" />
          </div>
          <CardTitle>Identity Verification</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver's License Upload */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
              <IdCard className="h-4 w-4 mr-2" />
              Driver's License
            </h4>
            <p className="text-sm text-gray-500 mb-4">Upload front and back of license</p>
            
            <div className="space-y-4">
              <FileUpload
                onFileSelect={handleLicenseUpload}
                accept="image/*,.pdf"
                className="h-32"
              >
                <div className="flex flex-col items-center">
                  <IdCard className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Upload License</p>
                  <p className="text-xs text-gray-500">Front and back required</p>
                </div>
              </FileUpload>

              {licenseFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {licenseFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLicenseFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SSN Verification */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              SSN Verification
            </h4>
            <p className="text-sm text-gray-500 mb-4">Last 4 digits for verification</p>
            
            <div className="flex justify-center">
              <Input
                type="password"
                placeholder="****"
                maxLength={4}
                value={ssnLast4}
                onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                className="w-24 text-center text-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSubmit}
            disabled={licenseFiles.length === 0 || ssnLast4.length !== 4 || uploadDocument.isPending}
            className="bg-accent hover:bg-accent/90"
          >
            {uploadDocument.isPending ? "Uploading..." : "Continue to Vehicle Information"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
