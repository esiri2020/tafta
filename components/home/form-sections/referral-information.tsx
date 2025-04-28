'use client';

import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {FormValues} from '@/types/applicant';
import {mobilizer} from '@/data/form-options';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';

interface ReferralInformationProps {
  formik: FormikProps<FormValues>;
}

export const ReferralInformation = ({formik}: ReferralInformationProps) => {
  return (
    <FormSection title='Referral Information'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <FormField
            id='source'
            label='How did you hear about Tafta'
            formik={formik}
            tooltip='Please let us know how you discovered our program'
            render={() => (
              <RadioGroup
                value={formik.values.source}
                onValueChange={value => {
                  if (value !== 'by_referral') {
                    formik.setFieldValue('referrer_fullName', '');
                    formik.setFieldValue('referrer_phoneNumber', '');
                  }
                  formik.setFieldValue('source', value);
                }}
                className='flex space-x-4'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='social_media' id='source-social' />
                  <Label htmlFor='source-social'>Social Media</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='website' id='source-website' />
                  <Label htmlFor='source-website'>Website</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='by_referral' id='source-referral' />
                  <Label htmlFor='source-referral'>By Mobilizer</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {formik.values.source === 'by_referral' && (
          <FormField
            id='referrer_fullName'
            label='Mobilizer'
            formik={formik}
            tooltip='Select the name of the person who referred you to our program'
            render={() => (
              <Select
                name='referrer_fullName'
                value={formik.values.referrer_fullName}
                onValueChange={value =>
                  formik.setFieldValue('referrer_fullName', value)
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select mobilizer' />
                </SelectTrigger>
                <SelectContent className='max-h-[200px] overflow-y-auto'>
                  {mobilizer.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </div>
    </FormSection>
  );
};
