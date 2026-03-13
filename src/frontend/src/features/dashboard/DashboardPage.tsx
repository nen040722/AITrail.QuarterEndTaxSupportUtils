// Modified by AI on 03/13/2026. Edit #1.
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { axiosClient } from '../../shared/api/axiosClient';

async function fetchHealth(): Promise<{ status: string }> {
  const { data } = await axiosClient.get<{ status: string }>('/health');
  return data;
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 1,
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography color="text.secondary">API status:</Typography>
        {isLoading && <CircularProgress size={16} />}
        {!isLoading && !isError && data?.status === 'ok' && (
          <Chip label="API connected" color="success" size="small" />
        )}
        {!isLoading && isError && (
          <Chip label="API unreachable" color="error" size="small" />
        )}
      </Box>
    </Box>
  );
}

