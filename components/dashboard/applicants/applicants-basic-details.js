import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  useMediaQuery,
  Box,
  Typography,
} from '@mui/material';
import {PropertyList} from '../../property-list';
import {PropertyListItem} from '../../property-list-item';

export const ApplicantBasicDetails = props => {
  if (!props.applicant?.profile) {
    return null;
  }

  const internshipProgramOptions = [
    {label: 'Theatre Group', value: 'theatreGroup'},
    {label: 'Short Film', value: 'shortFilm'},
    {
      label: 'Marketing Communication and Social Media',
      value: 'marketingCommunication',
    },
    {label: 'Creative Management Consultant', value: 'creativeManagement'},
    {label: 'Sponsorship Marketers', value: 'sponsorshipMarketers'},
    {label: 'Content Creation Skits', value: 'contentCreationSkits'},
  ];

  const projectTypeOptions = [
    {label: 'Group Internship Project', value: 'GroupInternship'},
    {
      label: 'Individual Internship Project (Entrepreneurs)',
      value: 'IndividualInternship',
    },
    {label: 'Corporate Internship', value: 'CorporateInternship'},
  ];

  // Business sectors options (example, replace with your actual options)
  const businessSectorOptions = [
    {label: 'Technology', value: 'TECHNOLOGY'},
    {label: 'Agriculture', value: 'AGRICULTURE'},
    {label: 'Entertainment', value: 'ENTERTAINMENT'},
    {label: 'Education', value: 'EDUCATION'},
    {label: 'Health', value: 'HEALTH'},
    {label: 'Finance', value: 'FINANCE'},
    {label: 'Retail', value: 'RETAIL'},
    {label: 'Manufacturing', value: 'MANUFACTURING'},
    {label: 'Other', value: 'OTHER'},
  ];

  function getLabelByValue(value, options) {
    if (!value) return '';
    const option = options.find(option => option.value === value);
    return option ? option.label : 'Unknown'; // Return "Unknown" if the value is not found in the options.
  }

  const {
    applicant: {
      email,
      type, // INDIVIDUAL, BUSINESS, etc.
      profile: {
        homeAddress,
        phoneNumber,
        gender,
        dob,
        LGADetails,
        stateOfResidence,
        educationLevel,
        referrer,
        taftaCenter,
        disability,
        source,
        communityArea,
        employmentStatus,
        employmentSector,
        residencyStatus,
        salaryRange,
        internshipProgram,
        projectType,
        // Business-related fields
        businessName,
        businessType,
        businessSize,
        businessSector,
        businessState,
        businessLGA,
        businessPartners,
        businessSupport,
        businessSupportNeeds,
        companyEmail,
        companyPhoneNumber,
        additionalPhoneNumber,
        revenueRange,
        registrationType,
        countryOfBusiness,
        // Job readiness
        jobReadiness,
      },
    },
    ...other
  } = props;

  // Format arrays for display
  const formatArray = arr => {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.join(', ');
  };

  // Format the salary range
  const formatRange = range => {
    if (!range) return '';
    // Convert underscores to readable format and add commas
    return range.replace('_', ' - ').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  const mdUp = useMediaQuery(theme => theme.breakpoints.up('md'));
  const align = mdUp ? 'horizontal' : 'vertical';

  // Determine if applicant is a business type
  const isBusinessType = type === 'BUSINESS' || businessType || businessName;

  return (
    <Card {...other}>
      <CardHeader title='Basic Details' />
      <Divider />
      <PropertyList>
        {/* Personal Information */}
        <PropertyListItem align={align} divider label='Email' value={email} />
        <PropertyListItem
          align={align}
          divider
          label='Phone'
          value={phoneNumber}
        />
        <PropertyListItem
          align={align}
          divider
          label='LGA Details'
          value={LGADetails || ''}
        />
        <PropertyListItem
          align={align}
          divider
          label='State of Residence'
          value={stateOfResidence}
        />
        <PropertyListItem
          align={align}
          divider
          label='Address'
          value={homeAddress}
        />
        <PropertyListItem align={align} divider label='Gender' value={gender} />
        <PropertyListItem
          align={align}
          divider
          label='Date Of Birth'
          value={dob ? new Date(dob).toLocaleDateString() : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label='Educational Level'
          value={educationLevel}
        />
        <PropertyListItem
          align={align}
          divider
          label='Tafta Center'
          value={taftaCenter || ''}
        />

        {/* Employment Information */}
        <PropertyListItem
          align={align}
          divider
          label='Employment Status'
          value={employmentStatus || ''}
        />
        {employmentStatus === 'employed' && (
          <PropertyListItem
            align={align}
            divider
            label='Employment Sector'
            value={employmentSector || ''}
          />
        )}
        {salaryRange && (
          <PropertyListItem
            align={align}
            divider
            label='Salary Range'
            value={formatRange(salaryRange)}
          />
        )}
        <PropertyListItem
          align={align}
          divider
          label='Residency Status'
          value={residencyStatus || ''}
        />
        <PropertyListItem
          align={align}
          divider
          label='Job Readiness'
          value={formatArray(jobReadiness)}
        />

        {/* Business Information Section */}
        {isBusinessType && (
          <>
            <Divider />
            <Box sx={{p: 2, bgcolor: 'background.default'}}>
              <Typography variant='h6'>Business Information</Typography>
            </Box>
            <Divider />

            <PropertyListItem
              align={align}
              divider
              label='Business Name'
              value={businessName || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Type'
              value={businessType || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Size'
              value={businessSize || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Sector'
              value={getLabelByValue(businessSector, businessSectorOptions)}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business State'
              value={businessState || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business LGA'
              value={businessLGA || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Partners'
              value={businessPartners || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Company Email'
              value={companyEmail || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Company Phone'
              value={companyPhoneNumber || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Additional Phone'
              value={additionalPhoneNumber || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Revenue Range'
              value={formatRange(revenueRange) || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Registration Type'
              value={formatArray(registrationType)}
            />
            <PropertyListItem
              align={align}
              divider
              label='Country of Business'
              value={countryOfBusiness || ''}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Support'
              value={formatArray(businessSupport)}
            />
            <PropertyListItem
              align={align}
              divider
              label='Business Support Needs'
              value={formatArray(businessSupportNeeds)}
            />
          </>
        )}

        {/* Internship Information */}
        {internshipProgram && (
          <PropertyListItem
            align={align}
            divider
            label='Internship Program'
            value={getLabelByValue(internshipProgram, internshipProgramOptions)}
          />
        )}

        {projectType && (
          <PropertyListItem
            align={align}
            divider
            label='Project Type'
            value={getLabelByValue(projectType, projectTypeOptions)}
          />
        )}

        {/* Referrer Information */}
        <Divider />
        <Box sx={{p: 2, bgcolor: 'background.default'}}>
          <Typography variant='h6'>Referrer Information</Typography>
        </Box>
        <Divider />

        <PropertyListItem
          align={align}
          divider
          label='Mobilizer'
          value={referrer?.fullName || ''}
        />

        {referrer && (
          <PropertyListItem
            align={align}
            divider
            label='Referrer Phone Number'
            value={referrer.phoneNumber || ''}
          />
        )}

        {/* Additional Information */}
        <PropertyListItem
          align={align}
          divider
          label='Disability'
          value={disability || ''}
        />
        <PropertyListItem
          align={align}
          divider
          label='Source'
          value={source || ''}
        />
        <PropertyListItem
          align={align}
          divider
          label='Community Area'
          value={communityArea || ''}
        />
      </PropertyList>
    </Card>
  );
};

ApplicantBasicDetails.propTypes = {
  applicant: PropTypes.object.isRequired,
};
