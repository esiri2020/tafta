'use client';

import type {FormikProps} from 'formik';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import type {FormValues} from '@/types/applicant';
import {business_sectors, revenue_ranges} from '@/data/form-options';

const businessTypes = [
  {label: 'Informal', value: 'INFORMAL'},
  {label: 'Startup', value: 'STARTUP'},
  {label: 'Formal (Existing)', value: 'FORMAL_EXISTING'},
];

const businessSizes = [
  {label: 'Micro', value: 'MICRO'},
  {label: 'Small', value: 'SMALL'},
  {label: 'Medium', value: 'MEDIUM'},
  {label: 'Large', value: 'LARGE'},
];

const registrationTypes = [
  {label: 'CAC', value: 'CAC'},
  {label: 'SMEDAN', value: 'SMEDAN'},
];

interface EntrepreneurBusinessInfoProps {
  formik: FormikProps<FormValues>;
}

export const EntrepreneurBusinessInfo = ({
  formik,
}: EntrepreneurBusinessInfoProps) => {
  return (
    <FormSection title='Business Information'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='entrepreneurBusinessName'
          label='Business Name'
          formik={formik}
          required
          render={() => (
            <Input
              value={formik.values.entrepreneurBusinessName}
              onChange={e =>
                formik.setFieldValue('entrepreneurBusinessName', e.target.value)
              }
              placeholder='Enter your business name'
            />
          )}
        />

        <FormField
          id='entrepreneurBusinessType'
          label='Business Type'
          formik={formik}
          required
          render={() => (
            <Select
              value={formik.values.entrepreneurBusinessType}
              onValueChange={value =>
                formik.setFieldValue('entrepreneurBusinessType', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select business type' />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='entrepreneurBusinessSize'
          label='Business Size'
          formik={formik}
          required
          render={() => (
            <Select
              value={formik.values.entrepreneurBusinessSize}
              onValueChange={value =>
                formik.setFieldValue('entrepreneurBusinessSize', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select business size' />
              </SelectTrigger>
              <SelectContent>
                {businessSizes.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='entrepreneurBusinessSector'
          label='Business Sector'
          formik={formik}
          required
          render={() => (
            <Select
              value={formik.values.entrepreneurBusinessSector}
              onValueChange={value =>
                formik.setFieldValue('entrepreneurBusinessSector', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select business sector' />
              </SelectTrigger>
              <SelectContent>
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
          id='entrepreneurCompanyPhoneNumber'
          label='Company Phone Number'
          formik={formik}
          render={() => (
            <Input
              value={formik.values.entrepreneurCompanyPhoneNumber}
              onChange={e =>
                formik.setFieldValue(
                  'entrepreneurCompanyPhoneNumber',
                  e.target.value,
                )
              }
              placeholder='Enter company phone number'
            />
          )}
        />

        <FormField
          id='entrepreneurAdditionalPhoneNumber'
          label='Additional Phone Number'
          formik={formik}
          render={() => (
            <Input
              value={formik.values.entrepreneurAdditionalPhoneNumber}
              onChange={e =>
                formik.setFieldValue(
                  'entrepreneurAdditionalPhoneNumber',
                  e.target.value,
                )
              }
              placeholder='Enter additional phone number'
            />
          )}
        />

        <FormField
          id='entrepreneurCompanyEmail'
          label='Company Email'
          formik={formik}
          render={() => (
            <Input
              value={formik.values.entrepreneurCompanyEmail}
              onChange={e =>
                formik.setFieldValue('entrepreneurCompanyEmail', e.target.value)
              }
              placeholder='Enter company email'
              type='email'
            />
          )}
        />

        <FormField
          id='entrepreneurBusinessPartners'
          label='Business Partners'
          formik={formik}
          render={() => (
            <Input
              value={formik.values.entrepreneurBusinessPartners}
              onChange={e =>
                formik.setFieldValue(
                  'entrepreneurBusinessPartners',
                  e.target.value,
                )
              }
              placeholder='Enter business partners'
            />
          )}
        />

        <FormField
          id='entrepreneurRevenueRange'
          label='Revenue Range'
          formik={formik}
          required
          render={() => (
            <Select
              value={formik.values.entrepreneurRevenueRange}
              onValueChange={value =>
                formik.setFieldValue('entrepreneurRevenueRange', value)
              }>
              <SelectTrigger>
                <SelectValue placeholder='Select revenue range' />
              </SelectTrigger>
              <SelectContent>
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
          id='entrepreneurRegistrationType'
          label='Registration Type'
          formik={formik}
          required
          render={() => (
            <div className='space-y-2'>
              {registrationTypes.map(type => (
                <div key={type.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`registration-${type.value}`}
                    checked={formik.values.entrepreneurBusinessType?.includes(
                      type.value,
                    )}
                    onCheckedChange={checked => {
                      const currentTypes =
                        formik.values.entrepreneurBusinessType || [];
                      const newTypes = checked
                        ? [...(currentTypes as string[]), type.value]
                        : (currentTypes as string[]).filter(
                            (t: string) => t !== type.value,
                          );
                      formik.setFieldValue(
                        'entrepreneurRegistrationType',
                        newTypes,
                      );
                    }}
                  />
                  <Label htmlFor={`registration-${type.value}`}>
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
