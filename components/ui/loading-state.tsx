import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Progress } from './progress';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  progress?: number;
  message?: string;
}

export function LoadingState({ size = 'md', className, progress, message }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-4 gap-4', className)}>
      <LoadingSpinner size={size} />
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
        </div>
      )}
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
} 