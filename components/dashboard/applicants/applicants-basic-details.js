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
        {referrer ? (
          <>
            <PropertyListItem
              align={align}
              divider
              label="Referrer"
              value={referrer.fullName}
            />
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
