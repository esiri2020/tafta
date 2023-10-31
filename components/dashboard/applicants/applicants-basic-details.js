import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";

export const ApplicantBasicDetails = (props) => {
  if (!props.applicant?.profile) {
    return;
  }

  const internshipProgramOptions = [
    { label: "Theatre Group", value: "theatreGroup" },
    { label: "Short Film", value: "shortFilm" },
    {
      label: "Marketing Communication and Social Media",
      value: "marketingCommunication",
    },
    { label: "Creative Management Consultant", value: "creativeManagement" },
    { label: "Sponsorship Marketers", value: "sponsorshipMarketers" },
    { label: "Content Creation Skits", value: "contentCreationSkits" },
  ];

  const projectTypeOptions = [
    { label: "Group Internship Project", value: "GroupInternship" },
    {
      label: "Individual Internship Project (Entrepreneurs)",
      value: "IndividualInternship",
    },
    { label: "Corporate Internship", value: "CorporateInternship" },
  ];

  function getLabelByValue(value, options) {
    const option = options.find((option) => option.value === value);
    return option ? option.label : "Unknown"; // Return "Unknown" if the value is not found in the options.
  }

  const {
    applicant: {
      email,
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
        residencyStatus,
        internshipProgram,
        projectType,
      },
    },
    ...other
  } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const align = mdUp ? "horizontal" : "vertical";

  return (
    <Card {...other}>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem align={align} divider label="Email" value={email} />
        <PropertyListItem
          align={align}
          divider
          label="Phone"
          value={phoneNumber}
        />
        <PropertyListItem
          align={align}
          divider
          label="LGA Details"
          value={LGADetails}
        />
        <PropertyListItem
          align={align}
          divider
          label="State of Residence"
          value={stateOfResidence}
        />
        <PropertyListItem
          align={align}
          divider
          label="Address"
          value={homeAddress}
        />
        <PropertyListItem align={align} divider label="Gender" value={gender} />
        <PropertyListItem
          align={align}
          divider
          label="Date Of Birth"
          value={dob}
        />
        <PropertyListItem
          align={align}
          divider
          label="Educational Level"
          value={educationLevel}
        />
        <PropertyListItem
          align={align}
          divider
          label="Tafta Center"
          value={taftaCenter}
        />
        <PropertyListItem
          align={align}
          divider
          label="Employment Status"
          value={employmentStatus}
        />
        <PropertyListItem
          align={align}
          divider
          label="Residency Status"
          value={residencyStatus}
        />
        <PropertyListItem
          align={align}
          divider
          label="Internship Program"
          value={getLabelByValue(internshipProgram, internshipProgramOptions)}
        />
        <PropertyListItem
          align={align}
          divider
          label="Project Type"
          value={getLabelByValue(projectType, projectTypeOptions)}
        />

        <PropertyListItem
          align={align}
          divider
          label="Mobilizer"
          value={referrer.fullName}
        />

        {referrer ? (
          <>
            <PropertyListItem
              align={align}
              divider
              label="Referrer Phone Number"
              value={referrer.phoneNumber}
            />
          </>
        ) : (
          <PropertyListItem align={align} divider label="Referrer" value={""} />
        )}
        <PropertyListItem
          align={align}
          divider
          label="Disability"
          value={disability}
        />
        <PropertyListItem align={align} divider label="Source" value={source} />
        <PropertyListItem
          align={align}
          divider
          label="Community Area"
          value={communityArea}
        />
      </PropertyList>
    </Card>
  );
};
