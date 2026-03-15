// Modified by AI on 03/15/2026. Edit #1.
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { fetchFailedCtrs, fetchFailedFormsForCtr } from './failedCtrsApi';
import type { FailedCtr, FailedForm } from './types';

function FailedFormsTable({ forms, loading }: { forms: FailedForm[]; loading: boolean }) {
  if (loading) return <CircularProgress />;
  if (forms.length === 0) return <Typography>No failed forms found.</Typography>;

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Report Name</TableCell>
            <TableCell>Report Status</TableCell>
            <TableCell>Data Trans Status</TableCell>
            <TableCell>PDF Gen Status</TableCell>
            <TableCell>Data Trans Message</TableCell>
            <TableCell>PDF Gen Message</TableCell>
            <TableCell>Transient Error</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell>{form.reportName}</TableCell>
              <TableCell>{form.reportStatus}</TableCell>
              <TableCell>{form.reportDataTransStatus}</TableCell>
              <TableCell>{form.pdfGenStatus}</TableCell>
              <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {form.reportDataTransMessage}
              </TableCell>
              <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {form.pdfGenMessage}
              </TableCell>
              <TableCell>
                {form.isFailedBecauseOfTransientError ? (
                  <Chip label="Transient" color="warning" size="small" />
                ) : (
                  <Chip label="Non-transient" color="error" size="small" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function CtrDetailDialog({
  ctr,
  onClose,
}: {
  ctr: FailedCtr | null;
  onClose: () => void;
}) {
  const [forms, setForms] = useState<FailedForm[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctr) return;
    setFormsLoading(true);
    setFormsError(null);
    fetchFailedFormsForCtr(ctr.taxPacketGuid)
      .then(setForms)
      .catch(() => setFormsError('Failed to load forms.'))
      .finally(() => setFormsLoading(false));
  }, [ctr]);

  return (
    <Dialog open={!!ctr} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        CTR Detail
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {ctr && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Tax Packet GUID</Typography>
                <Typography variant="body2">{ctr.taxPacketGuid}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">PQUID</Typography>
                <Typography variant="body2">{ctr.pquid}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Client ID</Typography>
                <Typography variant="body2">{ctr.clientId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Year</Typography>
                <Typography variant="body2">{ctr.year}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Quarter</Typography>
                <Typography variant="body2">{ctr.quarter}</Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>Failed Forms</Typography>
            {formsError && <Alert severity="error" sx={{ mb: 1 }}>{formsError}</Alert>}
            <FailedFormsTable forms={forms} loading={formsLoading} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function FailedCtrsPage() {
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(today);
  const [ctrs, setCtrs] = useState<FailedCtr[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCtr, setSelectedCtr] = useState<FailedCtr | null>(null);

  useEffect(() => {
    const from = selectedDate.startOf('day').toISOString();
    const to = selectedDate.endOf('day').toISOString();
    setLoading(true);
    setError(null);
    fetchFailedCtrs(from, to)
      .then(setCtrs)
      .catch(() => setError('Failed to load failed CTRs.'))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Failed CTRs</Typography>

        <Box sx={{ mb: 2 }}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={(val) => val && setSelectedDate(val)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', mb: 2 }} />}

        {!loading && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tax Packet GUID</TableCell>
                  <TableCell>PQUID</TableCell>
                  <TableCell>Client ID</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Quarter</TableCell>
                  <TableCell>Process Status</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Date Created</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Is Report Wizard CTR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ctrs.map((ctr) => (
                  <TableRow
                    key={ctr.taxPacketGuid}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCtr(ctr)}
                  >
                    <TableCell>{ctr.taxPacketGuid}</TableCell>
                    <TableCell>{ctr.pquid}</TableCell>
                    <TableCell>{ctr.clientId}</TableCell>
                    <TableCell>{ctr.year}</TableCell>
                    <TableCell>{ctr.quarter}</TableCell>
                    <TableCell>{ctr.processStatus}</TableCell>
                    <TableCell>{ctr.message}</TableCell>
                    <TableCell>{new Date(ctr.meta_DateCreated).toLocaleString()}</TableCell>
                    <TableCell>{ctr.reportType}</TableCell>
                    <TableCell>{ctr.isReportWizardCTR ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
                {ctrs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No failed CTRs found for selected date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <CtrDetailDialog ctr={selectedCtr} onClose={() => setSelectedCtr(null)} />
      </Box>
    </LocalizationProvider>
  );
}
