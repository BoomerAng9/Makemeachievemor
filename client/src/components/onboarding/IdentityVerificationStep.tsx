import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useUploadDocument } from "@/hooks/useContractor";
import { useToast } from "@/hooks/use-toast";
import { IdCard } from "lucide-react";

interface IdentityVerificationStepProps {
  contractorId: number;
  onComplete: (data: any) => void;
}

export function IdentityVerificationStep({ contractorId, onComplete }: IdentityVerificationStepProps) {
  const [licenseFiles, setLicenseFiles] = useState<File[]>([]);
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

      onComplete({ documentsUploaded: licenseFiles.length });
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
        <div className="space-y-6">
          {/* Driver's License Upload */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
              <IdCard className="h-4 w-4 mr-2" />
              Driver's License Verification
            </h4>
            <p className="text-sm text-gray-500 mb-4">Upload clear photos of front and back of your driver's license</p>
            
            <div className="space-y-4">
              <FileUpload
                onFileSelect={handleLicenseUpload}
                accept="image/*,.pdf"
                className="h-40"
              >
                <div className="flex flex-col items-center">
                  <IdCard className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium">Upload Driver's License</p>
                  <p className="text-xs text-gray-500">Both front and back required</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or image format</p>
                </div>
              </FileUpload>

              {licenseFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {licenseFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <IdCard className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLicenseFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <IdCard className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">Identity Verification Requirements</h5>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Valid commercial driver's license (CDL)</li>
                  <li>• Clear, readable photos showing all information</li>
                  <li>• License must not be expired</li>
                  <li>• Both front and back images required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSubmit}
            disabled={licenseFiles.length === 0 || uploadDocument.isPending}
            className="bg-accent hover:bg-accent/90"
          >
            {uploadDocument.isPending ? "Uploading..." : "Continue to Vehicle Information"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
