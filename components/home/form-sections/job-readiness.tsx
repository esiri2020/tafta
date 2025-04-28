import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';

import type {FormValues} from '@/types/applicant';
import {FormSection} from '@/components/form-section';

interface JobReadinessProps {
  formik: FormikProps<FormValues>;
}

export const JobReadiness = ({formik}: JobReadinessProps) => {
  return (
    <FormSection title='Job Readiness'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label>Job Readiness Indicators</Label>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='cv-reviewed'
                checked={formik.values.jobReadiness.includes('cv_reviewed')}
                onCheckedChange={checked => {
                  const newValues = checked
                    ? [...formik.values.jobReadiness, 'cv_reviewed']
                    : formik.values.jobReadiness.filter(
                        v => v !== 'cv_reviewed',
                      );
                  formik.setFieldValue('jobReadiness', newValues);
                }}
              />
              <Label htmlFor='cv-reviewed'>CV Reviewed</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='coaching-attended'
                checked={formik.values.jobReadiness.includes(
                  'coaching_attended',
                )}
                onCheckedChange={checked => {
                  const newValues = checked
                    ? [...formik.values.jobReadiness, 'coaching_attended']
                    : formik.values.jobReadiness.filter(
                        v => v !== 'coaching_attended',
                      );
                  formik.setFieldValue('jobReadiness', newValues);
                }}
              />
              <Label htmlFor='coaching-attended'>Coaching Attended</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='internship-placed'
                checked={formik.values.jobReadiness.includes(
                  'internship_placed',
                )}
                onCheckedChange={checked => {
                  const newValues = checked
                    ? [...formik.values.jobReadiness, 'internship_placed']
                    : formik.values.jobReadiness.filter(
                        v => v !== 'internship_placed',
                      );
                  formik.setFieldValue('jobReadiness', newValues);
                }}
              />
              <Label htmlFor='internship-placed'>Internship Placed</Label>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
