import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { baseUrl } from "../../Api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { formatDate } from "date-fns";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const InstallationDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [softwareArray, setSoftwareArray] = useState([]);
  const installationId = useParams();
  const { id } = installationId;

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFetchInstallationDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${baseUrl}/gr/installations/complete-installation/details/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage?.getItem("token")}`,
          },
        }
      );
      const data = await res?.json();

      if (!data?.status) {
        setSnackbar({
          open: true,
          message: data?.message,
          severity: "error",
        });
        return;
      }
      const transformData = {};

      data?.data?.forEach((item) => {
        transformData.installationId = item?.installationId;
        transformData.installedBy = item?.createdUser?.name;
        transformData.createdAt = item?.createdAt;
        transformData.softwareValue = item?.value;
        // transformData.softwares = item?.softwares;
        transformData.productId = item?.product?.uuid;
        transformData.grId = item?.product?.grInventoryProduct?.grDetails?.uuid;
        transformData.productName =
          item?.product?.grInventoryProduct?.product?.name;
        transformData.brand =
          item?.product?.grInventoryProduct?.product?.brand?.name;
        transformData.category =
          item?.product?.grInventoryProduct?.product?.category?.name;
        transformData.grDate =
          item?.product?.grInventoryProduct?.grDetails?.grDate;
        transformData.serialNumbers =
          item?.product?.serialNo1 || item?.product?.serialNo2;
        transformData.status = item?.product?.assignedStatus;
      });
      setFormData(transformData);
      setSoftwareArray(data);

      setLoading(false);
    } catch (error) {
      console.error("error", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message,
        severity: "error",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchInstallationDetails();
  }, []);

  const handleBack = () => {
    navigate("/grentry/installation-list");
  };

  return (
    <>
      <style>{`
                .custom-text-field .MuiOutlinedInput-root {
                    background-color: #F9F9F9;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .custom-text-field .MuiOutlinedInput-notchedOutline {
                    border: none !important;
                }
                .custom-text-field .Mui-focused .MuiOutlinedInput-notchedOutline {
                    border-color: #D7D7D7 !important;
                }
                .button-container {
                    margin-top: 20px;
                    display: flex;
                    gap: 16px;
                    justify-content: flex-end;
                }
                .software-fields-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .software-field {
                    flex: 1 1 calc(50% - 8px);
                    min-width: 250px;
                }
                .installation-info-box {
                    background: #F5F5F5;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
            `}</style>

      <Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
          <ArrowLeft onClick={handleBack} style={{ cursor: "pointer" }} />
          <Typography variant="h6">Installation Details</Typography>
        </Box>

        <Paper elevation={0}>
          <Box sx={{ p: 3 }}>
            <Typography fontSize={15} fontWeight={600} mb={3}>
              Installation Information
            </Typography>

            {loading ? (
              <Typography>Loading installation data...</Typography>
            ) : (
              <>
                <Box className="installation-info-box">
                  <Typography variant="h6" mb={2}>
                    Installation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Installation ID:</strong>{" "}
                        {formData?.installationId || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Installed By:</strong>{" "}
                        {formData?.installedBy || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Created At:</strong>{" "}
                        {dateTimeHelper.formatDate(formData?.createdAt) ||
                          "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Product Id:</strong> {formData?.productId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>GR Id:</strong> {formData?.grId}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Product Name:</strong> {formData?.productName}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Brand:</strong> {formData?.brand}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Category:</strong> {formData?.category}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>GR Date:</strong>{" "}
                        {dateTimeHelper.formatDate(formData?.grDate) || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Serial Numbers:</strong>{" "}
                        {formData?.serialNumbers}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">
                        <strong>Status:</strong> {formData?.status}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" mb={2}>
                  Installation
                </Typography>
                {softwareArray?.data?.length > 0 ? (
                  <Grid container spacing={2}>
                    {softwareArray?.data?.map((softVal) => (
                      <Grid size={{ xs: 12, sm: 6, md: 6 }} key={softVal?.id}>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {softVal?.softwares?.name}
                        </Typography>
                        <div className="software-fields-container">

                          <div className="software-field">
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={softVal?.value}
                              className="custom-text-field"
                              disabled
                            />
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <p>No software found</p>
                )}

                {/* <div className="software-fields-container">
                  <Typography
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {formData?.softwares?.name}
                  </Typography>
                  <div className="software-field">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={formData?.softwareValue}
                      className="custom-text-field"
                      disabled
                    />
                  </div>
                </div> */}
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default InstallationDetails;
