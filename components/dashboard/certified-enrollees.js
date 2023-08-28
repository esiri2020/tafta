import { Avatar, Card, CardContent, Grid, Typography } from '@mui/material';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

export const CertifiedEnrollees = (props) => (
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
            CERTIFIED 
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
              backgroundColor: 'primary.main',
              height: 56,
              width: 56
            }}
          >
            <VerifiedUserRoundedIcon />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
