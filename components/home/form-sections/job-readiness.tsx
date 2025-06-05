import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';

import type {FormValues} from '@/types/applicant';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';

interface JobReadinessProps {
  formik: FormikProps<FormValues>;
}

const jobReadinessOptions = [
  {id: 'cv-reviewed', value: 'cv_reviewed', label: 'CV Reviewed'},
  {
    id: 'coaching-attended',
    value: 'coaching_attended',
    label: 'Coaching Attended',
  },
  {
    id: 'internship-placed',
    value: 'internship_placed',
    label: 'Internship Placed',
  },
];

export const JobReadiness = ({formik}: JobReadinessProps) => {
  return (
    <FormSection title='Job Readiness'>
      <FormField
        id='jobReadiness'
        label='Job Readiness Indicators'
        formik={formik}
        required
        tooltip='Select all job readiness indicators that apply to you'
        render={() => (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
            {jobReadinessOptions.map(option => (
              <div key={option.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={option.id}
                  checked={formik.values.jobReadiness.includes(option.value)}
                  onCheckedChange={checked => {
                    const newValues = checked
                      ? [...formik.values.jobReadiness, option.value]
                      : formik.values.jobReadiness.filter(
                          v => v !== option.value,
                        );
                    formik.setFieldValue('jobReadiness', newValues);
                    formik.setFieldTouched('jobReadiness', true, false);
                  }}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        )}
      />
    </FormSection>
  );
};
