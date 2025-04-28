import type {ReactNode} from 'react';
import {InfoIcon} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {Label} from '@/components/ui/label';

interface TooltipFieldProps {
  id: string;
  label: string;
  tooltip: string;
  children: ReactNode;
  error?: string;
  showError?: boolean;
}

/**
 * TooltipField Component
 *
 * A form field wrapper that includes a label and tooltip for additional information.
 * Provides consistent styling and accessibility for form fields with tooltips.
 */
export const TooltipField = ({
  id,
  label,
  tooltip,
  children,
  error,
  showError = false,
}: TooltipFieldProps) => {
  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <Label htmlFor={id} className='text-sm font-medium'>
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <InfoIcon className='h-4 w-4 text-muted-foreground cursor-help' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs text-sm' side='right'>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {children}
      {showError && error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
};
