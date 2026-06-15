import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";



const DepartmentAdd = ({ onBack, onSuccess, editingDepartment, onUpdate }) => {
  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

    const token = localStorage.getItem("token");


  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        departmentName: editingDepartment.name,
        description: editingDepartment.description || "",
      });
    } else {
      setFormData({
        departmentName: "",
        description: "",
      });
    }
  }, [editingDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentName.trim()) {
      setSnackbar({
        open: true,
        message: "Department Name is required",
        severity: "error",
      });
      return;
    }

    if (editingDepartment) {
      // Handle update
      const result = await onUpdate(formData);
      if (result.success) {
        setTimeout(() => {
          onSuccess();
          onBack();
        }, 1000);
      }
    } else {
      // Handle create
      try {
        const response = await axios.post(
          `${baseUrl}/super-admin/departments/create`,
          [
            {
              name: formData.departmentName,
              description: formData.description,
            },
          ],
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setSnackbar({
            open: true,
            message: response.data.message,
            severity: "success",
          });
          setFormData({ departmentName: "", description: "" });

          setTimeout(() => {
            onSuccess();
            onBack();
          }, 1000);
        } else {
          setSnackbar({
            open: true,
             message: response.data.errorResponse.message,
            severity: "error",
          });
        }
      } catch (error) {
        console.error("API Error:", error);

        if (
          error.response &&
          error.response.status === 422 &&
          error.response.data.status === "validation_error"
        ) {
          const errorMsg = error.response.data.message || "Validation error occurred.";
          setSnackbar({
            open: true,
            message: errorMsg,
            severity: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || "Something went wrong.",
            severity: "error",
          });
        }
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Typography
        fontSize={16}
        fontWeight={600}
        gutterBottom
        mb={1}
        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
        onClick={() => onBack && onBack()}
      >
        <ArrowLeft />
        {/* {editingDepartment ? "Edit Department" : "Add New Department"} */}
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <Typography mb={1}>Department Name <span className="reuired_field">*</span></Typography>
            <CustomTextField
              name="departmentName"
              placeholder="Enter department name"
              value={formData.departmentName}
              onChange={handleChange}
            />
          </Box>

          <Box mb={2}>
            <Typography mb={1}>Description</Typography>
            <CustomTextField
              multiline
              rows={1}
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
            />
          </Box>

          <Box mt={4} display="flex" justifyContent="center">
            <Button type="submit" className="Global-Button2" variant="contained">
              {editingDepartment ? "Update Department" : "Save Department"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentAdd;