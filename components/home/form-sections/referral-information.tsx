'use client';

import type {FormikProps} from 'formik';
import { useState, useEffect } from 'react';

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
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';

interface ReferralInformationProps {
  formik: FormikProps<FormValues>;
}

export const ReferralInformation = ({formik}: ReferralInformationProps) => {
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  // Fetch all mobilizer codes (both available and unavailable)
  useEffect(() => {
    const fetchCodes = async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch('/api/mobilizers/all-codes');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.codes) {
            setAvailableCodes(data.codes);
            break; // Success, exit retry loop
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error(`Error fetching mobilizer codes (attempt ${4 - retries}):`, error);
          retries--;
          if (retries === 0) {
            console.error('Failed to fetch mobilizer codes after 3 attempts');
            setAvailableCodes([]); // Set empty array as fallback
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      setLoadingCodes(false);
    };

    fetchCodes();
  }, []);
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
                }
                disabled={loadingCodes}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCodes ? 'Loading mobilizers...' : 'Select mobilizer'} />
                </SelectTrigger>
                <SelectContent className='max-h-[200px] overflow-y-auto'>
                  {loadingCodes ? (
                    <SelectItem value="" disabled>
                      Loading mobilizers...
                    </SelectItem>
                  ) : availableCodes.length === 0 ? (
                    <SelectItem value="" disabled>
                      No available mobilizers
                    </SelectItem>
                  ) : (
                    availableCodes.map(name => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </div>
    </FormSection>
  );
};
