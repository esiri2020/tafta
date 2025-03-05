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
              Welcome To Terra Academy's Application Portal
            </Typography>
            <Typography
              align="center"
              variant="h6"
            >
              Your Journey to Creative Excellence Starts Here
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
            
        }}>
          <Grid
            item
            md={12}
            sm={8}
            xs={12}
            sx={{
              // order: {
              //   xs: 1,
              //   md: 2
              // }
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
          <Box>
            <Typography
              align="center"
              variant="h3"
            >
              Registration Guide
            </Typography>
            </Box>
          <Grid 
            item
            md={12}
            sm={8}
            xs={12}
            maxWidth='lg'
            sx={{
              justifyContent: 'center',
              display: 'flex',
          }}         
            >


            <Grid item xs={12} md={3}             
            sx={{
              px: 2,
            }}>
                          {/* <Typography
              align="left"
              variant="h5"
              color="primary"
              backgroundColor="#000"
              padding="10px"
            >
              Welcome, Your Journey Starts Here!
            </Typography> */}
              <Box
                sx={{
                  backgroundColor: '#f4f4f4',
                  p: 3,
                  height: '100%',
                }}
              >
                <Typography variant="h6">STEP 1</Typography>
                <Typography variant="subtitle1">Registration</Typography>
                <Typography color="textSecondary">
                  Registration is super easy, kindly follow the following steps.
                  {'\n'}
                  Make sure you meet our eligibility requirements, else you will get an error.
                </Typography>
                <br/>
                <Typography color="textSecondary" variant="paragraph" sx={{ py: 3 }}>
                  Available on this portal are Free programs that you can apply for depending on your Creative and Business need or referral by a Creative Development Service Provider.
                  {'\n'}
                 Above this Guide are a list of Available Cohorts, click on any to get more information and possibly apply.
                  {'\n'}{'\n'}
                </Typography>
              </Box>
            </Grid>

            {/* Box 2 */}
            <Grid item xs={12} md={5}             
            sx={{
              px: 2,
            }}>
              <Box
                sx={{
                  backgroundColor: '#f4f4f4',
                  p: 3,
                  height: '100%',
                }}
              >
                <Typography variant="h6">STEP 2</Typography>
                <Typography variant="subtitle1">Application</Typography>
                <Typography color="textSecondary">
                  The application takes about 1-2 minutes.
                  <br />
                  <strong>How to register:</strong>
                  <ol>
                    <li>Register by selecting a cohort from the list above</li>
                    <li>Put in your account credentials and submit the application to register</li>
                    <li>User Already Exists? Check important Notice</li>
                    <li>Check your email to verify your email. Users must verify their emails.</li>
                    <li>After verifying your email, continue with filling in your personal information and click continue.</li>
                    <li>After filling your personal information, select your course.</li>
                    <li>Registration is finished.</li>
                    <li>Login to the LMS - You are granted immediate access to start learning.</li>
                  </ol>
                </Typography>
              </Box>
            </Grid>

            {/* Box 3 */}
            <Grid item xs={12} md={4}             
            sx={{
              px: 2,
            }}>
              <Box
                sx={{
                  backgroundColor: '#f4f4f4',
                  p: 3,
                  height: '100%',
                }}
              >
                <Typography variant="h6">IMPORTANT TO NOTE</Typography>
                <Typography color="textSecondary">
                  User Already Exists? No Problem!! <br /><br />If you've registered for previous cohorts, you can access your registration dashboard by resetting your password{' '} 
                  <a href="https://reg.terraacademyforarts.com/forgot-password">here</a>.
                  <br /> <br />
                  If you have already registered for a previous cohort, you will not be allowed to register with the same email for subsequent cohorts, including this one.
                  <br />
                  <br />
                  <Typography variant="h6">Key Activities to Watch Out For</Typography>
                  <ol>
                    <li><strong>Cohort 5 starts:</strong> 01 November 2023</li>
                    <li><strong>TAFTA Learning Train is coming to your community.</strong></li>
                    <li><strong>Theory and Practical Physical Classes:</strong> Sound Design and Stage Lighting Only</li>
                    <li><strong>TALP Project </strong>- TAFTA Action Learning Project</li>
                </ol>

                </Typography>
              </Box>
            </Grid>
          </Grid>
      
        </Grid>  
      </Container>  
  	</Box>


  );
};
