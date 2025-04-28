import type {ReactNode} from 'react';
import {Separator} from '@/components/ui/separator';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection = ({title, children}: FormSectionProps) => {
  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium'>{title}</h3>
      <Separator />
      {children}
    </div>
  );
};
