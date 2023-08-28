import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';
import { formatInTimeZone } from '../../../utils';

export const EnrollmentBasicDetails = (props) => {
  if(!props.enrollment){
    return;
  }
  const { enrollment, ...other } = props;
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
          label="Course Name"
          value={enrollment.course_name}
        />
        <PropertyListItem
          align={align}
          divider
          label="Date Created"
          value={enrollment.created_at ? formatInTimeZone(enrollment.created_at, 'dd MMM yyyy') : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label="Date Activated"
          value={enrollment.activated_at ? formatInTimeZone(enrollment.activated_at, 'dd MMM yyyy') : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label="Start Date"
          value={enrollment.started_at ? formatInTimeZone(enrollment.started_at, 'dd MMM yyyy') : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label="Date Completed"
          value={enrollment.completed_at ? formatInTimeZone(enrollment.completed_at, 'dd MMM yyyy') : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label="Expiry Date"
          value={enrollment.expiry_date ? formatInTimeZone(enrollment.expiry_date, 'dd MMM yyyy') : ''}
        />
        <PropertyListItem
          align={align}
          divider
          label="Percentage Completed"
          value={parseFloat(enrollment.percentage_completed).toLocaleString("en", { style: "percent", minimumFractionDigits: 2 })}
        />
        <PropertyListItem
          align={align}
          divider
          label="Enrollment Status"
          value={enrollment.expired ? 'Expired' : enrollment.enrolled ? 'Enrolled' : 'Not enrolled'}
        />
      </PropertyList>
    </Card>
  );
};

