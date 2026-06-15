import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";
import Logo from "../../../assets/Sidebarimages/Layer 1 1.jpeg";

const PdfExportModal = ({
  open,
  onClose,
  columns,
  totalRows,
  onExportSuccess,
  onExportError,
}) => {
  const [selectedColumns, setSelectedColumns] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize selected columns
  useEffect(() => {
    if (columns.length > 0) {
      const initialSelection = {};
      columns.forEach((col) => {
        initialSelection[col.accessorKey || col.header] = true;
      });
      setSelectedColumns(initialSelection);
    }
  }, [columns]);

  // Function to convert image to base64
  const getBase64FromImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  };

  // Handle column selection change
  const handleColumnSelectionChange = (columnKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Select all columns
  const handleSelectAll = () => {
    const allSelected = {};
    columns.forEach((col) => {
      allSelected[col.accessorKey || col.header] = true;
    });
    setSelectedColumns(allSelected);
  };

  // Deselect all columns
  const handleDeselectAll = () => {
    const noneSelected = {};
    columns.forEach((col) => {
      noneSelected[col.accessorKey || col.header] = false;
    });
    setSelectedColumns(noneSelected);
  };

  // PDF Export Function
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      onClose(); // Close the modal first

      // Fetch ALL data without pagination for PDF export
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/gr/inventory/all-assets?limit=${totalRows}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.status || !result.data) {
        throw new Error("Failed to fetch data for PDF export");
      }

      // First pass to collect all unique spec field names from the complete dataset
      const specFieldNames = new Set();
      const softwareNames = new Set();

      result.data.data.forEach((item) => {
        // Collect spec field names
        item.specValues?.forEach((spec) => {
          if (spec.specField?.name) {
            specFieldNames.add(spec.specField.name);
          }
        });

        // Collect software names
        item.softwareInstalls?.forEach((software) => {
          if (software.softwares?.name) {
            softwareNames.add(software.softwares.name);
          }
        });
      });

      // Process the complete dataset for PDF
      const completeData = result.data.data.map((item) => {
        // Create an object to hold all spec field values
        const specFields = {};
        specFieldNames.forEach((name) => {
          const spec = item.specValues?.find(
            (s) => s.specField?.name === name
          );
          specFields[name] = spec?.value || "NA";
        });

        // Create an object to hold all software values
        const softwareFields = {};
        softwareNames.forEach((name) => {
          const software = item.softwareInstalls?.find(
            (s) => s.softwares?.name === name
          );
          softwareFields[name] = software?.value || "NA";
        });

        // Get asset type
        const assetType =
          item.grInventoryProduct?.product?.category?.name || "NA";
        const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;

        // Get assigned status and use productStatusHelper for consistent formatting
        const assignedStatus = item.assignedStatus || "NA";
        const statusLabel = productStatusHelper.getLabel(assignedStatus);

        return {
          uuid: item.uuid,
          id: item?.id,
          username: assignedUser?.name || "NA",
          assetType,
          serialNumber: item.serialNo1 || "NA",
          description: item.grInventoryProduct?.description || "NA",
          assetTag: item.grInventoryProduct?.product?.uuid || "NA",
          usedByEmail: assignedUser?.email || "NA",
          sapCode: item.sapCode || "NA",
          acquisitionDate: item.grInventoryProduct?.createdAt || "NA",
          department: assignedUser?.department?.name || "NA",
          unit: item.unit?.name || "NA",
          location: item.location?.name || "NA",
          assignedOn: item.createdAt || "NA",
          make: item.grInventoryProduct?.product?.brand?.name || "NA",
          model: item.grInventoryProduct?.product?.name || "NA",
          serialNumberAlt: item.serialNo2 || "NA",
          assetState: assignedStatus,
          grNo: item?.grInventoryProduct?.grDetails?.grId || "NA",
          poNo: item?.grInventoryProduct?.grDetails?.sapId || "NA",
          poDate:
            dateTimeHelper.formatDate(
              item?.grInventoryProduct?.grDetails?.sapDate
            ) || "NA",
          invoiceNo:
            item?.grInventoryProduct?.grDetails?.invoiceNumber || "NA",
          invoiceDate: item?.grInventoryProduct?.grDetails?.invoiceDate
            ? dateTimeHelper.formatDate(
              item.grInventoryProduct.grDetails.invoiceDate
            )
            : "NA",
          grDate:
            dateTimeHelper.formatDate(
              item?.grInventoryProduct?.grDetails?.grDate
            ) || "NA",
          poValue: item.grInventoryProduct?.totalAmount || "NA",
          poNumber: "NA",
          warrantyAmc: item.grInventoryProduct?.warrantyTill || "NA",
          warrantyExpiryDate: item.grInventoryProduct?.warrantyTill || "NA",
          lastAuditDate: item.updatedAt || "NA",
          totalCost: item.totalCost || "NA",
          usedStatus: item.isUsed ? "Used" : "New",
          status: statusLabel,
          isFree: item.isFree ? "Yes" : "No",
          maintenanceFrequency:
            item.grInventoryProduct?.maintenanceFrequency || "NA",
          maintenanceDueDate:
            item.grInventoryProduct?.maintenanceDueDate || "NA",
          lifecycleExDate: item.grInventoryProduct?.lifecycleExDate || "NA",
          grInventoryProductId: item.grInventoryProductId || "NA",
          isUsed: item.isUsed ? "Yes" : "No",
          createdBy: item.createdBy || "NA",
          updatedBy: item.updatedBy || "NA",
          createdAt: item.createdAt || "NA",
          updatedAt: item.updatedAt || "NA",
          productBrand: item.grInventoryProduct?.product?.brand?.name || "NA",
          productCategory:
            item.grInventoryProduct?.product?.category?.name || "NA",
          ratePerPiece: item.grInventoryProduct?.ratePerPiece || "NA",
          freeQty: item.grInventoryProduct?.freeQty || "NA",
          quantity: item.grInventoryProduct?.quantity || "NA",
          grDetailsId: item.grInventoryProduct?.grDetailsId || "NA",
          installationStatus: item.installationStatus || false,
          // Add all spec fields dynamically
          ...Object.fromEntries(
            Array.from(specFieldNames).map((name) => [name, specFields[name]])
          ),
          // Add all software fields dynamically
          ...Object.fromEntries(
            Array.from(softwareNames).map((name) => [
              name,
              softwareFields[name],
            ])
          ),
        };
      });

      // Create a new PDF document in landscape mode
      const doc = new jsPDF("landscape");

      // Convert logo to base64
      const logoData = await getBase64FromImage(Logo);

      // Add logo on the left side
      if (logoData) {
        doc.addImage(logoData, "PNG", 15, 10, 16, 16);
      }

      // Add current date and created by on the right side
      const currentDate = new Date().toLocaleDateString();
      const profile = JSON.parse(localStorage.getItem("profile"));
      const currentUser = profile?.data?.name || "Guest";

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(`Generated on: ${currentDate}`, pageWidth - 70, 15);
      doc.text(`Generated by: ${currentUser}`, pageWidth - 70, 22);

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("All Assets Report", pageWidth / 2, 25, { align: "center" });

      // Add total count
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Assets: ${totalRows}`, 15, 35);

      // Prepare table data - include only selected columns
      const tableColumn = [];
      const columnKeys = [];

      // Add base columns that are selected
      const baseColumnMapping = {
        uuid: "Asset ID",
        status: "Status",
        username: "Username",
        assetType: "Asset Type",
        serialNumber: "Serial Number",
        sapCode: "SAP Code",
        totalCost: "Total Cost",
        unit: "Unit",
        location: "Location",
        department: "Department",
        make: "Make",
        model: "Model",
        usedStatus: "Used Status",
        acquisitionDate: "Acquisition Date",
        assignedOn: "Assigned On",
        description: "Description",
        usedByEmail: "Used By (Email)",
        assetTag: "Asset Tag",
        poValue: "PO Value",
        warrantyAmc: "Warranty/AMC",
        warrantyExpiryDate: "Warranty Expiry Date",
        lastAuditDate: "Last Audit Date",
        maintenanceDueDate: "Maintenance Due Date",
        lifecycleExDate: "Lifecycle Expiry Date",
        grNo: "GR No",
        poNo: "PO No",
        invoiceNo: "Invoice No",
        invoiceDate: "Invoice Date",
        grDate: "GR Date",
        poDate: "PO Date",
        productBrand: "Product Brand",
        productCategory: "Product Category",
        ratePerPiece: "Rate Per Piece",
        freeQty: "Free Qty",
        quantity: "Quantity",
        createdAt: "Created At",
        updatedAt: "Updated At",
      };

      // Add selected base columns
      Object.keys(baseColumnMapping).forEach((key) => {
        if (selectedColumns[key]) {
          tableColumn.push(baseColumnMapping[key]);
          columnKeys.push(key);
        }
      });

      // Generate dynamic columns for spec fields
      const specColumns = Array.from(specFieldNames).map((name) => ({
        accessorKey: name,
        header: name,
      }));

      // Generate dynamic columns for software fields
      const softwareColumns = Array.from(softwareNames).map((name) => ({
        accessorKey: name,
        header: name,
      }));

      // Add selected dynamic columns
      [...specColumns, ...softwareColumns].forEach((col) => {
        if (selectedColumns[col.accessorKey]) {
          tableColumn.push(col.header);
          columnKeys.push(col.accessorKey);
        }
      });

      // Transform data for the table
      const tableRows = [];

      completeData.forEach((item) => {
        const rowData = columnKeys.map((key) => {
          const value = item[key];

          // Format specific fields
          if (key === "totalCost" && value !== "NA") {
            return `₹${value}`;
          }

          if (key === "poValue" && value !== "NA") {
            return `₹${value}`;
          }

          if (key === "ratePerPiece" && value !== "NA") {
            return `₹${value}`;
          }

          // Format date fields
          if (
            (key.includes("Date") || key.includes("At")) &&
            value !== "NA" &&
            value
          ) {
            return dateTimeHelper.formatDate(value, "DD/MM/YYYY");
          }

          return value || "NA";
        });
        tableRows.push(rowData);
      });

      // Add table to PDF with horizontal scrolling capability
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
          overflow: "linebreak",
          minCellWidth: 40,
        },
        headStyles: {
          fillColor: [255, 227, 225],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 45, right: 5, bottom: 30, left: 5 },
        tableWidth: "wrap",
        horizontalPageBreak: true,
        tableLineWidth: 0.1,
        // Add note about horizontal scrolling
        didDrawPage: function (data) {
          // Footer with page number and scroll note
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} | Scroll horizontally to view all columns`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Save the PDF
      const fileName = `All_Assets_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      
      if (onExportSuccess) {
        onExportSuccess("PDF exported successfully with all data!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (onExportError) {
        onExportError("Failed to export PDF");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      maxHeight="80vh"
    >
      <DialogTitle>
        <Typography variant="h6">Select Columns for PDF Export</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
          <Button className="Global-Button2" onClick={handleSelectAll} size="small">
            Select All
          </Button>
          <Button className="Global-Button2" onClick={handleDeselectAll} size="small">
            Deselect All
          </Button>
        </Box>

        <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={column.accessorKey || column.header}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedColumns[column.accessorKey || column.header] ||
                        false
                      }
                      onChange={() =>
                        handleColumnSelectionChange(
                          column.accessorKey || column.header
                        )
                      }
                    />
                  }
                  label={column.header}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button className="Global-Button3" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExportPDF}
          variant="contained"
          disabled={loading}
          className="Global-Button2"
        >
          {loading ? "Generating..." : "Generate PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfExportModal;