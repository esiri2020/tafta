import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => null,
});

// Wrapper component to provide default props without using defaultProps
export const Chart = (props) => {
  const { type = 'line', ...other } = props;
  return <DynamicChart type={type} {...other} />;
};
