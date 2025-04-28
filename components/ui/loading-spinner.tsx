import {cn} from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({size = 'md', className}: LoadingSpinnerProps) {
  return (
    <div className='flex justify-center items-center p-4'>
      <div
        className={cn(
          'animate-spin rounded-full border-t-2 border-primary',
          size === 'sm' && 'h-4 w-4 border-2',
          size === 'md' && 'h-8 w-8 border-4',
          size === 'lg' && 'h-12 w-12 border-4',
          className,
        )}
      />
    </div>
  );
}
