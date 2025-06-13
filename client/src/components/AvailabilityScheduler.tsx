import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Star,
  Timer,
  Lock
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface WeeklySchedule {
  [key: string]: {
    available: boolean;
    start: string;
    end: string;
  };
}

interface TrustMetrics {
  trustRating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  noShowJobs: number;
  onTimeRate: number;
  customerRating: number;
  responseTime: number;
  accountStatus: string;
  lastRatingUpdate: string;
  scheduleLockedUntil?: string;
}

interface AvailabilityData {
  schedule: WeeklySchedule;
  scheduleSetAt: string;
  scheduleLockedUntil: string;
  isCurrentlyAvailable: boolean;
  trustMetrics: TrustMetrics;
}

interface AvailabilitySchedulerProps {
  onAvailabilityUpdate: (availability: AvailabilityData) => void;
  initialData?: Partial<AvailabilityData>;
  isRequired?: boolean;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" }
];

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { available: true, start: "08:00", end: "17:00" },
  tuesday: { available: true, start: "08:00", end: "17:00" },
  wednesday: { available: true, start: "08:00", end: "17:00" },
  thursday: { available: true, start: "08:00", end: "17:00" },
  friday: { available: true, start: "08:00", end: "17:00" },
  saturday: { available: false, start: "09:00", end: "15:00" },
  sunday: { available: false, start: "09:00", end: "15:00" }
};

export function AvailabilityScheduler({ 
  onAvailabilityUpdate, 
  initialData,
  isRequired = false 
}: AvailabilitySchedulerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    initialData?.schedule || DEFAULT_SCHEDULE
  );
  const [isCurrentlyAvailable, setIsCurrentlyAvailable] = useState(
    initialData?.isCurrentlyAvailable ?? true
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isScheduleLocked, setIsScheduleLocked] = useState(false);
  const [lockExpiresIn, setLockExpiresIn] = useState<number>(0);

  const trustMetrics: TrustMetrics = initialData?.trustMetrics || {
    trustRating: 100.0,
    totalJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    noShowJobs: 0,
    onTimeRate: 100.0,
    customerRating: 5.0,
    responseTime: 15,
    accountStatus: "active",
    lastRatingUpdate: new Date().toISOString()
  };

  // Check if schedule is locked
  useEffect(() => {
    if (initialData?.scheduleLockedUntil) {
      const lockDate = new Date(initialData.scheduleLockedUntil);
      const now = new Date();
      const daysRemaining = differenceInDays(lockDate, now);
      
      if (daysRemaining > 0) {
        setIsScheduleLocked(true);
        setLockExpiresIn(daysRemaining);
      }
    }
  }, [initialData?.scheduleLockedUntil]);

  const handleDayAvailabilityChange = (day: string, available: boolean) => {
    if (isScheduleLocked) return;
    
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], available }
    }));
    setHasUnsavedChanges(true);
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    if (isScheduleLocked) return;
    
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSchedule = () => {
    const now = new Date();
    const lockUntil = addDays(now, 7); // Lock for 1 week
    
    const availabilityData: AvailabilityData = {
      schedule,
      scheduleSetAt: now.toISOString(),
      scheduleLockedUntil: lockUntil.toISOString(),
      isCurrentlyAvailable,
      trustMetrics
    };

    onAvailabilityUpdate(availabilityData);
    setHasUnsavedChanges(false);
    setIsScheduleLocked(true);
    setLockExpiresIn(7);
  };

  const getTrustRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-600";
    if (rating >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccountStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      warning: "secondary",
      probation: "destructive",
      suspended: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateCompletionRate = () => {
    if (trustMetrics.totalJobs === 0) return 100;
    return Math.round((trustMetrics.completedJobs / trustMetrics.totalJobs) * 100);
  };

  const getAvailableHours = () => {
    return Object.values(schedule).reduce((total, day) => {
      if (!day.available) return total;
      
      const start = new Date(`1970-01-01T${day.start}:00`);
      const end = new Date(`1970-01-01T${day.end}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      return total + hours;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Trust Rating Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trust Rating & Performance Analytics
          </CardTitle>
          <CardDescription>
            Your trust rating affects job opportunities. Maintain 80%+ to stay active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trust Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getTrustRatingColor(trustMetrics.trustRating)}`}>
                {trustMetrics.trustRating.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Trust Rating</div>
              <Progress 
                value={trustMetrics.trustRating} 
                className="mt-2"
                aria-label="Trust rating progress"
              />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {calculateCompletionRate()}%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <div className="text-xs mt-1">
                {trustMetrics.completedJobs} of {trustMetrics.totalJobs} jobs
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{trustMetrics.customerRating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
              <div className="text-xs mt-1">Average response: {trustMetrics.responseTime}min</div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div>
              <div className="font-semibold">Account Status</div>
              <div className="text-sm text-muted-foreground">
                Last updated: {format(new Date(trustMetrics.lastRatingUpdate), "MMM dd, yyyy")}
              </div>
            </div>
            {getAccountStatusBadge(trustMetrics.accountStatus)}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{trustMetrics.onTimeRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">On-Time Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{trustMetrics.cancelledJobs}</div>
              <div className="text-sm text-muted-foreground">Cancelled Jobs</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{trustMetrics.noShowJobs}</div>
              <div className="text-sm text-muted-foreground">No-Shows</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{trustMetrics.totalJobs}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </div>
          </div>

          {/* Trust Rating Warning */}
          {trustMetrics.trustRating < 90 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {trustMetrics.trustRating < 80 
                  ? "Warning: Your trust rating is below 80%. Risk of account suspension."
                  : "Your trust rating has declined. Focus on reliability to improve your score."
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Availability Schedule
          </CardTitle>
          <CardDescription>
            Set your weekly schedule. Once saved, it cannot be changed for 7 days.
            {lockExpiresIn > 0 && ` Schedule locked for ${lockExpiresIn} more days.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule Lock Warning */}
          {isScheduleLocked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Your schedule is locked until {format(new Date(initialData?.scheduleLockedUntil || ""), "MMM dd, yyyy")}. 
                This ensures reliability for customers and companies.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div>
              <Label htmlFor="currentlyAvailable" className="text-base font-semibold">
                Currently Available for Jobs
              </Label>
              <p className="text-sm text-muted-foreground">
                Toggle this off for temporary unavailability (illness, vacation, etc.)
              </p>
            </div>
            <Switch
              id="currentlyAvailable"
              checked={isCurrentlyAvailable}
              onCheckedChange={setIsCurrentlyAvailable}
            />
          </div>

          {/* Weekly Schedule Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Weekly Schedule</h4>
              <div className="text-sm text-muted-foreground">
                Total: {getAvailableHours().toFixed(1)} hours/week
              </div>
            </div>

            {DAYS_OF_WEEK.map(day => (
              <div key={day.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={schedule[day.key].available}
                    onCheckedChange={(checked) => handleDayAvailabilityChange(day.key, checked)}
                    disabled={isScheduleLocked}
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {schedule[day.key].available && (
                  <>
                    <div>
                      <Label htmlFor={`${day.key}-start`} className="text-sm">Start Time</Label>
                      <Input
                        id={`${day.key}-start`}
                        type="time"
                        value={schedule[day.key].start}
                        onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                        disabled={isScheduleLocked}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${day.key}-end`} className="text-sm">End Time</Label>
                      <Input
                        id={`${day.key}-end`}
                        type="time"
                        value={schedule[day.key].end}
                        onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                        disabled={isScheduleLocked}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const start = new Date(`1970-01-01T${schedule[day.key].start}:00`);
                        const end = new Date(`1970-01-01T${schedule[day.key].end}:00`);
                        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        return `${hours.toFixed(1)} hours`;
                      })()}
                    </div>
                  </>
                )}

                {!schedule[day.key].available && (
                  <div className="col-span-3 text-sm text-muted-foreground">
                    Not available
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          {!isScheduleLocked && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges && "You have unsaved changes"}
              </div>
              <Button 
                onClick={saveSchedule}
                disabled={!hasUnsavedChanges}
                className="w-full md:w-auto"
              >
                {hasUnsavedChanges ? "Save Schedule (Locks for 7 Days)" : "Schedule Saved"}
              </Button>
            </div>
          )}

          {!isRequired && !hasUnsavedChanges && !isScheduleLocked && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => onAvailabilityUpdate({
                  schedule: DEFAULT_SCHEDULE,
                  scheduleSetAt: new Date().toISOString(),
                  scheduleLockedUntil: addDays(new Date(), 7).toISOString(),
                  isCurrentlyAvailable: true,
                  trustMetrics
                })}
              >
                Use Default Schedule & Skip
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Monday-Friday 8AM-5PM (can be changed later)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}