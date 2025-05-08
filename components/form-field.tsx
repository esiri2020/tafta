import type {FormikProps} from 'formik';
import type {ReactNode} from 'react';
import {Label} from '@/components/ui/label';
import {InfoIcon} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormFieldProps {
  id: string;
  label: string;
  formik: FormikProps<any>;
  render: () => ReactNode;
  tooltip?: string;
  required?: boolean;
}

export const FormField = ({
  id,
  label,
  formik,
  render,
  tooltip,
  required,
}: FormFieldProps) => {
  const hasError = formik.touched[id] && formik.errors[id];

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <Label htmlFor={id}>
          {label}
          {required && <span className='text-red-500'>*</span>}
        </Label>
        {tooltip && (
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
        )}
      </div>
      {render()}
      {hasError && (
        <p className='text-sm text-red-500'>{formik.errors[id] as string}</p>
      )}
    </div>
  );
};
