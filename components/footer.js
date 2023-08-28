import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MinusOutlined as MinusOutlinedIcon } from '../icons/minus-outlined';
import { Logo } from './logo';



export const Footer = (props) => (
  <Box
    sx={{
      backgroundColor: '#000',
      borderTopColor: '#fff',
      borderTopStyle: 'solid',
      borderTopWidth: 1,
      m: 0,
      pb: 6,
      pt: 6,
      bottom: 0,
      width: "100%"
    }}
    {...props}>
    <Container maxWidth="lg" style={{display:"flex", justifyContent:"center"}}>        
      <Typography
        color="textSecondary"
        variant="caption"
      >
        All Rights Reserved.
      </Typography>
    </Container>
  </Box>
);
