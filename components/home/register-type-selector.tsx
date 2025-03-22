import { Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { RegistrationType } from '../../types/registration';

interface RegisterTypeSelectorProps {
  onSelect: (type: RegistrationType) => void;
}

export const RegisterTypeSelector = ({ onSelect }: RegisterTypeSelectorProps) => {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ marginBottom: '30px' }}
        >
          Choose Registration Type
        </Typography>
        <RadioGroup onChange={(e) => onSelect(e.target.value as RegistrationType)}>
          <FormControlLabel 
            value="individual" 
            control={<Radio />} 
            label="Individual Registration" 
          />
          <FormControlLabel 
            value="enterprise" 
            control={<Radio />} 
            label="Enterprise Registration" 
          />
        </RadioGroup>
      </CardContent>
    </Card>
  );
}; 