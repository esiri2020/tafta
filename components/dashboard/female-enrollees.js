import { Avatar, Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';
import FemaleRoundedIcon from '@mui/icons-material/FemaleRounded';

export const FemaleEnrollees = (props) => (
  <Card
    sx={{ height: '100%' }}
    {...props}
  >
    <CardContent>
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: 'space-between' }}
      >
        <Grid item>
          <Typography
            color="textSecondary"
            gutterBottom
            display="block"
            sx={{ 
              padding: "0",
              margin: "0",
              lineHeight: "0"
            }}
            variant="overline"
          >
            FEMALE 
          </Typography>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
          >
             ENROLLEES
          </Typography>
          <Typography
            color="textPrimary"
            variant="h4"
          >
            {props.count}
          </Typography>
        </Grid>
        <Grid item>
        <Avatar
            sx={{
              backgroundColor: 'error.light',
              height: 56,
              width: 56
            }}
          >
            <FemaleRoundedIcon />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
