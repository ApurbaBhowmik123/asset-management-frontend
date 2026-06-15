import React, { useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import axios from "axios";
import { baseUrl } from "../../../Api";
import { ArrowLeft } from "lucide-react";
import { CustomTextField } from "../../../../utils/CustomTextField";


export const TicketSubcategoryForm = ({ subcategory, categories, onBack, onSuccess }) => {
  const [name, setName] = useState(subcategory?.name || "");
  const [description, setDescription] = useState(subcategory?.description || "");
  const [categoryId, setCategoryId] = useState(subcategory?.categoryId || "");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      setSnackbar({ open: true, message: "Subcategory name is required", severity: "error" });
      return;
    }
    if (!categoryId) {
      setSnackbar({ open: true, message: "Please select a category", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const url = subcategory
        ? `${baseUrl}/tickets/master/subcategories/${subcategory.id}`
        : `${baseUrl}/tickets/master/subcategories`;
      const method = subcategory ? "put" : "post";

      const response = await axios[method](
        url,
        { name, description, categoryId: parseInt(categoryId) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: subcategory
            ? "Subcategory updated successfully"
            : "Subcategory created successfully",
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
        message: error.message || "Failed to save subcategory",
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
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ArrowLeft style={{ cursor: "pointer" }} onClick={onBack} size={20} />
       
      </Box>

      {/* Form Box */}
      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fff" }}>
        {/* <Typography variant="h6" sx={{ mb: 3 }}>
                  {subcategory ? "Edit SubCategory" : "Add New SubCategory"}
                </Typography> */}
        {/* Category and Subcategory Name in same row */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>Category</Typography>
            <CustomTextField
              select
              fullWidth
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
             
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </CustomTextField>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>Subcategory Name</Typography>
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
          <Button className="Global-Button2" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : subcategory ? "Update" : "Create"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
