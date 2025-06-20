import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UniversalNav } from "@/components/UniversalNav";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Truck, 
  Shield, 
  Calendar,
  Download,
  Save,
  RotateCcw,
  ExternalLink,
  Mail,
  Eye,
  EyeOff
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

export default function DriverChecklistPage() {
  const [checklistData, setChecklistData] = useState<ChecklistSection[]>([]);
  const [openQuestion, setOpenQuestion] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSecurityModeEnabled, setIsSecurityModeEnabled] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved progress from backend
  const { data: savedProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/driver-checklist/progress'],
    enabled: isAuthenticated,
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { checklistData: ChecklistSection[], completionPercentage: number, isCompleted: boolean, openQuestion?: string }) => {
      return apiRequest('/api/driver-checklist/progress', {
        method: 'POST',
        body: JSON.stringify({
          checklistData: data.checklistData,
          completionPercentage: data.completionPercentage,
          isCompleted: data.isCompleted,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-checklist/progress'] });
      toast({
        title: "Progress Saved",
        description: "Your checklist progress has been saved to your account.",
      });
    },
  });

  // Clear progress mutation
  const clearProgressMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/driver-checklist/progress', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-checklist/progress'] });
      initializeChecklist();
      setOpenQuestion("");
      toast({
        title: "Progress Cleared",
        description: "Your checklist has been reset successfully.",
      });
    },
  });

  // Security: Disable screenshots and screen recording
  useEffect(() => {
    if (!isSecurityModeEnabled) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts for screenshots and dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common screenshot shortcuts
      if (
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || // Mac screenshots
        (e.key === 'PrintScreen') || // Windows screenshot
        (e.ctrlKey && e.shiftKey && e.key === 'S') || // Chrome screenshot extension
        (e.ctrlKey && e.key === 'F12') || // DevTools F12
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // DevTools Console
        (e.ctrlKey && e.key === 'u') || // View source
        (e.ctrlKey && e.key === 's') // Save page
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: "Action Blocked",
          description: "Screenshots and screen recording are disabled for security.",
          variant: "destructive",
        });
      }
    };

    // Add CSS to prevent selection and copying
    const style = document.createElement('style');
    style.textContent = `
      .checklist-content {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .checklist-content * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      /* Hide scrollbars for security */
      .checklist-content::-webkit-scrollbar {
        display: none;
      }
      .checklist-content {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isSecurityModeEnabled, toast]);

  // Initialize checklist data
  const initializeChecklist = () => {
    const initialData = [
      {
        id: "federal-authority",
        title: "1. Federal Authority & Registration",
        items: [
          { id: "mc-number", title: "MC Number (Motor Carrier Authority)", have: false, need: false },
          { id: "dot-number", title: "DOT Number Registration", have: false, need: false },
          { id: "usdot-registration", title: "USDOT Registration Completed", have: false, need: false },
          { id: "operating-authority", title: "Interstate Operating Authority", have: false, need: false },
          { id: "process-agent", title: "Process Agent Designation", have: false, need: false }
        ]
      },
      {
        id: "business-formation",
        title: "2. Business Formation & Tax Setup",
        items: [
          { id: "business-entity", title: "Business Entity Formation (LLC/Corp)", have: false, need: false },
          { id: "ein-number", title: "EIN (Employer Identification Number)", have: false, need: false },
          { id: "state-registration", title: "State Business Registration", have: false, need: false },
          { id: "quarterly-taxes", title: "Quarterly Tax Setup (Form 2290)", have: false, need: false },
          { id: "tax-professional", title: "Tax Professional/CPA Consultation", have: false, need: false }
        ]
      },
      {
        id: "insurance-compliance",
        title: "3. Insurance & Financial Compliance",
        items: [
          { id: "liability-insurance", title: "General Liability Insurance ($750K-$1M)", have: false, need: false },
          { id: "cargo-insurance", title: "Cargo Insurance ($100K minimum)", have: false, need: false },
          { id: "boc3-filing", title: "BOC-3 Process Agent Filing", have: false, need: false },
          { id: "surety-bond", title: "Surety Bond or Trust Fund ($75K)", have: false, need: false },
          { id: "workers-comp", title: "Workers' Compensation (if employees)", have: false, need: false }
        ]
      },
      {
        id: "vehicle-equipment",
        title: "4. Vehicle & Equipment Requirements",
        items: [
          { id: "commercial-vehicle", title: "Commercial Motor Vehicle (CDL Class)", have: false, need: false },
          { id: "vehicle-registration", title: "Vehicle Registration & Title", have: false, need: false },
          { id: "ifta-permit", title: "IFTA (International Fuel Tax Agreement)", have: false, need: false },
          { id: "irp-registration", title: "IRP (International Registration Plan)", have: false, need: false },
          { id: "dot-inspection", title: "DOT Vehicle Inspection & Decals", have: false, need: false }
        ]
      },
      {
        id: "permits-compliance",
        title: "5. Permits & Ongoing Compliance",
        items: [
          { id: "operating-permits", title: "State Operating Permits", have: false, need: false },
          { id: "oversize-permits", title: "Oversize/Overweight Permits (if needed)", have: false, need: false },
          { id: "hazmat-permits", title: "Hazmat Permits (if applicable)", have: false, need: false },
          { id: "drug-alcohol-program", title: "Drug & Alcohol Testing Program", have: false, need: false },
          { id: "driver-qualification", title: "Driver Qualification Files", have: false, need: false }
        ]
      },
      {
        id: "operational-systems",
        title: "6. Operational Systems & Technology",
        items: [
          { id: "eld-device", title: "ELD (Electronic Logging Device)", have: false, need: false },
          { id: "load-boards", title: "Load Board Subscriptions", have: false, need: false },
          { id: "dispatch-software", title: "Dispatch & Fleet Management Software", have: false, need: false },
          { id: "accounting-system", title: "Accounting & Bookkeeping System", have: false, need: false },
          { id: "communication-tools", title: "Communication Tools & Mobile Apps", have: false, need: false }
        ]
      }
    ];
    setChecklistData(initialData);
  };

  // Load saved progress from backend or initialize
  useEffect(() => {
    if (!progressLoading && !isLoading) {
      if (savedProgress?.checklistData) {
        setChecklistData(savedProgress.checklistData);
        // Load open question from local storage for now (can be moved to backend later)
        const savedQuestion = localStorage.getItem('achievemor-checklist-question');
        if (savedQuestion) {
          setOpenQuestion(savedQuestion);
        }
      } else {
        initializeChecklist();
      }
    }
  }, [savedProgress, progressLoading, isLoading]);

  // Auto-save progress when authenticated and data changes
  useEffect(() => {
    if (isAuthenticated && checklistData.length > 0) {
      const timeoutId = setTimeout(() => {
        const completionPercentage = calculateCompletionPercentage();
        const isCompleted = completionPercentage === 100;
        
        saveProgressMutation.mutate({
          checklistData,
          completionPercentage,
          isCompleted,
          openQuestion,
        });
        
        if (isCompleted && !showCompletionModal) {
          setShowCompletionModal(true);
        }
      }, 2000); // Debounce saves for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [checklistData, isAuthenticated]);

  // Save open question to localStorage
  useEffect(() => {
    if (openQuestion) {
      localStorage.setItem('achievemor-checklist-question', openQuestion);
    }
  }, [openQuestion]);

  // Calculate completion statistics
  const calculateCompletionPercentage = () => {
    const totalItems = checklistData.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = checklistData.reduce((sum, section) => 
      sum + section.items.filter(item => item.have).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const totalItems = checklistData.reduce((sum, section) => sum + section.items.length, 0);
  const completedItems = checklistData.reduce((sum, section) => 
    sum + section.items.filter(item => item.have).length, 0
  );
  const neededItems = checklistData.reduce((sum, section) => 
    sum + section.items.filter(item => item.need).length, 0
  );
  const completionPercentage = calculateCompletionPercentage();

  const updateItem = (sectionId: string, itemId: string, field: 'have' | 'need', value: boolean) => {
    setChecklistData(prev => prev.map(section => 
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

  const handleClearProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This will permanently delete your saved progress.")) {
      if (isAuthenticated) {
        clearProgressMutation.mutate();
      } else {
        // Clear local storage for unauthenticated users
        localStorage.removeItem('achievemor-checklist-question');
        initializeChecklist();
        setOpenQuestion("");
        toast({
          title: "Progress Cleared",
          description: "Your checklist has been reset.",
        });
      }
    }
  };

  const handleSaveProgress = () => {
    if (isAuthenticated) {
      const completionPercentage = calculateCompletionPercentage();
      saveProgressMutation.mutate({
        checklistData,
        completionPercentage,
        isCompleted: completionPercentage === 100,
        openQuestion,
      });
    } else {
      toast({
        title: "Login Required",
        description: "Please log in to save your progress to your account.",
        variant: "destructive",
      });
    }
  };

  const exportProgress = () => {
    const data = {
      question: openQuestion,
      checklist: checklistData,
      completionPercentage,
      exportDate: new Date().toISOString(),
      userInfo: user ? { email: user.email, name: `${user.firstName} ${user.lastName}` } : null
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

  const handleContactSupport = (method: 'form' | 'email') => {
    if (method === 'form') {
      window.open('https://achvmr-forms.paperform.co/', '_blank');
    } else {
      window.location.href = 'mailto:delivered@byachievemor.com?subject=Authority Setup Assistance&body=Hello, I have completed the Authority Setup Checklist and would like to discuss next steps for my trucking business.';
    }
  };

  if (isLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isSecurityModeEnabled ? 'checklist-content' : ''}`}>
      <UniversalNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Authority Setup Checklist
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed max-w-3xl">
                Track your progress through the essential steps to establish your trucking authority and launch your freight operations.
              </p>
            </div>
          </div>
          
          {!isAuthenticated && (
            <Alert className="mt-6 max-w-3xl mx-auto">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-left">
                <span className="block sm:inline">You're using the checklist as a guest.</span>{" "}
                <a href="/api/login" className="font-medium text-blue-600 hover:underline underline-offset-2">
                  Log in
                </a>{" "}
                <span className="block sm:inline">to save your progress to your account and resume later.</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Security and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSecurityModeEnabled(!isSecurityModeEnabled)}
              className="flex items-center gap-2 text-xs"
            >
              {isSecurityModeEnabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {isSecurityModeEnabled ? 'Disable Security' : 'Enable Security'}
            </Button>
            <span className="text-xs text-gray-500 hidden sm:block">
              Security mode prevents screenshots and copying
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProgress}
              disabled={saveProgressMutation.isPending}
              className="flex items-center gap-2 text-xs"
            >
              <Save className="h-3 w-3" />
              {saveProgressMutation.isPending ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearProgress}
              disabled={clearProgressMutation.isPending}
              className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-3 w-3" />
              Clear & Restart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportProgress}
              className="flex items-center gap-2 text-xs"
            >
              <Download className="h-3 w-3" />
              Export Data
            </Button>
          </div>
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
            <CardTitle className="text-lg text-gray-900 leading-relaxed">
              Reflection Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-gray-900 leading-relaxed text-sm sm:text-base">
                  When establishing your authority, what steps did you take to align legally with federal and state requirements?
                </p>
              </div>
              <textarea
                value={openQuestion}
                onChange={(e) => setOpenQuestion(e.target.value)}
                placeholder="Share your experience, challenges faced, lessons learned, and specific steps you took to ensure compliance..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
                rows={5}
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                This reflection helps us understand your journey and provide personalized guidance for your next steps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {checklistData.map((section) => {
            const sectionCompleted = section.items.filter(item => item.have).length;
            const sectionNeeded = section.items.filter(item => item.need).length;
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg text-gray-900 leading-relaxed">
                      {section.title}
                    </CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
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
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex-1 mb-3 sm:mb-0 sm:pr-4">
                          <span className="text-sm font-medium text-gray-900 leading-relaxed block">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex gap-6 flex-shrink-0">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={item.have}
                              onCheckedChange={(checked) => 
                                updateItem(section.id, item.id, 'have', checked === true)
                              }
                              className="group-hover:border-green-500"
                            />
                            <span className="text-xs text-green-600 font-medium group-hover:text-green-700">
                              I Have This
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={item.need}
                              onCheckedChange={(checked) => 
                                updateItem(section.id, item.id, 'need', checked === true)
                              }
                              className="group-hover:border-orange-500"
                            />
                            <span className="text-xs text-orange-600 font-medium group-hover:text-orange-700">
                              Need Help
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Modal */}
        <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-left">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="leading-tight">
                  Congratulations! Checklist Complete
                </span>
              </DialogTitle>
              <DialogDescription className="text-left leading-relaxed pt-2">
                You've completed all items in the Authority Setup Checklist. You're ready to take the next steps in establishing your trucking business.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Now that you've completed the checklist, our team can provide personalized guidance and support for your trucking business setup and growth strategy.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => handleContactSupport('form')}
                  className="flex items-center justify-center gap-2 flex-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Complete Needs Analysis
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleContactSupport('email')}
                  className="flex items-center justify-center gap-2 flex-1"
                >
                  <Mail className="h-4 w-4" />
                  Email Our Team
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Choose the option that works best for you. We're here to help you succeed.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}