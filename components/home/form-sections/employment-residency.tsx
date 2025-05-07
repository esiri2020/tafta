'use client';

import type {FormikProps} from 'formik';

import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';

import type {FormValues} from '@/types/applicant';
import {
  employment_status,
  self_employed_types,
  residency_status,
  salary_ranges,
  business_sectors,
} from '@/data/form-options';
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
import {EntrepreneurBusinessInfo} from './entrepreneur-business-info';

interface EmploymentResidencyProps {
  formik: FormikProps<FormValues>;
  isEnterpriseType?: boolean;
}

export const EmploymentResidency = ({
  formik,
  isEnterpriseType,
}: EmploymentResidencyProps) => {
  const showEntrepreneurSection =
    formik.values.selfEmployedType === 'business_owner' ||
    formik.values.employmentStatus === 'entrepreneur';

  return (
    <>
      <FormSection title='Employment & Residency'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            id='employmentStatus'
            label='Employment Status'
            formik={formik}
            render={() => (
              <RadioGroup
                value={formik.values.employmentStatus}
                onValueChange={value =>
                  formik.setFieldValue('employmentStatus', value)
                }
                className='space-y-2'>
                {employment_status.map(status => (
                  <div
                    key={status.value}
                    className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value={status.value}
                      id={`employment-${status.value}`}
                    />
                    <Label htmlFor={`employment-${status.value}`}>
                      {status.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />

          {formik.values.employmentStatus === 'self-employed' && (
            <FormField
              id='selfEmployedType'
              label='Self-Employed Type'
              formik={formik}
              render={() => (
                <RadioGroup
                  value={formik.values.selfEmployedType}
                  onValueChange={value =>
                    formik.setFieldValue('selfEmployedType', value)
                  }
                  className='space-y-2'>
                  {self_employed_types.map(type => (
                    <div
                      key={type.value}
                      className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value={type.value}
                        id={`self-employed-${type.value}`}
                      />
                      <Label htmlFor={`self-employed-${type.value}`}>
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          )}

          {formik.values.employmentStatus === 'employed' && (
            <FormField
              id='salaryRange'
              label='Salary Range'
              formik={formik}
              render={() => (
                <Select
                  value={formik.values.salaryRange}
                  onValueChange={value =>
                    formik.setFieldValue('salaryRange', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a salary range' />
                  </SelectTrigger>
                  <SelectContent>
                    {salary_ranges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}

          {formik.values.employmentStatus === 'employed' && (
            <FormField
              id='employmentSector'
              label='Employment Sector'
              formik={formik}
              render={() => (
                <Select
                  value={formik.values.employmentSector}
                  onValueChange={value =>
                    formik.setFieldValue('employmentSector', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an employment sector' />
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
          )}

          <FormField
            id='residencyStatus'
            label='Residency Status'
            formik={formik}
            render={() => (
              <RadioGroup
                value={formik.values.residencyStatus}
                onValueChange={value =>
                  formik.setFieldValue('residencyStatus', value)
                }
                className='space-y-2'>
                {residency_status.map(status => (
                  <div
                    key={status.value}
                    className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value={status.value}
                      id={`residency-${status.value}`}
                    />
                    <Label htmlFor={`residency-${status.value}`}>
                      {status.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </div>
      </FormSection>

      {showEntrepreneurSection && <EntrepreneurBusinessInfo formik={formik} />}
    </>
  );
};
