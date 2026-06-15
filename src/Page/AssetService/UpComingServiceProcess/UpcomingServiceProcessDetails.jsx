import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Snackbar,
  styled,
  Switch,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import useInputStyle from "../../../CustomHooks/useInputStyle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../../Api";
import { useEffect, useState } from "react";

const UpcomingServiceProcessDetails = () => {
  const [data, setData] = useState();
  const [specFields, setSpecFields] = useState([]);
  const [softwareCatalog, setSoftwareCatalog] = useState([]);
  const {
    inputLabelStyle,
    textFieldStyles,
    textFieldStylesWhiteBg,
    textAreaStyle,
  } = useInputStyle();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const defaultState = {
    assetId: "",
    assetType: "",
    department: "",
    specFields: {},
    softwareFields: {},
    cost: "",
    remarks: "",
    latestVersionOfOSUpdate: "",
    hardDiskHealthCheck: "",
    monitorErrorsLoginScript: "",
    tcpIpSettings: "",
    azureJoinDomainCheck: false,
    adPolicyStatus: false,
    zscalerDnsCheck: false,
    deviceManager: false,
    hddPerformance: false,
    systemDrivers: false,
    memorySpeed: false,
    laptopBattery: false,
    verifyUpgradedVersion: "",
    appLicenseStatus: false,
    applications: "",
    antivirusStatus: false,
    antivirusPolicy: false,
    systemScan: false,
    wsusPatches: "",
    intuneAppStatus: false,
    unwantedApps: "",
    tempFiles: "",
    startupConfig: "",
    bitlockerCheck: "",
    backupSolution: "",
    mouseKeyboard: false,
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [upcomingServiceProcessData, setUpcomingServiceProcessData] =
    useState(defaultState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpcomingServiceProcessData({
      ...upcomingServiceProcessData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveAssetDetails = async () => {
    try {
      // Prepare the request body with proper defaults
      const requestBody = {
        serviceDetails: {
          servicingCost: Number(upcomingServiceProcessData?.cost),
          servicingRemarks: upcomingServiceProcessData?.remarks,
          latestVersionOfOsUpdate:
            upcomingServiceProcessData?.latestVersionOfOSUpdate || "",
          harddiskCheck: upcomingServiceProcessData.hardDiskHealthCheck || "",

          monitorCheck:
            upcomingServiceProcessData.monitorErrorsLoginScript || "",
          tcpipCheck: upcomingServiceProcessData.tcpIpSettings || "",
          azurejoinandDomainCheck: Boolean(
            upcomingServiceProcessData.azureJoinDomainCheck
          ),
          adPolicyCheck: Boolean(upcomingServiceProcessData.adPolicyStatus),
          zscalerandDnsCheck: Boolean(
            upcomingServiceProcessData.zscalerDnsCheck
          ),
          deviceManagerCheck: Boolean(upcomingServiceProcessData.deviceManager),
          hDDPerformanceCheck: Boolean(
            upcomingServiceProcessData.hddPerformance
          ),
          memorySpeedCheck: Boolean(upcomingServiceProcessData.memorySpeed),
          systemDriverStatusCheck: Boolean(
            upcomingServiceProcessData.systemDrivers
          ),
          laptopBatteryCheck: Boolean(upcomingServiceProcessData.laptopBattery),
          zscalerProxyVerUpgrade:
            upcomingServiceProcessData.verifyUpgradedVersion || "",
          applicationLicenseCheck: Boolean(
            upcomingServiceProcessData.appLicenseStatus
          ),
          applicationOffice: upcomingServiceProcessData.applications || "",
          antivirusStatusCheck: Boolean(
            upcomingServiceProcessData.antivirusStatus
          ),
          antiVirusPolicyCheck: Boolean(
            upcomingServiceProcessData.antivirusPolicy
          ),
          systemScanAndLogCheck: Boolean(upcomingServiceProcessData.systemScan),
          wsusPatchRelease: upcomingServiceProcessData.wsusPatches || "",
          intuneApplicationCheck: Boolean(
            upcomingServiceProcessData.intuneAppStatus
          ),
          unWantedapplicationTobeRemoved:
            upcomingServiceProcessData.unwantedApps || "",
          tempRefetchPrefetchtobeDeleted:
            upcomingServiceProcessData.tempFiles || "",
          startupToBeConfigured: upcomingServiceProcessData.startupConfig || "",
          bitLockerCheck: upcomingServiceProcessData.bitlockerCheck || "",
          backupSolutionCheck: upcomingServiceProcessData.backupSolution || "",
          mouseKeyboardStatus: Boolean(
            upcomingServiceProcessData.mouseKeyboard
          ),
        },
      };

      // Add softwareIds only for non-empty values
      if (softwareCatalog.length > 0) {
        const softwareWithValues = softwareCatalog
          .map((software) => ({
            id: software.id,
            value:
              upcomingServiceProcessData.softwareFields[software.name] || "",
          }))
          .filter((item) => item.value !== "");

        if (softwareWithValues.length > 0) {
          requestBody.softwareIds = softwareWithValues;
        }
      }

      // Add specValues only for non-empty values
      if (specFields?.data?.length > 0) {
        const specValuesWithValues = specFields?.data
          .map((spec) => ({
            id: spec.id,
            value: upcomingServiceProcessData?.specFields[spec.name] || "",
          }))
          .filter((item) => item.value !== "");

        if (specValuesWithValues?.length > 0) {
          requestBody.specValues = specValuesWithValues;
        }
      }

      const response = await fetch(
        `${baseUrl}/asset-service/upcoming-service/create/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      const responseData = await response.json();

      if (
        !responseData?.status ||
        responseData?.status === "validation_error"
      ) {
        console.error(responseData?.message);
        setSnackbar({
          open: true,
          message: responseData?.message,
          severity: "error",
        });
        return;
      }
      handleFetchServiceProcessDetails();
      setSnackbar({
        open: true,
        message: responseData?.message,
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      setSnackbar({
        open: true,
        message: error?.message,
        severity: "error",
      });
    }
  };

  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 36,
    height: 16,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(20px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(20px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#1890ff",
          ...theme.applyStyles?.("dark", {
            backgroundColor: "#177ddc",
          }),
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(["width"], {
        duration: 200,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 8,
      opacity: 1,
      backgroundColor: "rgba(0,0,0,.25)",
      boxSizing: "border-box",
      ...theme.applyStyles?.("dark", {
        backgroundColor: "rgba(255,255,255,.35)",
      }),
    },
  }));

  const handleFetchServiceProcessDetails = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/asset-service/upcoming-service/details/${id}`,
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
        return;
      }
      setData(data?.data);

      // Initialize form data with API values
      const initialFormData = {
        assetId: data?.data?.uuid || "",
        assetType:
          data?.data?.grInventoryProduct?.product?.category?.name || "",
        department:
          data?.data?.AssignProductDetails?.[0]?.assignedToUser?.department
            ?.name || "",
        specFields: {},
        softwareFields: {},
      };

      // Set spec values
      data?.data?.specValues?.forEach((spec) => {
        initialFormData.specFields[spec.specField.name] = spec.value;
      });

      // Set software install values
      data?.data?.softwareInstalls?.forEach((software) => {
        initialFormData.softwareFields[software.softwares.name] =
          software.value;
      });

      setUpcomingServiceProcessData(initialFormData);
    } catch (error) {
      console.error("error", error);
    }
  };
  const handleFetchSpecFields = async () => {
    try {
      const res = await fetch(`${baseUrl}/catalog/specFields`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage?.getItem("token")}`,
        },
      });
      const data = await res?.json();
      if (data?.status) {
        setSpecFields(data?.data);
      }
    } catch (error) {
      console.error("errorrr", error);
    }
  };

  const handleFetchSoftwareFields = async () => {
    try {
      const res = await fetch(`${baseUrl}/catalog/installsof`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage?.getItem("token")}`,
        },
      });
      const data = await res?.json();
      if (data?.status) {
        setSoftwareCatalog(data?.data?.data || []);
      }
    } catch (error) {
      console.error("error fetching software catalog", error);
    }
  };

  useEffect(() => {
    handleFetchSpecFields();
  }, []);

  useEffect(() => {
    handleFetchSoftwareFields();
  }, []);

  useEffect(() => {
    handleFetchServiceProcessDetails();
    handleFetchSpecFields();
  }, []);

  useEffect(() => {
    handleFetchServiceProcessDetails();
    handleFetchSpecFields();
  }, []);

  return (
    <div>
      <Box
        onClick={() =>
          navigate(
            "/asset-service/upcoming-service-process/asset-maintainance-checklist"
          )
        }
        sx={{ cursor: "pointer" }}
      >
        <ArrowBackIcon />
      </Box>
      <Box sx={{ backgroundColor: "#FFF", p: 2, borderRadius: "10px" }}>
        <Typography fontWeight={"600"} variant="subtitle1">
          General Information (Filled by IT Support Engineer)
        </Typography>
        <Divider sx={{ marginTop: 2 }} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <InputLabel sx={inputLabelStyle}>Asset Id :</InputLabel>
            <TextField
              value={upcomingServiceProcessData?.assetId}
              name="assetId"
              onChange={handleChange}
              fullWidth
              size="small"
              sx={textFieldStyles}
              disabled
            />
          </Grid>
          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <InputLabel sx={inputLabelStyle}>Asset Type :</InputLabel>
            <TextField
              value={upcomingServiceProcessData?.assetType}
              name="assetType"
              onChange={handleChange}
              fullWidth
              size="small"
              sx={textFieldStyles}
              disabled
            />
          </Grid>

          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <InputLabel sx={inputLabelStyle}>Department :</InputLabel>
            <TextField
              value={upcomingServiceProcessData?.department}
              name="department"
              onChange={handleChange}
              fullWidth
              size="small"
              sx={textFieldStyles}
              disabled
            />
          </Grid>
          {/* Render all specFields from catalog */}
          {specFields?.data?.length > 0 &&
            specFields?.data?.map((specField) => {
              const fieldValue =
                upcomingServiceProcessData.specFields[specField.name] || "";
              return (
                <Grid size={{ md: 3, sm: 6, xs: 12 }} key={specField.id}>
                  <InputLabel sx={inputLabelStyle}>
                    {specField.name} :
                  </InputLabel>

                  {specField.fieldType === "DROPDOWN" ? (
                    <FormControl fullWidth>
                      <TextField
                        select
                        size="small"
                        sx={textFieldStyles}
                        value={fieldValue}
                        onChange={(e) => {
                          setUpcomingServiceProcessData((prev) => ({
                            ...prev,
                            specFields: {
                              ...prev.specFields,
                              [specField.name]: e.target.value, // Changed from specField.id to specField.name
                            },
                          }));
                        }}
                      >
                        <MenuItem>Select {specField.name}</MenuItem>
                        {specField.options?.map((option) => (
                          <MenuItem key={option.id} value={option.value}>
                            {option.value}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  ) : (
                    <TextField
                      value={fieldValue}
                      onChange={(e) => {
                        setUpcomingServiceProcessData((prev) => ({
                          ...prev,
                          specFields: {
                            ...prev.specFields,
                            [specField.name]: e.target.value, // Changed from specField.id to specField.name
                          },
                        }));
                      }}
                      fullWidth
                      size="small"
                      sx={textFieldStyles}
                    />
                  )}
                </Grid>
              );
            })}

          {/* Render all software from catalog with installed values */}
          {softwareCatalog?.length > 0 &&
            softwareCatalog?.map((software) => {
              const softwareValue =
                upcomingServiceProcessData.softwareFields[software.name] || "";

              return (
                <Grid size={{ md: 3, sm: 6, xs: 12 }} key={software.id}>
                  <InputLabel sx={inputLabelStyle}>
                    {software.name} :
                  </InputLabel>
                  <TextField
                    value={softwareValue}
                    onChange={(e) => {
                      setUpcomingServiceProcessData((prev) => ({
                        ...prev,
                        softwareFields: {
                          ...prev.softwareFields,
                          [software.name]: e.target.value,
                        },
                      }));
                    }}
                    fullWidth
                    size="small"
                    sx={textFieldStyles}
                    // placeholder="Not installed"
                  />
                </Grid>
              );
            })}

          {/**Cost */}
          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <InputLabel sx={inputLabelStyle}>Cost :</InputLabel>
            <TextField
              value={upcomingServiceProcessData?.cost}
              name="cost"
              onChange={handleChange}
              fullWidth
              size="small"
              sx={textFieldStyles}
            />
          </Grid>

          {/**Remarks */}
          <Grid size={{ md: 6, sm: 6, xs: 12 }}>
            <InputLabel sx={inputLabelStyle}>Remarks :</InputLabel>
            <TextareaAutosize
              rows={1}
              value={upcomingServiceProcessData?.remarks || ""}
              name="remarks"
              onChange={handleChange}
              style={textAreaStyle}
            />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Divider />
        </Box>
        <Box mt={3}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                1. System Boot
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    {/* Hard disk health check (SMART status) */}
                    Latest Version of OS updated
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.latestVersionOfOSUpdate}
                    name="latestVersionOfOSUpdate"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                2. System Login
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Monitor erros/Login Script
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.monitorErrorsLoginScript}
                    name="monitorErrorsLoginScript"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                3. Network setting to be check
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    TCP/IP settings are ok
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.tcpIpSettings}
                    name="tcpIpSettings"
                  />
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Azure join and domain name check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          azureJoinDomainCheck: e.target.checked,
                        })
                      }
                      name="azureJoinDomainCheck"
                      checked={upcomingServiceProcessData.azureJoinDomainCheck}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    C.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Ad policy status to be check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          adPolicyStatus: e.target.checked,
                        })
                      }
                      name="adPolicyStatus"
                      checked={upcomingServiceProcessData.adPolicyStatus}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    D.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Zscaler V2.0 & DNS to be checked
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          zscalerDnsCheck: e.target.checked,
                        })
                      }
                      name="zscalerDnsCheck"
                      checked={upcomingServiceProcessData.zscalerDnsCheck}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    E.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Device manager setting to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          deviceManager: e.target.checked,
                        })
                      }
                      name="deviceManager"
                      checked={upcomingServiceProcessData.deviceManager}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Computer hardware setting */}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                4. Computer hardware settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                {/* <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Device manager setting to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Yes</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          deviceManager: e.target.checked,
                        })
                      }
                      name="deviceManager"
                      checked={upcomingServiceProcessData.deviceManager}
                    />
                    <Typography variant="caption">No</Typography>
                  </Box>
                </Grid> */}
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    HDD performance to be check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          hddPerformance: e.target.checked,
                        })
                      }
                      name="hddPerformance"
                      checked={upcomingServiceProcessData.hddPerformance}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    System driver status to be check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          systemDrivers: e.target.checked,
                        })
                      }
                      name="systemDrivers"
                      checked={upcomingServiceProcessData.systemDrivers}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    C.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Memory speed to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          memorySpeed: e.target.checked,
                        })
                      }
                      name="memorySpeed"
                      checked={upcomingServiceProcessData.memorySpeed}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    D.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Laptop battery status to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          laptopBattery: e.target.checked,
                        })
                      }
                      name="laptopBattery"
                      checked={upcomingServiceProcessData.laptopBattery}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    E.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    {/* Hard disk health check (SMART status) */}
                    Hard disk health check (SMART status)
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.hardDiskHealthCheck}
                    name="hardDiskHealthCheck"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Z Scaler proxy to check */}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                5. Zscaler proxy to be check
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Verify upgraded version & Operation
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.verifyUpgradedVersion}
                    name="verifyUpgradedVersion"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Application status to be check */}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                6. Application status to be check
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Application license status to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          appLicenseStatus: e.target.checked,
                        })
                      }
                      name="appLicenseStatus"
                      checked={upcomingServiceProcessData.appLicenseStatus}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Applications: Ms Teams
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.applications}
                    name="applications"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Crowd strike antivirus activity */}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                7. Crowd strike antivirus activity
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Antivirus status to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          antivirusStatus: e.target.checked,
                        })
                      }
                      name="antivirusStatus"
                      checked={upcomingServiceProcessData.antivirusStatus}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Antivirus policy to be check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          antivirusPolicy: e.target.checked,
                        })
                      }
                      name="antivirusPolicy"
                      checked={upcomingServiceProcessData.antivirusPolicy}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    C.
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    System to be scan and log to be check
                  </Typography>
                </Grid>

                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          systemScan: e.target.checked,
                        })
                      }
                      name="antivirusPolicy"
                      checked={upcomingServiceProcessData.systemScan}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Patch*/}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                8. Patch
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Verify system is updated with recent<br></br> WSUS patches
                    release
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.wsusPatches}
                    name="wsusPatches"
                  />
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Intune application status to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          intuneAppStatus: e.target.checked,
                        })
                      }
                      name="intuneAppStatus"
                      checked={upcomingServiceProcessData.intuneAppStatus}
                    />

                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Clearance*/}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                9. Clearance
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 1 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Unwanted application to be removed
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.unwantedApps}
                    name="unwantedApps"
                  />
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    B.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Temp/prefetch/recycle bin/caches<br></br> file to be delete
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.tempFiles}
                    name="tempFiles"
                  />
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    C.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Startup to be configure
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.startupConfig}
                    name="startupConfig"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Bitlocker*/}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                10. Bitlocker
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Bitlocker enable check and recovery<br></br> key check
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.bitlockerCheck}
                    name="bitlockerCheck"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Backup*/}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                11. Backup
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 1 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Backup solution installed and configured
                  </Typography>
                </Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    sx={textFieldStylesWhiteBg}
                    onChange={handleChange}
                    value={upcomingServiceProcessData?.backupSolution}
                    name="backupSolution"
                  />
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        {/**Peripheral devices*/}
        <Box mt={2}>
          <Accordion
            elevation={3}
            sx={{ background: "#EEEFF3", border: "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography fontWeight={"600"} component="span">
                12. Peripheral devices
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: "#FFE3E1" }}>
              <Grid container>
                <Grid size={{ md: 1, sm: 1 }}></Grid>
                <Grid size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Item
                  </Typography>
                </Grid>

                <Grid size={{ md: 2, sm: 2 }}>
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Status
                  </Typography>
                </Grid>

                <Grid
                  sx={{
                    textAlign: "center",
                  }}
                  size={{ md: 5, sm: 5 }}
                >
                  <Typography sx={{ fontWeight: "600" }} variant="body1">
                    Remarks
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
            <Box p={2}>
              <Grid container rowGap={2}>
                <Grid sx={{ alignContent: "center" }} size={{ md: 1, sm: 1 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    A.
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 4, sm: 4 }}>
                  <Typography sx={{ color: "#5F728D" }} variant="body2">
                    Mouse and keyboard status to be check
                  </Typography>
                </Grid>
                <Grid sx={{ alignContent: "center" }} size={{ md: 7, sm: 7 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">No</Typography>
                    <AntSwitch
                      onChange={(e) =>
                        setUpcomingServiceProcessData({
                          ...upcomingServiceProcessData,
                          mouseKeyboard: e.target.checked,
                        })
                      }
                      name="mouseKeyboard"
                      checked={upcomingServiceProcessData.mouseKeyboard}
                    />
                    <Typography variant="caption">Yes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Accordion>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }} mt={2}>
          <Button className="Global-Button3">Cancel</Button>
          <Button
            onClick={handleSaveAssetDetails}
            sx={{ marginLeft: "1rem" }}
            className="Global-Button2"
          >
            Save All
          </Button>
        </Box>
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
      </Box>
    </div>
  );
};
export default UpcomingServiceProcessDetails;
