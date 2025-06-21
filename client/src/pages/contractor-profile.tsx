import { useParams, Link } from "wouter";
import { UniversalNav } from "@/components/UniversalNav";
import { useAuth } from "@/hooks/useAuth";
import { useContractor } from "@/hooks/useContractor";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContractorProfilePage() {
  const { contractorId } = useParams<{ contractorId?: string }>();
  const { user } = useAuth();
  const id = contractorId ? parseInt(contractorId) : user?.id;
  const { data: contractor, isLoading } = useContractor(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Contractor profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalNav />
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{contractor.firstName} {contractor.lastName}</CardTitle>
            <CardDescription>{contractor.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Phone:</strong> {contractor.phone || "N/A"}</p>
            <p><strong>City:</strong> {contractor.city || "N/A"}</p>
            <p><strong>State:</strong> {contractor.state || "N/A"}</p>
          </CardContent>
        </Card>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </main>
    </div>
  );
}
