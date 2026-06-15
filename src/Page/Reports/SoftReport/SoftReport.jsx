import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import log from "../../../assets/Stock/log.png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { useNavigate } from "react-router-dom";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const SoftReport = () => {
  const [rows, setRows] = useState([]); // transformed rows for the table
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  // table state
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]); // [{id:'uuid', desc:false}]
  const [columnFilters, setColumnFilters] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();
  
  const handleGoToLog = (id) => {
    navigate(`/log/${id}`);
  };
  
  // columns: only the requested fields
  const columnHelper = createMRTColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("uuid", {
        header: "Asset ID",
        size: 240,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        size: 200,
        Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("updatedUsername", {
        header: "Updated By",
        size: 220,
      }),
      columnHelper.accessor("action", {
        header: "Action",
        size: 130,
        Cell: ({ row }) => (
          <Box>
            <IconButton
              onClick={() => handleGoToLog(row?.original?.id)}
              size="small"
              color="primary"
            >
              <img height={20} width={20} src={log} alt="view" />
            </IconButton>
          </Box>
        ),
      }),
    ],
    []
  );

  // helper to map MRT's sorting to API params
  const getSortParams = () => {
    if (!sorting?.length) {
      return { sortBy: "updatedAt", sortOrder: "desc" };
    }
    const s = sorting[0];
    // allowed keys for backend (pick from our columns)
    const allowed = new Set(["uuid", "updatedAt", "updatedUsername"]);
    const sortBy = allowed.has(s.id) ? s.id : "updatedAt";
    const sortOrder = s.desc ? "desc" : "asc";
    return { sortBy, sortOrder };
  };

  // fetch data
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const { pageIndex, pageSize } = pagination;
        const { sortBy, sortOrder } = getSortParams();
      

        const url = new URL(`${baseUrl}/request/soft-delete`);
        url.searchParams.set("page", String(pageIndex + 1));
        url.searchParams.set("limit", String(pageSize));
        url.searchParams.set("sortBy", sortBy);
        url.searchParams.set("sortOrder", sortOrder);
      

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();

        const payload = json?.data || {};
        const list = payload?.data || [];

        // transform to the 3 fields only
        const transformed = list.map((item) => ({
          id: item.id ?? item.uuid,
          uuid: item.uuid ?? "",
          updatedAt: item.updatedAt ?? "",
          updatedUsername: item?.updatedUser?.name ?? "",
        }));

        setRows(transformed);
        setAllData(transformed); // Store all data for client-side filtering

        const total =
          payload.total ??
          payload.count ??
          payload.totalRows ??
          json?.total ??
          json?.count ??
          transformed.length;

        setTotalRows(Number.isFinite(total) ? Number(total) : transformed.length);

        // figure out page count if provided, else compute
        const pageCountRaw =
          payload.pageCount ??
          payload.totalPages ??
          json?.pageCount ??
          json?.totalPages;

        if (Number.isFinite(pageCountRaw)) {
          setTotalPages(Number(pageCountRaw));
        } else {
          const pc = Math.max(1, Math.ceil((Number(total) || 0) / pagination.pageSize));
          setTotalPages(pc);
        }
      } catch (err) {
        console.error("SoftReport fetch error:", err);
        setRows([]);
        setAllData([]);
        setTotalRows(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters]);

  // Update the filteredData useMemo hook
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter((item) => {
      // Check both string and number representations
      return Object.keys(item).some((key) => {
        const value = item[key];

        // Skip null/undefined values
        if (value === null || value === undefined) return false;

        // Handle number values
        if (typeof value === "number") {
          return value.toString().includes(globalFilter); // Use original filter (not lowercased) for numbers
        }

        // Handle string values
        if (typeof value === "string") {
          // Check both original and lowercase versions for better matching
          return (
            value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter)
          );
        }

        return false;
      });
    });
  }, [allData, globalFilter]);

  const exportRows = (rowsToExport) => {
    const toCsv = rowsToExport.map((r) => {
      const original = r.original ?? r;
      return {
        uuid: original.uuid,
        updatedAt: original.updatedAt,
        updatedUsername: original.updatedUsername,
      };
    });
    const csv = generateCsv(csvConfig)(toCsv);
    download(csvConfig)(csv);
  };

  const exportAllData = () => exportRows(allData.map(row => ({ original: row })));

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnFilters: false,   // 👈 disables filter by column
    enableGlobalFilter: true,
    paginationDisplayMode: "pages",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",

    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
      isLoading: loading,
      rowSelection,
    },

    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,

    muiPaginationProps: { rowsPerPageOptions: [5, 10, 20, 50] },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
    muiTableBodyCellProps: { sx: { fontSize: "12px", whiteSpace: "nowrap" } },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
      },
    },
    muiTableContainerProps: { sx: { width: "100%", overflowX: "auto" } },

    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={exportAllData}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() => exportRows(table.getPrePaginationRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => exportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => exportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  return (
    <Box>
      <Box
        sx={{
          width: { xs: "100%", sm: "100%", md: "100%", lg: "1050px", xl: "1300px" },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default SoftReport;