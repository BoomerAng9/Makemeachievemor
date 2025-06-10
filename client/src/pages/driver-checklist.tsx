import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Truck, 
  Shield, 
  Calendar,
  Download,
  Save,
  RotateCcw
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  have: boolean;
  need: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export default function DriverChecklist() {
  const [checklist, setChecklist] = useState<ChecklistSection[]>([
    {
      id: "planning",
      title: "1. Planning & Business Setup",
      items: [
        { id: "roadmap", title: "Road-map chat (goals, lanes, budget)", have: false, need: false },
        { id: "entity", title: "Form legal entity (LLC / S-Corp) & EIN", have: false, need: false },
        { id: "business", title: "Business email, website, carrier packet template", have: false, need: false }
      ]
    },
    {
      id: "federal",
      title: "2. Federal Authority Package", 
      items: [
        { id: "usdot", title: "USDOT number (MCS-150)", have: false, need: false },
        { id: "authority", title: "Operating authority (OP-1 / OP-2)", have: false, need: false },
        { id: "boc3", title: "BOC-3 blanket agents", have: false, need: false },
        { id: "liability", title: "Public liability insurance on file (BMC-91/91X)", have: false, need: false },
        { id: "ucr", title: "Unified Carrier Registration (UCR)", have: false, need: false }
      ]
    },
    {
      id: "taxes",
      title: "3. Taxes & Specialty Permits",
      items: [
        { id: "hvut", title: "Heavy Vehicle Use Tax (HVUT 2290)", have: false, need: false },
        { id: "ifta", title: "IFTA fuel-tax account & decals", have: false, need: false },
        { id: "irp", title: "IRP apportioned plates", have: false, need: false },
        { id: "highway", title: "State highway-use permits (KYU, NY-HUT, etc.)", have: false, need: false },
        { id: "oversize", title: "Oversize/overweight & temp trip/fuel permits", have: false, need: false }
      ]
    },
    {
      id: "compliance",
      title: "4. Compliance Readiness",
      items: [
        { id: "audit", title: "DOT audit prep checklist", have: false, need: false },
        { id: "driver", title: "Driver qualification files", have: false, need: false },
        { id: "drug", title: "Drug & Alcohol consortium enrollment", have: false, need: false },
        { id: "eld", title: "ELD & HOS setup", have: false, need: false },
        { id: "safety", title: "Safety monitoring (CSA scores)", have: false, need: false }
      ]
    },
    {
      id: "ongoing",
      title: "5. Ongoing Support & Reminders",
      items: [
        { id: "biennial", title: "Biennial MCS-150 updates", have: false, need: false },
        { id: "ucr-renewal", title: "Annual UCR renewal", have: false, need: false },
        { id: "hvut-renewal", title: "Annual HVUT (2290) renewal", have: false, need: false },
        { id: "ifta-quarterly", title: "Quarterly IFTA filings", have: false, need: false },
        { id: "coach", title: "24/7 access to compliance coach", have: false, need: false }
      ]
    },
    {
      id: "operations",
      title: "6. Launching Freight Operations",
      items: [
        { id: "skills", title: "Freight skills mini-course", have: false, need: false },
        { id: "packet", title: "Carrier packet & marketing kit", have: false, need: false },
        { id: "factoring", title: "Factoring & fuel-card referrals", have: false, need: false },
        { id: "coaching", title: "First-load coaching", have: false, need: false }
      ]
    }
  ]);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [openQuestion, setOpenQuestion] = useState("");

  // Load saved data from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('achievemor-driver-checklist');
    const savedQuestion = localStorage.getItem('achievemor-checklist-question');
    const savedTime = localStorage.getItem('achievemor-checklist-saved');

    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    }
    if (savedQuestion) {
      setOpenQuestion(savedQuestion);
    }
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
  }, []);

  // Auto-save functionality
  const saveProgress = () => {
    localStorage.setItem('achievemor-driver-checklist', JSON.stringify(checklist));
    localStorage.setItem('achievemor-checklist-question', openQuestion);
    localStorage.setItem('achievemor-checklist-saved', new Date().toISOString());
    setLastSaved(new Date());
  };

  // Calculate completion statistics
  const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
  const completedItems = checklist.reduce((sum, section) => 
    sum + section.items.filter(item => item.have).length, 0
  );
  const neededItems = checklist.reduce((sum, section) => 
    sum + section.items.filter(item => item.need).length, 0
  );
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const updateItem = (sectionId: string, itemId: string, field: 'have' | 'need', value: boolean) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId 
                ? { ...item, [field]: value }
                : item
            )
          }
        : section
    ));
  };

  const resetChecklist = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setChecklist(prev => prev.map(section => ({
        ...section,
        items: section.items.map(item => ({ ...item, have: false, need: false }))
      })));
      setOpenQuestion("");
      localStorage.removeItem('achievemor-driver-checklist');
      localStorage.removeItem('achievemor-checklist-question');
      localStorage.removeItem('achievemor-checklist-saved');
      setLastSaved(null);
    }
  };

  const exportProgress = () => {
    const data = {
      question: openQuestion,
      checklist,
      completionPercentage,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievemor-driver-checklist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Authority Setup Checklist</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your progress through the essential steps to establish your trucking authority and launch your freight operations.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm text-gray-600">{completedItems} of {totalItems} items</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{neededItems}</div>
                  <div className="text-sm text-gray-600">Need Help</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open-ended Question */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Reflection Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="font-medium text-gray-900">
                When establishing your authority, what steps did you take to align legally?
              </p>
              <textarea
                value={openQuestion}
                onChange={(e) => setOpenQuestion(e.target.value)}
                placeholder="Share your experience, challenges, and lessons learned..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {checklist.map((section) => {
            const sectionCompleted = section.items.filter(item => item.have).length;
            const sectionNeeded = section.items.filter(item => item.need).length;
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {sectionCompleted}/{section.items.length} complete
                      </Badge>
                      {sectionNeeded > 0 && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          {sectionNeeded} need help
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="hidden sm:table-header-group">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Item</th>
                          <th className="text-center py-2 px-3 font-medium text-gray-700 w-24">Do you have?</th>
                          <th className="text-center py-2 px-3 font-medium text-gray-700 w-24">Do you need?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <div className="sm:hidden space-y-2 mb-3">
                                <div className="font-medium text-gray-900">{item.title}</div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <label className="flex items-center space-x-2 text-sm">
                                      <Checkbox
                                        checked={item.have}
                                        onCheckedChange={(checked) => 
                                          updateItem(section.id, item.id, 'have', checked as boolean)
                                        }
                                      />
                                      <span>Have</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                      <Checkbox
                                        checked={item.need}
                                        onCheckedChange={(checked) => 
                                          updateItem(section.id, item.id, 'need', checked as boolean)
                                        }
                                      />
                                      <span>Need</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="hidden sm:block font-medium text-gray-900">
                                {item.title}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell py-3 px-3 text-center">
                              <Checkbox
                                checked={item.have}
                                onCheckedChange={(checked) => 
                                  updateItem(section.id, item.id, 'have', checked as boolean)
                                }
                              />
                            </td>
                            <td className="hidden sm:table-cell py-3 px-3 text-center">
                              <Checkbox
                                checked={item.need}
                                onCheckedChange={(checked) => 
                                  updateItem(section.id, item.id, 'need', checked as boolean)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <Alert className="mt-8 bg-gray-900 text-white border-gray-900">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-center">
            <div className="text-lg font-bold mb-2">
              If you need any of these, we can help. Let's get it done right, THIS TIME.
            </div>
            <Button variant="secondary" className="mt-2">
              Get Expert Help Now
            </Button>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button onClick={saveProgress} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Progress
          </Button>
          <Button variant="outline" onClick={exportProgress} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Progress
          </Button>
          <Button variant="outline" onClick={resetChecklist} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
        </div>

        {/* Last Saved Indicator */}
        {lastSaved && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}