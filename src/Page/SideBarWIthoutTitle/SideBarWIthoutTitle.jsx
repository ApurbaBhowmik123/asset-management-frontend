import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
} from "@mui/material";
import ArrowIcon from "../../assets/Sidebarimages/Vector22.png";
import { useNavigate } from "react-router-dom";

// Icons
import logo from "../../assets/Sidebarimages/Layer 1 1.jpeg";
import dashboardIcon from "../../assets/Sidebarimages/Vector (8).png";
import dashboardIcon1 from "../../assets/Sidebarimages/Vector (15).png";
import setupIcon from "../../assets/Sidebarimages/Group@3x.png";
import softwareIcon from "../../assets/Sidebarimages/software.png"
import employeeIcon from "../../assets/Sidebarimages/Vector (9).png";
import grEntryIcon from "../../assets/Sidebarimages/Group (1).png";
import serviceIcon from "../../assets/Sidebarimages/Group (1).png";
import assetIcon from "../../assets/Sidebarimages/Vector (10).png";
import statusIcon from "../../assets/Sidebarimages/Vector (12).png";
import transferIcon from "../../assets/Sidebarimages/Vector (12).png";
import ticketIcon from "../../assets/Sidebarimages/Vector (13).png";
import reportIcon from "../../assets/Sidebarimages/Vector (14).png";
import InstallIcon from "../../assets/Sidebarimages/easy-installation (1).png";
import RequestIcon from "../../assets/Sidebarimages/speaking.png";

// Hover icons
import setupIcon1 from "../../assets/SideImages/setup.png"; // Setup hover icon
import employeeIcon1 from "../../assets/SideImages/employees.png";
import grEntryIcon1 from "../../assets/SideImages/GR.png";
import serviceIcon1 from "../../assets/SideImages/GR.png";
import assetIcon1 from "../../assets/SideImages/asset management.png";
import statusIcon1 from "../../assets/SideImages/asset status.png";
import transferIcon1 from "../../assets/SideImages/asset status.png";
import ticketIcon1 from "../../assets/SideImages/ticketing service.png";
import reportIcon1 from "../../assets/SideImages/service report.png";
import QrIcon from "../../assets/Sidebarimages/qr1.png";
import QrIcon1 from "../../assets/Sidebarimages/qr2.png";

const SideBarWithoutTitle = ({
  onItemClick,
  selectedItem,
  setSelectedItem,
  openSection,
  setOpenSection,
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
    if (openSection !== section) {
      setExpanded(true);
    }
  };

  const handleSelect = (label, hasChildren = false) => {
    setSelectedItem(label);
    // Only call onItemClick (which expands sidebar) for items with children
    // For direct navigation items, don't expand the sidebar
    if (hasChildren) {
      onItemClick();
    }
  };

  const renderItem = (
    label,
    icon,
    hoverIcon,
    toggleKey,
    hasChildren = false,
    path = null
  ) => {
    const isSelected = selectedItem === label;
    const isExpanded = openSection === toggleKey;
    const isHovered = hoveredItem === label;

    const getIcon = () => {
      if (label === "Dashboard") {
        return isSelected || isHovered ? dashboardIcon : dashboardIcon1;
      }
      if (label === "Setup") {
        return isSelected || isHovered ? setupIcon1 : setupIcon;
      }
      if (label === "Software") {
        return isSelected || isHovered ? softwareIcon : softwareIcon;
      }
      if (label === "Employees") {
        return isSelected || isHovered ? employeeIcon1 : employeeIcon;
      }
      if (label === "GR ") {
        return isSelected || isHovered ? grEntryIcon1 : grEntryIcon;
      }
      // if (label === "Quality Check ") {
      //   return isSelected || isHovered ? InstallIcon : InstallIcon;
      // }
      if (label === "Asset Service") {
        return isSelected || isHovered ? serviceIcon1 : serviceIcon;
      }
      if (label === "Asset Management") {
        return isSelected || isHovered ? assetIcon1 : assetIcon;
      }
      if (label === "Asset Status") {
        return isSelected || isHovered ? statusIcon1 : statusIcon;
      }
      if (label === "Asset Transfer") {
        return isSelected || isHovered ? transferIcon1 : transferIcon;
      }
      if (label === "Request") {
        return isSelected || isHovered ? RequestIcon : RequestIcon;
      }
      if (label === "Ticketing Services") {
        return isSelected || isHovered ? ticketIcon1 : ticketIcon;
      }
      if (label === "Asset Reports") {
        return isSelected || isHovered ? reportIcon1 : reportIcon;
      }
      if (label === "Service Report") {
        return isSelected || isHovered ? reportIcon1 : reportIcon;
      }
      return icon;
    };

    return (
      <Box key={label}>
        <Tooltip title={label} placement="right" arrow>
          <ListItemButton
            onClick={() => {
              setSelectedItem(label); // Set selected item using prop function
              if (hasChildren) {
                if (expanded) {
                  // If sidebar is already expanded, just toggle the section
                  toggleSection(toggleKey);
                } else {
                  // If sidebar is collapsed, expand it and set the section
                  toggleSection(toggleKey);
                  onItemClick(); // Expand sidebar for items with children
                }
              } else if (path) {
                // For items without children but with path (like Dashboard)
                navigate(path); // Navigate to the path
                onItemClick(); // Expand sidebar to show the selection properly
              }
            }}
            onMouseEnter={() => setHoveredItem(label)}
            onMouseLeave={() => setHoveredItem(null)}
            sx={{
              backgroundColor: isSelected ? "#DB3027" : "transparent",
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
              pl: expanded ? 2 : 1,
              minHeight: 44,
              "&:hover": {
                backgroundColor: "#DB3027",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <img
                src={getIcon()}
                alt={label}
                style={{ width: 13, height: 13 }}
              />
            </ListItemIcon>
            {expanded && (
              <>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    style: {
                      color: isSelected ? "#fff" : "#5F728D",
                      fontSize: "0.8rem",
                      marginLeft: "8px",
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
                      transform: isExpanded ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {hasChildren && expanded && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {renderSubItemList(
              [
                { label: "Unit", path: "/setup/unit" },
                { label: "Brand", path: "/setup/brand/brandlist" },
                { label: "Vendor", path: "/setup/vendor/vendorlist" },
                "Department",
                "Category",
                "Product",
                "Import Bulk Products",
              ],
              toggleKey
            )}
          </Collapse>
        )}
      </Box>
    );
  };

  const renderSubItemList = (items, parentKey) => {
    return (
      <Box
        sx={{
          borderLeft: "2px solid #FFF0EF",
          ml: 3.8,
          pl: 1,
          overflowX: "auto",
          gap: 1,
          py: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item, index) => {
          const label = typeof item === "string" ? item : item.label;
          const path = typeof item === "string" ? null : item.path;
          const isSelected = selectedItem === label;
          const itemKey = `${parentKey}-${index}`;

          return (
            <ListItemButton
              key={itemKey}
              onClick={() => {
                setSelectedItem(label); // Use prop function
                if (path) navigate(path);
              }}
              sx={{
                borderRadius: "8px",
                px: 2,
                minHeight: 36,
                whiteSpace: "nowrap",
                backgroundColor: isSelected ? "#FFF0EF" : "transparent",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  style: {
                    color: isSelected ? "#DB3027" : "#5F728D",
                    fontSize: "0.8rem",
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: expanded ? 250 : 70,
        flexShrink: 0,
        transition: "width 0.3s ease",
        [`& .MuiDrawer-paper`]: {
          width: expanded ? 250 : 70,
          boxSizing: "border-box",
          backgroundColor: "#fff",
          padding: "10px 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box px={expanded ? 2 : 1} pb={1.5} pt={0.5}>
        <Box
          onClick={() => navigate("/")}
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
          <img
            src={logo}
            alt="Logo"
            style={{
              maxHeight: "35px",
              maxWidth: expanded ? "90%" : "80%",
              transition: "max-width 0.3s ease"
            }}
          />
        </Box>
      </Box>


      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <List>
          {renderItem(
            "Dashboard",
            dashboardIcon,
            dashboardIcon1,
            "dashboard",
            false,
            "/dashboard"
          )}
          {renderItem("Setup", setupIcon, setupIcon1, "setup", true)}
          {renderItem("Software", softwareIcon, softwareIcon, "software", true)}
          {renderItem(
            "Employees",
            employeeIcon,
            employeeIcon1,
            "employee",
            true
          )}
          {renderItem("QR", QrIcon, QrIcon1, "qr", true)}
          {renderItem("GR", grEntryIcon, grEntryIcon1, "gr", true)}
          {renderItem("Quality Check", InstallIcon, InstallIcon, "installation", true)}
          {renderItem(
            "Allocation",
            assetIcon,
            assetIcon1,
            "management",
            true
          )}
          {renderItem(
            " Service",
            serviceIcon,
            serviceIcon1,
            "service",
            true
          )}

          {renderItem("Stock", statusIcon, statusIcon1, "status", true)}
          {renderItem(
            "Transfer",
            transferIcon,
            transferIcon1,
            "transfer",
            true
          )}
          {renderItem(
            "Request",
            RequestIcon,
            RequestIcon,
            "transfer",
            true
          )}
          {renderItem(
            "Ticketing",
            ticketIcon,
            ticketIcon1,
            "ticket",
            true
          )}
          {renderItem(
            "Asset",
            reportIcon,
            reportIcon1,
            "assetReports",
            true
          )}
          {renderItem(
            "Ticket",
            reportIcon,
            reportIcon1,
            "serviceReports",
            true
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideBarWithoutTitle;
