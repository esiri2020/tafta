'use client';

import type {FormikProps} from 'formik';
import { useState, useEffect, useMemo } from 'react';

import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Input} from '@/components/ui/input';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';

import type {FormValues} from '@/types/applicant';
import {FormSection} from '@/components/form-section';
import {FormField} from '@/components/form-field';
import {ChevronDown, Check} from 'lucide-react';
import {cn} from '@/lib/utils';

interface ReferralInformationProps {
  formik: FormikProps<FormValues>;
}

export const ReferralInformation = ({formik}: ReferralInformationProps) => {
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all mobilizer codes (both available and unavailable)
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        console.log('🔍 Fetching mobilizer codes...');
        const response = await fetch(`/api/mobilizers/all-codes?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('🔍 Mobilizer codes response:', data);
        
        if (data.codes && Array.isArray(data.codes)) {
          setAvailableCodes(data.codes);
          console.log('🔍 Set available codes:', data.codes);
        } else {
          console.error('Invalid response format:', data);
          setAvailableCodes([]);
        }
      } catch (error) {
        console.error('Error fetching mobilizer codes:', error);
        setAvailableCodes([]);
      } finally {
        setLoadingCodes(false);
      }
    };

    fetchCodes();
  }, []);

  // Filter mobilizers based on search query
  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableCodes;
    }
    const query = searchQuery.toLowerCase();
    return availableCodes.filter(code => 
      code.toLowerCase().includes(query)
    );
  }, [availableCodes, searchQuery]);

  // Reset search query when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

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
                {/* <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='social_media' id='source-social' />
                  <Label htmlFor='source-social'>Social Media</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='website' id='source-website' />
                  <Label htmlFor='source-website'>Website</Label>
                </div> */}
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={loadingCodes}
                  >
                    {formik.values.referrer_fullName || (loadingCodes ? 'Loading mobilizers...' : 'Select mobilizer')}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search mobilizer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        // Prevent closing popover when typing
                        e.stopPropagation();
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {loadingCodes ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading mobilizers...
                      </div>
                    ) : filteredCodes.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {searchQuery ? 'No mobilizers found' : 'No available mobilizers'}
                      </div>
                    ) : (
                      filteredCodes.map((name) => (
                        <div
                          key={name}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            formik.values.referrer_fullName === name && "bg-accent"
                          )}
                          onClick={() => {
                            formik.setFieldValue('referrer_fullName', name);
                            setOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              formik.values.referrer_fullName === name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          />
        )}
      </div>
    </FormSection>
  );
};
