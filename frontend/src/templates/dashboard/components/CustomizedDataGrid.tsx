import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { columns } from '../internals/data/gridData';

export default function CustomizedDataGrid() {
  interface EmailRow {
    id: number;
    subject: string;
    status: string;
    to: string;
    dateSent: string;
    from: string;
    content: string;
  }

  const [rows, setRows] = React.useState<EmailRow[]>([]);

  React.useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/emails/get-emails');
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

  return (
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
  );
}
