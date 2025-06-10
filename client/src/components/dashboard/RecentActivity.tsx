import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Truck, Handshake, MessageCircle } from "lucide-react";
import type { JobAssignment, Message } from "@shared/schema";

interface RecentActivityProps {
  jobs: JobAssignment[];
  messages: Message[];
  isLoading: boolean;
}

export function RecentActivity({ jobs, messages, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Combine and sort recent activities
  const activities = [
    ...jobs.slice(0, 3).map(job => ({
      type: 'job',
      icon: getJobIcon(job.status),
      title: getJobTitle(job.status),
      description: `Job #${job.id}`,
      time: job.completedAt || job.acceptedAt,
      color: getJobColor(job.status),
    })),
    ...messages.slice(0, 2).map(message => ({
      type: 'message',
      icon: MessageCircle,
      title: message.subject || 'New Message',
      description: `From ${message.senderName}`,
      time: message.createdAt,
      color: 'text-blue-600',
    }))
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());

  const unreadMessages = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${activity.color === 'text-green-600' ? 'bg-green-100' : activity.color === 'text-blue-600' ? 'bg-blue-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400">
                  {activity.time ? new Date(activity.time).toLocaleString() : 'Recently'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Messages</h4>
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              {unreadMessages} New
            </Badge>
          )}
        </div>
        
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.slice(0, 2).map((message) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{message.senderName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt || '').toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getJobIcon(status: string) {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in_progress':
      return Truck;
    case 'accepted':
      return Handshake;
    default:
      return Truck;
  }
}

function getJobTitle(status: string) {
  switch (status) {
    case 'completed':
      return 'Job Completed';
    case 'in_progress':
      return 'En Route';
    case 'accepted':
      return 'Job Accepted';
    default:
      return 'Job Update';
  }
}

function getJobColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'in_progress':
      return 'text-blue-600';
    case 'accepted':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}
