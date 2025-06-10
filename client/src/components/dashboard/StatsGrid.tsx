import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Truck, DollarSign, Calendar } from "lucide-react";

interface StatsGridProps {
  stats: any;
  isLoading: boolean;
  availableJobsCount: number;
  activeJobsCount: number;
}

export function StatsGrid({ stats, isLoading, availableJobsCount, activeJobsCount }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Clock,
      label: "Available Jobs",
      value: availableJobsCount,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Truck,
      label: "Active Jobs", 
      value: activeJobsCount,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      icon: DollarSign,
      label: "This Week",
      value: stats?.weeklyEarnings ? `$${stats.weeklyEarnings}` : "$0",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Calendar,
      label: "This Month",
      value: stats?.monthlyEarnings ? `$${stats.monthlyEarnings}` : "$0",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 ${item.bgColor} rounded-lg`}>
                <item.icon className={`${item.color} h-5 w-5`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
