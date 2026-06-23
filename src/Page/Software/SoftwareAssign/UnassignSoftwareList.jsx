import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { baseUrl } from "../../Api";

const UnassignSoftwareList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${baseUrl}/software/unassign-list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const json = await res.json();
      if (json.data) setData(json.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo(() => [
    { accessorKey: "softwareAssignment.assignedId", header: "Assign ID", Cell: ({row}) => row.original.softwareAssignment?.assignedId || '-' },
    { accessorKey: "softwareAssignment.software.name", header: "Software", Cell: ({row}) => row.original.softwareAssignment?.software?.name || '-' },
    { accessorKey: "unassignedQuantity", header: "Qty" },
    { accessorKey: "remarks", header: "Remarks" },
    { accessorKey: "condition", header: "Condition" },
    { accessorKey: "createdBy.name", header: "Unassigned By", Cell: ({row}) => row.original.createdBy?.name || '-' }
  ], []);

  const table = useMaterialReactTable({ columns, data });

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>Software Unassignments</Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};
export default UnassignSoftwareList;
