import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Editicon1 from "../../../assets/EmployeeImages/Group (2).png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { ArrowLeft } from "lucide-react";

const textFieldStyles = {
  height: '40px',
  px: 1,
  display: 'flex',
  alignItems: 'center',
  input: {
    textAlign: 'left',
    padding: 0,
  },
};

// Dummy product data
const productData = [
  {
    product: 'Laptop',
    brand: 'Dell',
    category: 'Electronics',
    subcategory: 'Computers',
    quantity: 10,
    unit: 'pcs',
    rate: 50000,
    total: 500000,
  },
  {
    product: 'Mouse',
    brand: 'Logitech',
    category: 'Accessories',
    subcategory: 'Input Devices',
    quantity: 20,
    unit: 'pcs',
    rate: 800,
    total: 16000,
  },
];

const columnHelper = createMRTColumnHelper();

const productColumns = [
  columnHelper.accessor('product', { header: 'Product Name', size: 40 }),
  columnHelper.accessor('brand', { header: 'Brand', size: 80 }),
  columnHelper.accessor('category', { header: 'Category', size: 80 }),
  columnHelper.accessor('subcategory', { header: 'Subcategory', size: 80 }),
  columnHelper.accessor('quantity', { header: 'Quantity', size: 80 }),
  columnHelper.accessor('unit', { header: 'Unit', size: 80 }),
  columnHelper.accessor('rate', { header: 'Rate', size: 80 }),
  columnHelper.accessor('total', { header: 'Total', size: 80 }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 60,
    // Cell: () => (
    //   <Box>
    //     <IconButton color="primary" size="small">
    //       <img src={Editicon1} alt="edit" width={16} height={16} />
    //     </IconButton>
    //     <IconButton color="error" size="small">
    //       <img src={Deleteicon1} alt="delete" width={16} height={16} />
    //     </IconButton>
    //   </Box>
    // ),
  }),
];

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

const AddGr = ({onBack}) => {
  const [poId, setPoId] = useState('po-kol-03-2025');
  const [date, setDate] = useState('Jul 3, 2025');
  const [vendor, setVendor] = useState('Technocraft');
  const [grandTotal, setGrandTotal] = useState('₹1,78,000.00');

  const table = useMaterialReactTable({
    columns: productColumns,
    data: productData,
    enableRowSelection: true,
    enableGlobalFilter: false,
    layoutMode: 'grid',
    paginationDisplayMode: 'pages',
    enableColumnResizing: false,
    columnResizeMode: 'onChange',
    positionToolbarAlertBanner: 'bottom',
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: '#FFE3E1' },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: '12px',
        whiteSpace: 'nowrap',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        '&:nth-of-type(odd)': {
          backgroundColor: '#fafafa',
        },
      },
    },
    muiTableContainerProps: {
      sx: { width: '100%', overflowX: 'auto' },
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={() => {
            const csv = generateCsv(csvConfig)(productData);
            download(csvConfig)(csv);
          }}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            download(csvConfig)(
              generateCsv(csvConfig)(
                table.getPrePaginationRowModel().rows.map((r) => r.original)
              )
            )
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() =>
            download(csvConfig)(
              generateCsv(csvConfig)(table.getRowModel().rows.map((r) => r.original))
            )
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() =>
            download(csvConfig)(
              generateCsv(csvConfig)(
                table.getSelectedRowModel().rows.map((r) => r.original)
              )
            )
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });
  const handleGoBack = () => {
    onBack();
  };
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Typography variant="h6" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <ArrowLeft
                  style={{ cursor: "pointer" }}
                  onClick={handleGoBack}
                  size={20}
                />
        GR Details
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography fontWeight="bold">GR Details</Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 0.5 }}>PO Id:</Typography>
              <TextField
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                fullWidth
                variant="filled"
                size="small"
                InputProps={{
                  disableUnderline: true,
                  sx: textFieldStyles,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 0.5 }}>Date:</Typography>
              <TextField
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                variant="filled"
                size="small"
                InputProps={{
                  disableUnderline: true,
                  sx: textFieldStyles,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 0.5 }}>Vendor:</Typography>
              <TextField
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                fullWidth
                variant="filled"
                size="small"
                InputProps={{
                  disableUnderline: true,
                  sx: textFieldStyles,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ mb: 0.5 }}>Grand Total:</Typography>
              <TextField
                value={grandTotal}
                onChange={(e) => setGrandTotal(e.target.value)}
                fullWidth
                variant="filled"
                size="small"
                InputProps={{
                  disableUnderline: true,
                  sx: textFieldStyles,
                }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            backgroundColor: '#fff',
          }}
        >
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            GR Note
          </Typography>
          <Typography color="text.secondary">No notes provided</Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Product Items
        </Typography>
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default AddGr;
