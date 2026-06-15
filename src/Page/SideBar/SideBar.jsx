
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
} from "@mui/material";
import ArrowIcon from "../../assets/Sidebarimages/Vector22.png";
import { useNavigate } from "react-router-dom";

// Icons
import logo from "../../assets/Sidebarimages/Layer 1 1.jpeg";
import dashboardIcon from "../../assets/Sidebarimages/Vector (8).png";
import dashboardIcon1 from "../../assets/Sidebarimages/Vector (15).png";
import setupIcon from "../../assets/Sidebarimages/Group@3x.png";
import softwareIcon from "../../assets/Sidebarimages/software.png"
import setupIcon1 from "../../assets/Sidebarimages/Group.png";
import employeeIcon from "../../assets/Sidebarimages/Vector (9).png";
import grEntryIcon from "../../assets/Sidebarimages/Group (1).png";
import serviceIcon from "../../assets/Sidebarimages/Group (1).png";
import assetIcon from "../../assets/Sidebarimages/Vector (10).png";
import statusIcon from "../../assets/Sidebarimages/Vector (12).png";
import transferIcon from "../../assets/Sidebarimages/Vector (12).png";
import ticketIcon from "../../assets/Sidebarimages/Vector (13).png";
import reportIcon from "../../assets/Sidebarimages/Vector (14).png";
import QrIcon from "../../assets/Sidebarimages/qr1.png";
import QrIcon1 from "../../assets/Sidebarimages/qr2.png";
import InstallIcon from "../../assets/Sidebarimages/easy-installation (1).png";
import RequestIcon from "../../assets/Sidebarimages/speaking.png";

// Import the middleware
import AccessMiddleware from "../AccessMiddleware";

const Sidebar = ({
  selectedItem,
  setSelectedItem,
  openSection,
  setOpenSection,
}) => {
  const navigate = useNavigate();
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    try {
      const accessObj = JSON.parse(localStorage.getItem("myAccess") || "{}");
      const permissions = accessObj?.data?.slugs || [];
      setUserPermissions(permissions);
    } catch (err) {
      console.error("Failed to parse user permissions", err);
    }
  }, []);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleSelect = (label) => {
    setSelectedItem(label);
  };

  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  const renderItem = (
    label,
    icon,
    inactiveIcon,
    toggleKey,
    hasChildren = false,
    path = null,
    requiredPermission = null
  ) => {
    // Check permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return null;
    }

    const isSelected = selectedItem === label;
    const getIcon = () => {
      if (label === "Dashboard")
        return isSelected ? dashboardIcon : dashboardIcon1;
      if (label === "Setup") return isSelected ? setupIcon1 : setupIcon;
      if (label === "QR") return isSelected ? QrIcon1 : QrIcon;
      return icon;
    };

    return (
      <ListItemButton
        onClick={() => {
          handleSelect(label);
          if (hasChildren) {
            toggleSection(toggleKey);
          }
          if (path) {
            navigate(path);
          }
        }}
        sx={{
          backgroundColor: isSelected ? "#0000ff" : "transparent",
          borderRadius: "8px",
          mx: 1,
          my: 0.5,
          pl: 2,
          minHeight: 44,
          "&:hover": {
            backgroundColor: "#0000ff",
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <img src={getIcon()} alt={label} style={{ width: 13, height: 13 }} />
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            style: {
              color: isSelected ? "#ffffff" : "#ffffff",
              fontWeight: 600,
              fontSize: "0.9rem",
            },
          }}
        />
        {hasChildren && (
          <Box
            component="img"
            src={ArrowIcon}
            alt="arrow"
            sx={{
              ml: 1,
              filter: isSelected ? "brightness(0) invert(1)" : "none",
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const renderSubItemList = (items) => (
    <Box
      sx={{
        borderLeft: "2px solid #0000ff",
        ml: 3.8,
        pl: 1,
        overflowX: "auto",
        gap: 1,
        py: 1,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {items.map((item) => {
        const label = typeof item === "string" ? item : item.label;
        const path = typeof item === "string" ? null : item.path;
        const requiredPermission = typeof item === "string" ? null : item.requiredPermission;
        const isSelected = selectedItem === label;

        // Check permission for sub-item
        if (requiredPermission && !hasPermission(requiredPermission)) {
          return null;
        }

        return (
          <ListItemButton
            key={label}
            onClick={() => {
              handleSelect(label);
              if (path) navigate(path);
            }}
            sx={{
              borderRadius: "8px",
              px: 1,
              minHeight: 36,
              whiteSpace: "nowrap",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "#0000ff",
              },
            }}
          >
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                style: {
                  color: isSelected ? "#f2f1f7" : "#f2f1f7",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                },
              }}
            />
          </ListItemButton>
        );
      })}
    </Box>
  );

  const SectionHeader = ({ title, requiredPermission = null }) => {
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return null;
    }

    return (
      <Typography
        pl={2}
        pt={2}
        pb={0.5}
        variant="caption"
        sx={{
          color: "#f2f1f7", // modern slate blue/gray
          fontWeight: "700",
          letterSpacing: "0.08em",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          display: "block",
        }}
      >
        {title}
      </Typography>
    );
  };

  const handleClick = () => {
    navigate("/")
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 250,
          boxSizing: "border-box",
          backgroundColor: "#07001d",
          padding: "10px 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box px={2} pb={1.5} pt={0.5}>
        <Box
          onClick={handleClick}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
            },
            cursor: "pointer",
          }}
        >
          <img src={logo} alt="Logo" style={{ maxHeight: "35px", maxWidth: "90%" }} />
        </Box>
      </Box>


      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <List>
          {/* Dashboard */}
          {hasPermission("access-module") && (
            <>
              <SectionHeader title="DASHBOARD" requiredPermission="access-module" />
              {renderItem(
                "Dashboard",
                dashboardIcon,
                dashboardIcon1,
                "dashboard",
                false,
                "/dashboard",
                "access-module"
              )}
            </>
          )}

          {/* ACL */}
          {hasPermission("read-roles") || hasPermission("read-permissions") ? (
            <>
              {renderItem("ACL", reportIcon, null, "acl", true, null, "read-roles")}
              <Collapse in={openSection === "acl"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Role List",
                    path: "/role-list",
                    requiredPermission: "read-roles"
                  },
                  {
                    label: "Permission List",
                    path: "/permission-list",
                    requiredPermission: "read-permissions"
                  }
                ])}
              </Collapse>
            </>
          ) : null}

          {/* Setup */}
          {hasPermission("read-units") || hasPermission("read-locations") ||
            hasPermission("read-brands") || hasPermission("read-vendors") ||
            hasPermission("read-departments") || hasPermission("read-categories") ||
            hasPermission("read-subcategories") || hasPermission("read-product") ? (
            <>
              <SectionHeader title="MASTER SETUP" />
              {renderItem("Setup", setupIcon, setupIcon1, "setup", true, null)}
              <Collapse in={openSection === "setup"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Business Unit",
                    path: "/setup/unit",
                    requiredPermission: "read-units"
                  },
                  {
                    label: "Location",
                    path: "/setup/loaction/list-loaction",
                    requiredPermission: "read-locations"
                  },
                  {
                    label: "CustomField",
                    path: "/setup/customfield/customfieldList",
                    requiredPermission: "read-spec-fields"
                  },
                  {
                    label: "Brand",
                    path: "/setup/brand/brandlist",
                    requiredPermission: "read-brands"
                  },
                  {
                    label: "Vendor",
                    path: "/setup/vendor/vendorlist",
                    requiredPermission: "read-vendors"
                  },
                  {
                    label: "Department",
                    path: "/setup/department/departmentlist",
                    requiredPermission: "read-departments"
                  },
                  {
                    label: "Category",
                    path: "/setup/category/categorylist",
                    requiredPermission: "read-categories"
                  },
                  {
                    label: "Asset Reference",
                    path: "/setup/product/productlist",
                    requiredPermission: "read-product"
                  },
                  // { 
                  //   label: "Email", 
                  //   path: "/setup/list-email", 
                  //   requiredPermission: "read-mail-configuration" 
                  // },
                ])}
              </Collapse>
            </>
          ) : null}

          {/* Software */}
          {hasPermission("software-module") && (
            <>
              <SectionHeader title="MASTER SOFTWARE" requiredPermission="software-module" />
              {renderItem("Software", softwareIcon, softwareIcon, "software", true, null, "software-module")}
              <Collapse in={openSection === "software"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Software",
                    path: "/software-list",
                    requiredPermission: "read-software"
                  },
                  {
                    label: "Software Assign",
                    path: "/software/software-assign",
                    requiredPermission: "create-software"
                  },
                  {
                    label: "Software Log",
                    path: "/software/software-log",
                    requiredPermission: "read-software"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* Employee */}
          {hasPermission("read-users") && (
            <>
              <SectionHeader title="EMPLOYEE" requiredPermission="read-users" />
              {renderItem("Employee", employeeIcon, null, "employee", true, null, "read-users")}
              <Collapse in={openSection === "employee"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Employee",
                    path: "/employee/activeemp",
                    requiredPermission: "read-users"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* QR */}
          {hasPermission("read-qr") && (
            <>
              <SectionHeader title="QR" requiredPermission="read-qr" />
              {renderItem("QR", QrIcon, null, "qr", true, null, "read-qr")}
              <Collapse in={openSection === "qr"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "QR List",
                    path: "/qrlist",
                    requiredPermission: "read-qr"
                  }
                ])}
              </Collapse>
            </>
          )}

          {/* GR/Inventory */}
          {hasPermission("gr-module") && (
            <>
              <SectionHeader title="INVENTORY" requiredPermission="gr-module" />
              {renderItem("GR", grEntryIcon, null, "gr", true, null, "gr-module")}
              <Collapse in={openSection === "gr"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Create Gr",
                    path: "/grentry/creategr",
                    requiredPermission: "create-gr"
                  },
                  {
                    label: "List Gr",
                    path: "/grentry/listgr",
                    requiredPermission: "read-gr"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* Allocation */}
          {hasPermission("unassign-asset") && (
            <>
              {renderItem("Allocation", assetIcon, null, "management", true, null, "unassign-asset")}
              <Collapse in={openSection === "management"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Assign Asset",
                    path: "/assetmanagement/assignasset",
                    requiredPermission: "create-asset"
                  },
                  {
                    label: "Assign List",
                    path: "/assetmanagement/assignlist",
                    requiredPermission: "read-asset"
                  },
                  {
                    label: "Unassign Asset",
                    path: "/assetmanagement/unassignasset",
                    requiredPermission: "unassign-asset"
                  },
                  {
                    label: "Handover",
                    path: "/assetmanagement/listhandhover",
                    requiredPermission: "update-asset"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* Service */}
          {hasPermission("read-services") && (
            <>
              {renderItem("Service", serviceIcon, null, "service", true, null, "read-services")}
              <Collapse in={openSection === "service"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Upcoming Service Process",
                    path: "/asset-service/upcoming-service-process/asset-maintainance-checklist",
                    requiredPermission: "read-services"
                  },
                  {
                    label: "Pending Asset service",
                    path: "/asset-service/pending-service",
                    requiredPermission: "read-services"
                  },
                  {
                    label: "Completed Service Process",
                    path: "/asset-service/complete-service",
                    requiredPermission: "read-services"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* Stock */}
          {hasPermission("read-inventory") && (
            <>
              {renderItem("Stock", statusIcon, null, "status", true, null, "read-inventory")}
              <Collapse in={openSection === "status"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "All Asset",
                    path: "/assetstatus/all-asset",
                    requiredPermission: "read-inventory"
                  },
                  {
                    label: "Write-Off",
                    path: "/assetstatus/write-off",
                    requiredPermission: "create-e-waste"
                  },
                  ...(hasPermission("old-data-sync-module") ? [
                    {
                      label: "Bulk Upload",
                      path: "/assetstatus/bulk-upload",
                      requiredPermission: "create-inventory"
                    }
                  ] : []),
                ])}
              </Collapse>
            </>
          )}

          {/* Transfer */}
          {hasPermission("read-transfer") && (
            <>
              {renderItem("Transfer", transferIcon, null, "transfer", true, null, "read-transfer")}
              <Collapse in={openSection === "transfer"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Initiate asset Transfer",
                    path: "/transfer/initiate-transfer",
                    requiredPermission: "create-transfer"
                  },
                  {
                    label: "Transfer Asset List",
                    path: "/transfer/transfer-list",
                    requiredPermission: "read-transfer"
                  },
                ])}
              </Collapse>
            </>
          )}

          {/* Request */}
          {hasPermission("read-productrequest") && (
            <>
              {renderItem("Request", RequestIcon, null, "request", true, null, "read-productrequest")}
              <Collapse in={openSection === "request"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Initiate",
                    path: "/request/initiate",
                    requiredPermission: "create-productrequest"
                  },
                  ...(hasPermission("update-productrequest") ? [
                    {
                      label: "Approve",
                      path: "/request/approve",
                      requiredPermission: "update-productrequest"
                    }
                  ] : []),
                  ...(hasPermission("create-e-waste") ? [
                    {
                      label: "Write-Off Request",
                      path: "/request/write-off-request",
                      requiredPermission: "create-e-waste"
                    }
                  ] : []),
                ])}
              </Collapse>
            </>
          )}

          {/* Ticketing */}
          {hasPermission("tickets") && (
            <>
              <SectionHeader title="TICKET" requiredPermission="tickets" />
              {renderItem("Ticketing", ticketIcon, null, "ticket", true, null, "tickets")}
              <Collapse in={openSection === "ticket"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  ...(hasPermission("ticket-master")
                    ? [
                      {
                        label: "Category",
                        path: "/ticketservice/category",
                        requiredPermission: "ticket-master",
                      },
                      {
                        label: "SubCategory",
                        path: "/ticketservice/subcategory",
                        requiredPermission: "ticket-master",
                      },
                    ]
                    : []),
                  ...(hasPermission("tickets-lists")
                    ? [
                      {
                        label: "Tickets",
                        path: "/ticketservice/ticketlist",
                        requiredPermission: "tickets-lists",
                      },
                    ]
                    : []),
                  ...(hasPermission("ticket-service")
                    ? [
                      {
                        label: "Unassigned Tickets",
                        path: "/ticketservice/ticketlist/unassigned-tickets",
                        requiredPermission: "ticket-service",
                      },
                      {
                        label: "Service Check",
                        path: "/ticketservice/ticketlist/service-check",
                        requiredPermission: "ticket-service",
                      },
                    ]
                    : []),
                ])}
              </Collapse>
            </>
          )}

          {/* Reports */}
          {hasPermission("read-report") && (
            <>
              <SectionHeader title="REPORTS" requiredPermission="read-report" />
              {renderItem("Asset", reportIcon, null, "assetReports", true, null, "read-report")}
              <Collapse in={openSection === "assetReports"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "Available Assets",
                    path: "/reports/available-assets",
                    requiredPermission: "read-report"
                  },
                  {
                    label: "Asset Service check",
                    path: "/reports/asset-service",
                    requiredPermission: "read-report"
                  },
                  {
                    label: "Asset Allocation",
                    path: "/reports/asset-allocation",
                    requiredPermission: "read-report"
                  },
                  {
                    label: "Asset Location",
                    path: "/reports/asset-location",
                    requiredPermission: "read-report"
                  },
                  {
                    label: "Asset Aging",
                    path: "/reports/asset-aging",
                    requiredPermission: "read-report"
                  },
                  ...(hasPermission("read-soft-delete") ? [
                    {
                      label: "Soft Report",
                      path: "/reports/soft-report",
                      requiredPermission: "read-soft-delete"
                    }
                  ] : []),
                ])}
              </Collapse>
            </>
          )}

          {/* Ticket Reports */}
          {hasPermission("ticket-reports") && (
            <>
              {renderItem("Ticket", reportIcon, null, "serviceReports", true, null, "ticket-reports")}
              <Collapse in={openSection === "serviceReports"} timeout="auto" unmountOnExit>
                {renderSubItemList([
                  {
                    label: "List of Tickets with filters",
                    path: "/ticket-report",
                    requiredPermission: "ticket-reports"
                  }
                ])}
              </Collapse>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;