import { Card, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';

export const UserBasicDetails = (props) => {
  if(!props.user?.profile){
    return;
  }
  const { user: {
    email,
    role, 
    profile: {
      homeAddress, phoneNumber, gender, dob, LGADetails, stateOfResidence
    }
  }, ...other } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...other}>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={email}
        />
        <PropertyListItem
          align={align}
          divider
          label="Role"
          value={role}
        />
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
        <PropertyListItem
          align={align}
          divider
          label="Gender"
          value={gender}
        />
      </PropertyList>
    </Card>
  );
};
