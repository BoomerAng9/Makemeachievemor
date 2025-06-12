import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DashboardWidget, WidgetTemplate } from "@shared/schema";

// Widget Components
const QuickStatsWidget = ({ config }: { config: any }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-xs text-muted-foreground">Active Jobs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">$5,240</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecentActivityWidget = ({ config }: { config: any }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Job #12345 completed</span>
          <span className="text-muted-foreground">2h ago</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>New opportunity available</span>
          <span className="text-muted-foreground">4h ago</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Payment received</span>
          <span className="text-muted-foreground">1d ago</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WeatherWidget = ({ config }: { config: any }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium">Weather</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <div className="text-3xl font-bold">72°F</div>
        <div className="text-sm text-muted-foreground">Partly Cloudy</div>
        <div className="text-xs text-muted-foreground mt-1">
          {config?.location || "Current Location"}
        </div>
      </div>
    </CardContent>
  </Card>
);

const NotificationsWidget = ({ config }: { config: any }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium">Notifications</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Vehicle inspection due</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>License renewal reminder</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WIDGET_COMPONENTS: Record<string, React.ComponentType<{ config: any }>> = {
  quick_stats: QuickStatsWidget,
  recent_activity: RecentActivityWidget,
  weather: WeatherWidget,
  notifications: NotificationsWidget,
};

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (templateId: number, config: any) => void;
}

function AddWidgetDialog({ open, onOpenChange, onAddWidget }: AddWidgetDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [config, setConfig] = useState<any>({});

  const { data: templates = [] } = useQuery<WidgetTemplate[]>({
    queryKey: ["/api/widget-templates"],
  });

  const handleAdd = () => {
    if (selectedTemplate) {
      const templateConfig = selectedTemplate.defaultConfiguration as any || {};
      onAddWidget(selectedTemplate.id, { ...templateConfig, ...config });
      setSelectedTemplate(null);
      setConfig({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Widget Type</Label>
            <Select onValueChange={(value) => {
              const template = templates.find(t => t.id === parseInt(value));
              setSelectedTemplate(template || null);
              setConfig(template?.defaultConfiguration || {});
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a widget type" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div>
              <Label>Widget Title</Label>
              <Input
                value={config.title || selectedTemplate.name}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Enter widget title"
              />
            </div>
          )}

          {selectedTemplate?.widgetType === 'weather' && (
            <div>
              <Label>Location</Label>
              <Input
                value={config.location || ''}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selectedTemplate}>
              Add Widget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: widgets = [], isLoading } = useQuery<DashboardWidget[]>({
    queryKey: ["/api/widgets"],
  });

  const createWidgetMutation = useMutation({
    mutationFn: async ({ templateId, config }: { templateId: number; config: any }) => {
      const response = await apiRequest("POST", "/api/widgets", {
        templateId,
        configuration: config,
        position: widgets.length,
        isVisible: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
      toast({
        title: "Widget added",
        description: "Your widget has been added to the dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add widget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: number) => {
      await apiRequest("DELETE", `/api/widgets/${widgetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
      toast({
        title: "Widget removed",
        description: "The widget has been removed from your dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove widget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddWidget = (templateId: number, config: any) => {
    createWidgetMutation.mutate({ templateId, config });
  };

  const handleDeleteWidget = (widgetId: number) => {
    deleteWidgetMutation.mutate(widgetId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={() => setAddWidgetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>

        {widgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Customize Your Dashboard
              </h3>
              <p className="text-gray-600 mb-6">
                Add widgets to personalize your dashboard and get quick access to the information that matters most to you.
              </p>
              <Button onClick={() => setAddWidgetOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {widgets.map((widget) => {
              const config = widget.configuration as any || {};
              const WidgetComponent = WIDGET_COMPONENTS[config.widgetType] || QuickStatsWidget;
              
              return (
                <div key={widget.id} className="relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteWidget(widget.id)}
                        title="Remove widget"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <WidgetComponent config={config} />
                </div>
              );
            })}
          </div>
        )}

        <AddWidgetDialog
          open={addWidgetOpen}
          onOpenChange={setAddWidgetOpen}
          onAddWidget={handleAddWidget}
        />
      </div>
    </div>
  );
}