import { Doughnut } from 'react-chartjs-2';
import { Box, Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneIcon from '@mui/icons-material/Phone';
import TabletIcon from '@mui/icons-material/Tablet';

export const EnrollmentStatus = (props) => {
  const theme = useTheme();
  const {data: _data} = props
  const data = {
    datasets: [
      {
        data: _data,
        backgroundColor: ['#e53935', '#FB8C00', '#3F51B5'],
        borderWidth: 8,
        borderColor: '#FFFFFF',
        hoverBorderColor: '#FFFFFF'
      }
    ],
    labels: ['Inactive', 'Active', 'Certified']
  };

  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  const devices = [
    {
      title: 'Inactive',
      value: parseInt((_data[0]/_data.reduce((a,b) => a+b))*100),
      // icon: TabletIcon,
      color: '#E53935'
    },
    {
      title: 'Active',
      value: parseInt((_data[1]/_data.reduce((a,b) => a+b))*100),
      // icon: PhoneIcon,
      color: '#FB8C00'
    },
    {
      title: 'Certified',
      value: parseInt((_data[2]/_data.reduce((a,b) => a+b))*100),
      // icon: LaptopMacIcon,
      color: '#3F51B5'
    },
  ];

  return (
    <Card {...props}>
      <CardHeader title="Enrollment Status" />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 300,
            position: 'relative'
          }}
        >
          <Doughnut
            data={data}
            options={options}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 2
          }}
        >
          {devices.map(({
            color,
            // icon: Icon,
            title,
            value
          }) => (
            <Box
              key={title}
              sx={{
                p: 1,
                textAlign: 'center'
              }}
            >
              {/* <Icon color="action" /> */}
              <Typography
                color="textPrimary"
                variant="body1"
              >
                {title}
              </Typography>
              <Typography
                style={{ color }}
                variant="h4"
              >
                {value}
                %
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
