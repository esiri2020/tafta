import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import { Chart } from "../chart";

export const AgeGroupGraph = (props) => {
  const theme = useTheme();
  const { data: _data } = props;

  if (!_data) return null;

  const data = {
    datasets: [
      {
        backgroundColor: "#3F51B5",
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: _data?.map((x) => x.count),
        label: "Completed",
        maxBarThickness: 10,
      },
    ],
    labels: _data?.map((x) => x.ageRange),
  };

  const option = {
    series: [
      {
        name: "Course Completions",
        data: _data?.map((x) => x.count),
      },
    ],
    chart: {
      id: "area-datetime",
      type: "area",
      height: 400,
      zoom: {
        autoScaleYaxis: true,
      },
    },

    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      style: "hollow",
    },
    xaxis: {
      type: "category", // Use "category" instead of "datetime" for age range
      categories: _data.map((x) => x.ageRange), // Use ageRange for x-axis categories
    },
    yaxis: {
      title: {
        text: "Count", // Add y-axis title
      },
    },
    tooltip: {
      x: {
        formatter: function (value) {
          return `Age Range: ${value}`; // Format the tooltip to display age range
        },
      },
      y: {
        formatter: function (value) {
          return `Count: ${value}`; // Format the tooltip to display count
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
  };

  return (
    <Card {...props}>
      <CardHeader title="Age Range Of All Student" />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: "relative",
          }}
        >
          <Chart
            options={option}
            series={data.datasets} // Use the datasets from 'data' object
            height={"100%"}
          />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2,
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
