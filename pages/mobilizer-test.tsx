import React from 'react';
import { useSession } from 'next-auth/react';
import { Container, Typography, Box, Alert } from '@mui/material';

export default function MobilizerTest() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Loading session...</Typography>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">Not logged in</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Mobilizer Session Test
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Session Data:</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">User Data:</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify((session as any)?.userData, null, 2)}
        </pre>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Mobilizer ID:</Typography>
        <Typography variant="body1">
          {(session as any)?.userData?.mobilizerId || 'NOT FOUND'}
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Role:</Typography>
        <Typography variant="body1">
          {(session as any)?.userData?.role || 'NOT FOUND'}
        </Typography>
      </Box>
    </Container>
  );
}
