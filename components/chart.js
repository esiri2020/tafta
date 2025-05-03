import dynamic from 'next/dynamic';
import ReactApexChart from 'react-apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => null,
});

Chart.defaultProps = {
  ...ReactApexChart.defaultProps,
  type: 'line',
};

export { Chart };
