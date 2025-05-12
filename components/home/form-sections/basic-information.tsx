'use client';

import type {FormikProps} from 'formik';

import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {FormValues} from '@/types/applicant';
import {genderList, ranges} from '@/data/form-options';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';
import {DatePicker} from '@/components/home/ui-extensions/date-picker';

interface BasicInformationProps {
  formik: FormikProps<FormValues>;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export const BasicInformation = ({
  formik,
  date,
  setDate,
}: BasicInformationProps) => {
  return (
    <FormSection title='Basic Information'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          id='firstName'
          label='First Name'
          formik={formik}
          tooltip='Enter your legal first name as it appears on your official documents'
          render={() => (
            <Input
              id='firstName'
              name='firstName'
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter your first name'
            />
          )}
        />

        <FormField
          id='lastName'
          label='Last Name'
          formik={formik}
          tooltip='Enter your legal last name as it appears on your official documents'
          render={() => (
            <Input
              id='lastName'
              name='lastName'
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter your last name'
            />
          )}
        />

        <FormField
          id='email'
          label='Email Address'
          formik={formik}
          tooltip='This email will be used for all communications and cannot be changed'
          render={() => (
            <Input
              id='email'
              name='email'
              type='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled
              placeholder='Enter your email address'
            />
          )}
        />

        <FormField
          id='phoneNumber'
          label='Phone Number'
          formik={formik}
          tooltip='Enter a valid phone number that can be used to contact you'
          render={() => (
            <Input
              id='phoneNumber'
              name='phoneNumber'
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter your phone number'
            />
          )}
        />

        <FormField
          id='gender'
          label='Gender'
          formik={formik}
          tooltip='Select the gender you identify with'
          render={() => (
            <Select
              name='gender'
              value={formik.values.gender}
              onValueChange={value => formik.setFieldValue('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select gender' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {genderList.map(gender => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          id='dob'
          label='Date of Birth'
          formik={formik}
          tooltip='Select your date of birth. You must be at least 15 years old.'
          render={() => (
            <div className='space-y-2'>
              <DatePicker
                date={date}
                onDateChange={newDate => {
                  setDate(newDate);
                  formik.setFieldValue(
                    'dob',
                    newDate ? newDate.toISOString() : '',
                  );

                  // Auto-select age range based on DOB
                  if (newDate) {
                    const today = new Date();
                    const age = today.getFullYear() - newDate.getFullYear();
                    const m = today.getMonth() - newDate.getMonth();
                    const actualAge =
                      m < 0 || (m === 0 && today.getDate() < newDate.getDate())
                        ? age - 1
                        : age;

                    // Find the appropriate age range
                    for (const range of ranges) {
                      if (actualAge >= range[0] && actualAge <= range[1]) {
                        formik.setFieldValue(
                          'ageRange',
                          `${range[0]} - ${range[1]}`,
                        );
                        break;
                      }
                    }
                  }
                }}
                label='Date of Birth'
                placeholder='Select your date of birth'
                minYear={1940}
                maxYear={new Date().getFullYear() - 15}
              />
              {formik.touched.dob && formik.errors.dob && (
                <p className='text-sm text-red-500'>
                  {formik.errors.dob as string}
                </p>
              )}
            </div>
          )}
        />

        <FormField
          id='ageRange'
          label='Age Range'
          formik={formik}
          tooltip='Select the age range that includes your current age'
          render={() => (
            <Select
              name='ageRange'
              value={formik.values.ageRange}
              onValueChange={value => formik.setFieldValue('ageRange', value)}
              disabled={true}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select age range' />
              </SelectTrigger>
              <SelectContent className='max-h-[200px] overflow-y-auto'>
                {ranges.map((range, index) => (
                  <SelectItem key={index} value={`${range[0]} - ${range[1]}`}>
                    {`${range[0]} - ${range[1]}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </FormSection>
  );
};
