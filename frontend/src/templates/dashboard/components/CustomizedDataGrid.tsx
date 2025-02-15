import * as React from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { columns } from '../internals/data/gridData';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useTheme } from '@mui/material';
import { Container } from '@mui/system';
import { Card, CardContent, CardActions, Divider } from '@mui/material';

interface EmailRow {
  id: number;
  subject: string;
  status: string;
  to: string;
  dateSent: string;
  from: string;
  content: string;
}

interface EmailDetailsModalProps {
  open: boolean;
  onClose: () => void;
  email: EmailRow | null;
}

const EmailDetailsModal: React.FC<EmailDetailsModalProps> = ({ open, onClose, email }) => {
  const theme = useTheme();
  if (!email) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="h6">Subject: {email.subject}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">Sender: {email.from}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">Receiver: {email.to}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">Date: {email.dateSent}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">Status:
            <Typography
              component="span"
              sx={{
                fontSize: 12,
                color: theme.palette.success.dark,
                ml: 1,
                borderRadius: 5,
                border: '1px solid',
                borderColor: theme.palette.success.main,
                padding: '2px 5px',
                backgroundColor: theme.palette.success.light,
              }}
            >
              {email.status}
            </Typography>
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" sx={{ padding: 2, borderRadius: 1 }}>
            {email.content}
          </Typography>
        </CardContent>
      </Card>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} color="primary" variant="contained" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState<EmailRow[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState<EmailRow | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await axios.get('http://localhost:3000/api/emails/get-emails', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const emails: any[] = response.data as any[];

        const formattedEmails = emails.map((email: any, index: number) => ({
          id: index + 1,
          subject: email.subject,
          status: 'Sent', // Adjust as needed
          from: email.sender,
          to: email.receiver,
          content: email.bodyPreview,
          dateSent: new Date(email.timeSent).toLocaleString(),
        }));

        setRows(formattedEmails);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  const handleRowClick = (params: any) => {
    const email = rows.find(row => row.id === params.id);
    setSelectedEmail(email || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmail(null);
  };

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        onRowClick={handleRowClick}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: 'outlined',
                size: 'small',
              },
              columnInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
            },
          },
        }}
      />
      <EmailDetailsModal open={modalOpen} onClose={handleCloseModal} email={selectedEmail} />
    </>
  );
}