import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { Chart } from '../chart'

// action={(
//   <Button
//     endIcon={<ArrowDropDownIcon fontSize="small" />}
//     size="small"
//   >
//     Last 7 days
//   </Button>
// )}

export const EnrollmentsCompletedGraph = (props) => {
  const theme = useTheme();
  const {data: _data} = props

  if (!_data || _data.length === 0) return null

  const data = {
    datasets: [
      {
        backgroundColor: '#3F51B5',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: _data?.map(x => x.count),
        label: 'Completed',
        maxBarThickness: 10
      },
    ],
    labels: _data?.map(x => x.date)
  };

  const option = {
    series: [{
      label: 'Course Completions',
      data: _data?.map(x => [Date.parse(x.date), x.count])
    }],
    chart: {
      id: 'area-datetime',
      type: 'area',
      height: 400,
      zoom: {
        autoScaleYaxis: true
      }
    },
    // annotations: {
    //   yaxis: [{
    //     y: 30,
    //     borderColor: '#999',
    //     label: {
    //       show: true,
    //       text: 'Support',
    //       style: {
    //         color: "#fff",
    //         background: '#00E396'
    //       }
    //     }
    //   }],
    //   xaxis: [{
    //     x: new Date('14 Nov 2012').getTime(),
    //     borderColor: '#999',
    //     yAxisIndex: 0,
    //     label: {
    //       show: true,
    //       text: 'Rally',
    //       style: {
    //         color: "#fff",
    //         background: '#775DD0'
    //       }
    //     }
    //   }]
    // },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      style: 'hollow',
    },
    xaxis: {
      type: 'datetime',
      min: _data.length > 0 ? Date.parse(_data[0].date) : new Date().getTime(),
      tickAmount: 6,
      categories: _data.map(x=>x.date)
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
  }

  // const options = {
  //   animation: false,
  //   cornerRadius: 20,
  //   layout: { padding: 0 },
  //   legend: { display: false },
  //   maintainAspectRatio: false,
  //   responsive: true,
  //   xAxes: [
  //     {
  //       ticks: {
  //         fontColor: theme.palette.text.secondary
  //       },
  //       gridLines: {
  //         display: false,
  //         drawBorder: false
  //       }
  //     }
  //   ],
  //   yAxes: [
  //     {
  //       ticks: {
  //         fontColor: theme.palette.text.secondary,
  //         beginAtZero: true,
  //         min: 0
  //       },
  //       gridLines: {
  //         borderDash: [2],
  //         borderDashOffset: [2],
  //         color: theme.palette.divider,
  //         drawBorder: false,
  //         zeroLineBorderDash: [2],
  //         zeroLineBorderDashOffset: [2],
  //         zeroLineColor: theme.palette.divider
  //       }
  //     }
  //   ],
  //   tooltips: {
  //     backgroundColor: theme.palette.background.paper,
  //     bodyFontColor: theme.palette.text.secondary,
  //     borderColor: theme.palette.divider,
  //     borderWidth: 1,
  //     enabled: true,
  //     footerFontColor: theme.palette.text.secondary,
  //     intersect: false,
  //     mode: 'index',
  //     titleFontColor: theme.palette.text.primary
  //   }
  // };

  return (
    <Card {...props}>
      <CardHeader
        title="Enrollment Completions Over Time"
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: 'relative'
          }}
        >
          <Chart
            options={option}
            series={[{ type: 'area',data: _data?.map(x => x.count), name: 'Certifications' }]}
            height={'100%'}
          />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon fontSize="small" />}
          size="small"
        >
          Overview
        </Button>
      </Box>
    </Card>
  );
};
