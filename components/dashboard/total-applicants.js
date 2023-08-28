import { Avatar, Card, CardContent, Grid, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';


export const TotalApplicants = (props) => (
  <Card {...props}>
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
            TOTAL
          </Typography>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
          >
           APPLICANTS
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
              backgroundColor: 'success.main',
              height: 56,
              width: 56
            }}
          >
            <PeopleIcon />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
