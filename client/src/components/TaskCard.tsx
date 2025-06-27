import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubjectIcon from "./SubjectIcon";
import { Check, Play, Clock } from "lucide-react";

interface TaskCardProps {
  task: {
    subject: string;
    topic: string;
    duration: number;
    type: string;
    priority: string;
    completed?: boolean;
  };
  onComplete?: () => void;
  onStart?: () => void;
}

export default function TaskCard({ task, onComplete, onStart }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className="card-shadow hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <SubjectIcon subject={task.subject} size="sm" />
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 line-clamp-1">
              {task.subject} - {task.topic}
            </h3>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {task.duration} min
              </div>
              <span className="text-sm text-gray-500 capitalize">• {task.type}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {task.completed ? (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 rounded-full"
                  onClick={onStart}
                >
                  <Play className="w-4 h-4 text-gray-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 bg-green-100 hover:bg-green-200 rounded-full"
                  onClick={onComplete}
                >
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
