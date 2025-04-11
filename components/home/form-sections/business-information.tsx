'use client';

import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';

import type {FormValues} from '@/types/applicant';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select';
import {
  business_sectors,
  business_size,
  business_types,
  revenue_ranges,
} from '@/data/form-options';

interface BusinessInformationProps {
  formik: FormikProps<FormValues>;
}

export const BusinessInformation = ({formik}: BusinessInformationProps) => {
  return (
    <FormSection title='Business Information'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='businessSupport'
          label='Business Support'
          formik={formik}
          tooltip='Select all business support services you have already received'
          render={() => (
            <div className='grid grid-cols-1 gap-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='business-registered'
                  checked={formik.values.businessSupport.includes(
                    'business_registered',
                  )}
                  onCheckedChange={checked => {
                    const newValues = checked
                      ? [
                          ...formik.values.businessSupport,
                          'business_registered',
                        ]
                      : formik.values.businessSupport.filter(
                          v => v !== 'business_registered',
                        );
                    formik.setFieldValue('businessSupport', newValues);
                  }}
                />
                <Label htmlFor='business-registered' className='cursor-pointer'>
                  Business Registered
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='clinic-attended'
                  checked={formik.values.businessSupport.includes(
                    'clinic_attended',
                  )}
                  onCheckedChange={checked => {
                    const newValues = checked
                      ? [...formik.values.businessSupport, 'clinic_attended']
                      : formik.values.businessSupport.filter(
                          v => v !== 'clinic_attended',
                        );
                    formik.setFieldValue('businessSupport', newValues);
                  }}
                />
                <Label htmlFor='clinic-attended' className='cursor-pointer'>
                  Business Clinic Attended
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='business-coaching'
                  checked={formik.values.businessSupport.includes(
                    'coaching_attended',
                  )}
                  onCheckedChange={checked => {
                    const newValues = checked
                      ? [...formik.values.businessSupport, 'coaching_attended']
                      : formik.values.businessSupport.filter(
                          v => v !== 'coaching_attended',
                        );
                    formik.setFieldValue('businessSupport', newValues);
                  }}
                />
                <Label htmlFor='business-coaching' className='cursor-pointer'>
                  Business Coaching Attended
                </Label>
              </div>
            </div>
          )}
        />

        <FormField
          id='businessSupportNeeds'
          label='Business Support Needs'
          formik={formik}
          tooltip='Select the business support services you need'
          render={() => (
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='need-registration'
                checked={formik.values.businessSupportNeeds.includes(
                  'business_registered',
                )}
                onCheckedChange={checked => {
                  const newValues = checked
                    ? [
                        ...formik.values.businessSupportNeeds,
                        'business_registered',
                      ]
                    : formik.values.businessSupportNeeds.filter(
                        v => v !== 'business_registered',
                      );
                  formik.setFieldValue('businessSupportNeeds', newValues);
                }}
              />
              <Label htmlFor='need-registration' className='cursor-pointer'>
                Business Registration
              </Label>
            </div>
          )}
        />

        <FormField
          id='businessType'
          label='Business Type'
          formik={formik}
          tooltip='Select the category that best describes your business'
          render={() => (
            <Select
              value={formik.values.businessType}
              onValueChange={value =>
                formik.setFieldValue('businessType', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select business type' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {business_types.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='businessSector'
          label='Business Sector'
          formik={formik}
          tooltip='Select the industry sector your business operates in'
          render={() => (
            <Select
              value={formik.values.businessSector}
              onValueChange={value =>
                formik.setFieldValue('businessSector', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select a business sector' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {business_sectors.map(sector => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='businessSize'
          label='Business Size'
          formik={formik}
          tooltip='Indicate the size of your business based on number of employees'
          render={() => (
            <Select
              value={formik.values.businessSize}
              onValueChange={value =>
                formik.setFieldValue('businessSize', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select a business size' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {business_size.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='revenueRange'
          label='Revenue Range'
          formik={formik}
          tooltip='Select your business revenue range'
          render={() => (
            <Select
              value={formik.values.revenueRange}
              onValueChange={value =>
                formik.setFieldValue('revenueRange', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select a revenue range' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {revenue_ranges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='businessPartners'
          label='Business Partners'
          formik={formik}
          tooltip='List the names of your business partners, if any'
          render={() => (
            <Input
              id='businessPartners'
              name='businessPartners'
              value={formik.values.businessPartners}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          )}
        />

        <FormField
          id='companyPhoneNumber'
          label='Company Phone Number'
          formik={formik}
          tooltip='Enter the official phone number for your business'
          render={() => (
            <Input
              id='companyPhoneNumber'
              name='companyPhoneNumber'
              value={formik.values.companyPhoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          )}
        />

        <FormField
          id='additionalPhoneNumber'
          label='Additional Phone Number'
          formik={formik}
          tooltip='Provide an alternative phone number for your business'
          render={() => (
            <Input
              id='additionalPhoneNumber'
              name='additionalPhoneNumber'
              value={formik.values.additionalPhoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          )}
        />

        <FormField
          id='companyEmail'
          label='Company Email'
          formik={formik}
          tooltip='Enter the official email address for your business'
          render={() => (
            <Input
              id='companyEmail'
              name='companyEmail'
              type='email'
              value={formik.values.companyEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          )}
        />
      </div>
    </FormSection>
  );
};
