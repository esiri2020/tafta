'use client';

import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Input} from '@/components/ui/input';

import type {FormValues} from '@/types/applicant';
import {FormSection} from '@/components/form-section';

interface RegistrationTalpProps {
  formik: FormikProps<FormValues>;
}

export const RegistrationTalp = ({formik}: RegistrationTalpProps) => {
  return (
    <FormSection title='Registration & TALP'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
        <div className='space-y-2'>
          <Label>Registration Mode</Label>
          <RadioGroup
            value={formik.values.registrationMode}
            onValueChange={value =>
              formik.setFieldValue('registrationMode', value)
            }
            className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='online' id='mode-online' />
              <Label htmlFor='mode-online'>Online</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='learning_train' id='mode-learning' />
              <Label htmlFor='mode-learning'>Learning Train</Label>
            </div>
          </RadioGroup>
        </div>

        <div className='space-y-2'>
          <Label>TALP Participation</Label>
          <RadioGroup
            value={formik.values.talpParticipation.toString()}
            onValueChange={value => {
              const boolValue = value === 'true';
              if (!boolValue) {
                formik.setFieldValue('talpType', '');
                formik.setFieldValue('talpOther', '');
              }
              formik.setFieldValue('talpParticipation', boolValue);
            }}
            className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='true' id='talp-yes' />
              <Label htmlFor='talp-yes'>Yes</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='false' id='talp-no' />
              <Label htmlFor='talp-no'>No</Label>
            </div>
          </RadioGroup>
        </div>

        {formik.values.talpParticipation && (
          <div className='space-y-2'>
            <Label>TALP Type</Label>
            <RadioGroup
              value={formik.values.talpType}
              onValueChange={value => {
                if (value !== 'other') {
                  formik.setFieldValue('talpOther', '');
                }
                formik.setFieldValue('talpType', value);
              }}
              className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='film' id='talp-film' />
                <Label htmlFor='talp-film'>Film</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='theater' id='talp-theater' />
                <Label htmlFor='talp-theater'>Theater</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='content' id='talp-content' />
                <Label htmlFor='talp-content'>Content</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='other' id='talp-other' />
                <Label htmlFor='talp-other'>Other</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {formik.values.talpParticipation &&
          formik.values.talpType === 'other' && (
            <div className='space-y-2'>
              <Label htmlFor='talpOther'>Please specify</Label>
              <Input
                id='talpOther'
                name='talpOther'
                value={formik.values.talpOther}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          )}
      </div>
    </FormSection>
  );
};
