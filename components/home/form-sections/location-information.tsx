'use client';

import type {FormikProps} from 'formik';
import {useEffect, useState} from 'react';

import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

import type {FormValues} from '@/types/applicant';
import {nigeria_states, LGAs, community_areas} from '@/data/form-options';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';

interface LocationInformationProps {
  formik: FormikProps<FormValues>;
}

export const LocationInformation = ({formik}: LocationInformationProps) => {
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);

  // Update available LGAs when state changes
  useEffect(() => {
    if (formik.values.stateOfResidence) {
      const selectedState = formik.values.stateOfResidence;
      // Type guard to ensure selectedState is a valid key of LGAs
      if (selectedState in LGAs) {
        const allLGAs = Object.values(LGAs[selectedState as keyof typeof LGAs]).flat();
        setAvailableLGAs(allLGAs);
      } else {
        setAvailableLGAs([]);
      }
    }
  }, [formik.values.stateOfResidence]);

  return (
    <FormSection title='Location Information'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='homeAddress'
          label='Home Address'
          formik={formik}
          tooltip='Enter your current residential address where you can receive mail'
          render={() => (
            <Textarea
              id='homeAddress'
              name='homeAddress'
              value={formik.values.homeAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter your home address'
            />
          )}
        />

        <FormField
          id='stateOfResidence'
          label='State of Residence'
          formik={formik}
          tooltip='Select the Nigerian state where you currently reside'
          render={() => (
            <Select
              name='stateOfResidence'
              value={formik.values.stateOfResidence}
              onValueChange={value =>
                formik.setFieldValue('stateOfResidence', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select state' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {nigeria_states.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='LGADetails'
          label='LGA Details'
          formik={formik}
          tooltip='Select your Local Government Area within your state of residence'
          render={() => (
            <Select
              name='LGADetails'
              value={formik.values.LGADetails}
              onValueChange={value => formik.setFieldValue('LGADetails', value)}
              disabled={!formik.values.stateOfResidence}>
              <SelectTrigger>
                <SelectValue placeholder='Select LGA' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {availableLGAs.map(lga => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='communityArea'
          label='Community Area'
          formik={formik}
          tooltip='Indicate whether you live in an urban, peri-urban, or rural area'
          render={() => (
            <div className='space-y-2'>
              <RadioGroup
                value={formik.values.communityArea}
                onValueChange={value =>
                  formik.setFieldValue('communityArea', value)
                }>
                <div className='grid grid-cols-2 gap-2'>
                  {community_areas.map(area => (
                    <div
                      key={area.value}
                      className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value={area.value}
                        id={`community-${area.value}`}
                      />
                      <Label htmlFor={`community-${area.value}`}>
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        />
      </div>
    </FormSection>
  );
};
