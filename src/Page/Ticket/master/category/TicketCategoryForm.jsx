import React, { useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  TextField,
  Typography,
  MenuItem,
  Select,
} from "@mui/material";
import axios from "axios";
import { baseUrl } from "../../../Api";
import { ArrowLeft } from "lucide-react";
import { CustomTextField } from "../../../../utils/CustomTextField";



export const TicketCategoryForm = ({ category, onBack, onSuccess }) => {
  const [type, setType] = useState(category?.type || "");
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: "Category name is required",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const url = category
        ? `${baseUrl}/tickets/master/category/${category.id}`
        : `${baseUrl}/tickets/master/category`;

      const method = category ? "put" : "post";

      const response = await axios[method](
        url,
        { type, name, description },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: category
            ? "Category updated successfully"
            : "Category created successfully",
          severity: "success",
        });
        onSuccess();
      } else {
        setSnackbar({
          open: true,
          message: response.data.errorResponse.message,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to save category",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <ArrowLeft style={{ cursor: "pointer" }} onClick={onBack} size={20} />
        <Box sx={{ width: 100 }} /> {/* Spacer */}
      </Box>

      {/* Form Box */}
      <Box
        sx={{
          p: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        {/* <Typography variant="h6" sx={{ mb: 3 }}>
          {category ? "Edit Category" : "Add New Category"}
        </Typography> */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Type
            </Typography>
            <CustomTextField
              select
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value)}
             
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="Incident">Incident</MenuItem>
              <MenuItem value="Service Request">Service Request</MenuItem>
            </CustomTextField>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Category Name
            </Typography>
            <CustomTextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Description</Typography>
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
           
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button className="Global-Button3" onClick={onBack}>
            Cancel
          </Button>
          <Button
            className="Global-Button2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : category ? "Update" : "Create"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
