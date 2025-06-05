'use client';

import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

import type {FormValues} from '@/types/applicant';
import {levels_of_education, user_disabilies} from '@/data/form-options';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';

interface EducationDisabilityProps {
  formik: FormikProps<FormValues>;
}

export const EducationDisability = ({formik}: EducationDisabilityProps) => {
  return (
    <FormSection title='Education & Disability'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='educationLevel'
          label='Education Level'
          formik={formik}
          required
          tooltip='Select your highest level of education'
          render={() => (
            <RadioGroup
              name='educationLevel'
              value={formik.values.educationLevel}
              onValueChange={value =>
                formik.setFieldValue('educationLevel', value)
              }
              className='space-y-2'>
              {levels_of_education.map(level => (
                <div key={level.value} className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={level.value}
                    id={`education-${level.value}`}
                  />
                  <Label htmlFor={`education-${level.value}`}>
                    {level.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />

        <div className='space-y-4'>
          <FormField
            id='_disability'
            label='Do you have any disabilities?'
            formik={formik}
            required
            tooltip='Please indicate if you have any disabilities'
            render={() => (
              <RadioGroup
                name='_disability'
                value={formik.values._disability.toString()}
                onValueChange={value => {
                  const boolValue = value === 'true';
                  if (!boolValue) {
                    formik.setFieldValue('disability', '');
                  }
                  formik.setFieldValue('_disability', boolValue);
                }}
                className='flex space-x-4 mt-2'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='true' id='disability-yes' />
                  <Label htmlFor='disability-yes'>Yes</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='false' id='disability-no' />
                  <Label htmlFor='disability-no'>No</Label>
                </div>
              </RadioGroup>
            )}
          />

          {formik.values._disability && (
            <FormField
              id='disability'
              label='Type of Disability'
              formik={formik}
              required
              tooltip='Please specify your type of disability'
              render={() => (
                <RadioGroup
                  name='disability'
                  value={formik.values.disability}
                  onValueChange={value =>
                    formik.setFieldValue('disability', value)
                  }
                  className='grid grid-cols-2 gap-2'>
                  {user_disabilies.map(disability => (
                    <div
                      key={disability.value}
                      className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value={disability.value}
                        id={`disability-type-${disability.value}`}
                        disabled={!formik.values._disability}
                      />
                      <Label htmlFor={`disability-type-${disability.value}`}>
                        {disability.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          )}
        </div>
      </div>
    </FormSection>
  );
};
