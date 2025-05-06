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
  registration_types,
} from '@/data/form-options';

interface EntrepreneurInformationProps {
  formik: FormikProps<FormValues>;
}

export const EntrepreneurInformation = ({
  formik,
}: EntrepreneurInformationProps) => {
  return (
    <FormSection title='Business Information'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='businessName'
          label='Entrepreneur Business Name'
          formik={formik}
          tooltip='Enter the registered name of your business'
          required
          render={() => (
            <Input
              id='businessName'
              name='businessName'
              value={formik.values.businessName || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter your business name'
            />
          )}
        />

        <FormField
          id='businessType'
          label='Entrepreneur Business Type'
          formik={formik}
          tooltip='Select the category that best describes your business'
          required
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
          id='businessSize'
          label='Entrepreneur Business Size'
          formik={formik}
          tooltip='Indicate the size of your business based on number of employees'
          required
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
          id='businessSector'
          label='Entrepreneur Business Sector'
          formik={formik}
          tooltip='Select the industry sector your business operates in'
          required
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
              placeholder='Enter company phone number'
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
              placeholder='Enter additional phone number'
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
              placeholder='Enter company email'
            />
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
              placeholder='Enter business partners'
            />
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
          id='registrationType'
          label='Registration Type'
          formik={formik}
          tooltip='Select the type of business registration'
          render={() => (
            <div className='grid grid-cols-2 gap-2'>
              {registration_types.map(type => (
                <div key={type.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`registration-${type.value}`}
                    checked={formik.values.registrationType === type.value}
                    onCheckedChange={() => {
                      formik.setFieldValue('registrationType', type.value);
                    }}
                  />
                  <Label
                    htmlFor={`registration-${type.value}`}
                    className='cursor-pointer'>
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        />
      </div>
    </FormSection>
  );
};
