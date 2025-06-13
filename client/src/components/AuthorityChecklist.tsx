import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Phone, Mail } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
  expanded: boolean;
}

interface AuthorityChecklistData {
  sections: Array<{
    title: string;
    items: string[];
  }>;
}

export function AuthorityChecklist() {
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      // Load checklist data from server
      const response = await fetch('/api/authority-checklist');
      const data: AuthorityChecklistData = await response.json();
      
      // Convert to internal format with completion tracking
      const processedSections = data.sections.map((section, sectionIndex) => ({
        title: section.title,
        expanded: sectionIndex === 0, // First section expanded by default
        items: section.items.map((item, itemIndex) => ({
          id: `${sectionIndex}-${itemIndex}`,
          text: item,
          completed: false
        }))
      }));
      
      setSections(processedSections);
      
      // Load saved progress from localStorage
      const savedProgress = localStorage.getItem('authority-checklist-progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setSections(prev => prev.map(section => ({
          ...section,
          items: section.items.map(item => ({
            ...item,
            completed: progress[item.id] || false
          }))
        })));
      }
    } catch (error) {
      console.error('Failed to load authority checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    setSections(prev => {
      const updated = prev.map((section, sIdx) => {
        if (sIdx === sectionIndex) {
          return {
            ...section,
            items: section.items.map((item, iIdx) => {
              if (iIdx === itemIndex) {
                return { ...item, completed: !item.completed };
              }
              return item;
            })
          };
        }
        return section;
      });
      
      // Save progress to localStorage
      const progress: Record<string, boolean> = {};
      updated.forEach(section => {
        section.items.forEach(item => {
          progress[item.id] = item.completed;
        });
      });
      localStorage.setItem('authority-checklist-progress', JSON.stringify(progress));
      
      return updated;
    });
  };

  const toggleSection = (sectionIndex: number) => {
    setSections(prev => prev.map((section, idx) => 
      idx === sectionIndex 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const getTotalItems = () => {
    return sections.reduce((total, section) => total + section.items.length, 0);
  };

  const getCompletedItems = () => {
    return sections.reduce((total, section) => 
      total + section.items.filter(item => item.completed).length, 0
    );
  };

  const getCompletionPercentage = () => {
    const total = getTotalItems();
    const completed = getCompletedItems();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Authority Setup Checklist...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Authority Setup Checklist</CardTitle>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {getCompletedItems()} / {getTotalItems()} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={getCompletionPercentage()} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {getCompletionPercentage()}% Complete - Your progress is automatically saved
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <Collapsible
            key={sectionIndex}
            open={section.expanded}
            onOpenChange={() => toggleSection(sectionIndex)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    {section.items.filter(item => item.completed).length} / {section.items.length}
                  </Badge>
                  <span className="font-semibold text-left">{section.title}</span>
                </div>
                {section.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <div className="space-y-2 pl-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      item.completed 
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => toggleItem(sectionIndex, itemIndex)}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`${item.completed ? 'line-through text-green-700 dark:text-green-400' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Need Help With Any Step?
          </h3>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Call us: (920) 347-8919</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email: info@choose2achievemor.us</span>
            </div>
            <p className="mt-2">
              Office Hours: 7 a.m.–5 p.m. CT, Monday-Friday
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}