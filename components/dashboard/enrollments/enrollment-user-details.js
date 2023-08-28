import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';

export const EnrollmentUserDetails = (props) => {
  if(!props.enrollment){
    return;
  }
  const { enrollment, ...other } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...other}>
      <CardHeader title="Applicant Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Applicant Name"
          value={`${enrollment.userCohort.user.firstName} ${enrollment.userCohort.user.lastName}`}
        />
        <PropertyListItem
          align={align}
          divider
          label="Applicant Email"
          value={enrollment.userCohort.user.email}
        />
        <PropertyListItem
          align={align}
          divider
          label="Gender"
          value={enrollment.userCohort.user.profile.gender}
        />
      </PropertyList>
    </Card>
  );
};

