import NextLink from 'next/link';
import { Box, Button, Grid, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useGetCohortsQuery } from '../../services/api'
import { SplashScreen } from '../splash-screen';

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


export const HomeHero = (props) => {
  const theme = useTheme();
  const { data, error, isLoading } = useGetCohortsQuery({page: 0, limit: 100, filter: 'true'})
  if(isLoading) return ( <SplashScreen/> )
  if(!data) return (<div>No Data!</div>);
  const fontColor = (color) => {
    if (!color || color.length !== 7 ) return undefined
    const {r,g,b} = hexToRgb(color)
    if ((r*0.299 + g*0.587 + b*0.114) > 186) return '#000000'; else return '#ffffff'
  }
  const { cohorts, count } = data
  return (
    <Box>
      <img
        alt="header image"
        ahref="/"
        style={{width:"100%", height:"100%"}}
        src="/static/images/header-img.png"
      />

      <Box>
        <Container
            maxWidth="md"
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              my: 4
            }}
          >
            <Typography
              align="center"
              variant="h3"
            >
              Welcome to the TAFTA Application Portal
            </Typography>
        </Container>
      </Box>

      
      <Container> 
        <Grid
          alignItems="top"
          container
          justifyContent="center"
          spacing={3}
          maxWidth='lg'
          sx={{
            justifyContent: 'center',
            display: 'flex',
            my: 5
        }}>
          <Grid 
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
            }}           
            >
            <Typography
              align="center"
              variant="h5"
              color="primary"
              backgroundColor="#000"
              padding="10px"
            >
              Welcome to the TAFTA Application Portal
            </Typography>
            <Box
              sx={{
                backgroundColor:'#f4f4f4',
                py: 3,
                px: 3,
              }}
            >
              <Typography
                color="textSecondary"
                variant= "paragraph"
                sx={{ 
                  py: 3 }}
                >
                Available on this portal are Free programs that you can apply for depending on your Creative and Business need or referal by a Creative Development Service Provider.
                {'\n'}
                To the right are a list of programs, click on any to get more information and possibly apply.
                {'\n'}{'\n'}
                NOTE: To apply, you will be required to create a FREE TAFTA account.{'\n'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              order: {
                xs: 1,
                md: 2
              }
            }}
          >
            <Typography
              color="#000"
              variant="h5"
              >
              All Cohorts:
              </Typography>
              {cohorts.map((cohort) => (
              <Box
                key={cohort.id}
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  my: 2
                }}
              >
                <NextLink
                href={{pathname: '/register', query: {cohortId: cohort.id}}}
                passHref
              >
                <Button
                component = 'a'
                size="large"
                variant="contained"
                sx ={{
                  backgroundColor: cohort.color,
                  width: '100%',
                  color: fontColor(cohort.color),
                  '&:hover': {
                    backgroundColor: '#000',
                    color: '#fff'}
                }}
              >
                <span style= {{display: 'flex', flexGrow: 1}}>{cohort.name}</span> <span> Register </span>
              </Button>

              </NextLink>
              </Box>
              ))}
          </Grid>


        </Grid>  
      </Container>  
  	</Box>


  );
};
