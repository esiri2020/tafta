import type {FormikProps} from 'formik';
import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
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
  const [showError, setShowError] = useState(false);

  // Effect to handle error state
  useEffect(() => {
    if (hasError) {
      setShowError(true);
    } else {
      // If field was previously in error and is now valid, animate out
      if (showError) {
        const timer = setTimeout(() => {
          setShowError(false);
        }, 300); // Match this with CSS transition duration
        return () => clearTimeout(timer);
      }
    }
  }, [hasError, formik.values[id]]);

  // Add CSS for error animation using useEffect
  useEffect(() => {
    // Create style element if it doesn't exist
    const existingStyle = document.getElementById('form-field-animations');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'form-field-animations';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .error-ring {
          transition: all 0.3s ease-in-out;
        }
        .error-message {
          transition: all 0.3s ease-in-out;
          opacity: 1;
          transform: translateY(0);
        }
        .error-message.hide {
          opacity: 0;
          transform: translateY(-10px);
        }
      `;
      document.head.appendChild(style);

      // Cleanup
      return () => {
        const styleToRemove = document.getElementById('form-field-animations');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, []);

  return (
    <div
      className='space-y-2'
      data-field={id}
      data-section={id.split('.')[0]}
      data-has-error={hasError ? 'true' : 'false'}>
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
      <div
        className={`error-ring transition-all duration-300 ${
          hasError ? 'ring-2 ring-red-500 ring-offset-1 rounded-md' : ''
        }`}>
        {render()}
      </div>
      {(hasError || showError) && (
        <p
          className={`text-sm text-red-500 error-message ${
            hasError ? 'animate-shake' : 'hide'
          }`}>
          {formik.errors[id] as string}
        </p>
      )}
    </div>
  );
};
