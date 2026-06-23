import React, { useState, useEffect } from "react";
import Avatar1 from "../../assets/NavbarImages/Ellipse 1.png";
import { Bell, Menu, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { baseUrl } from "../Api";

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  useEffect(() => {

    try {
      const userData = JSON.parse(localStorage.getItem("profile"));
      if (userData?.data?.role) {
        setUserRole(userData.data.role);
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
    }
  }, []);
  const routeTitles = {
    "/": "Dashboard",
    "/setup/unit": "Setup",
    "/setup/loaction/list-loaction": "Setup",
    "/setup/customfield/customfieldList": "Setup",
    "/setup/brand/brandlist": "Setup",
    "/setup/vendor/vendorlist": "Setup",
    "/setup/category/categorylist": "Setup",
    "/setup/subcategory/sublist": "Setup",
    "/setup/product/productlist": "Setup",
    "/setup/department/departmentlist": "Setup",
    "/software-list": "Software",
    "/software/software-assign": "Software",
    "/software/software-log": "Software",
    "/grentry/creategr": "Gr Entry",
    "/grentry/listgr": "Gr Entry",
    "/grentry/listgr/qr/:id": "Gr Entry",
    "/grentry/listgr/viewgr/:id": "Gr Entry",
    "/grentry/bulk-import": "Gr Entry",
    "/grentry/installation": "Installation",
    "/grentry/installation-list": "Installation",
    "/qrlist": "QR Code",
    "/employee/activeemp": "Employee",
    "/assetmanagement/assignasset": "Asset Management",
    "/assetmanagement/assignlist": "Asset Management",
    "/assetmanagement/assigndetails/:id": "Asset Management",
    "/assetmanagement/unassignasset": "Asset Management",
    "/assetmanagement/handover/:id": "Asset Management",
    "/assetmanagement/listhandhover": "Asset Management",
    "/asset-service/upcoming-service-process/asset-maintainance-checklist":
      "Service",
    "/asset-service/upcoming-service-process/asset-maintainance-checklist-details/:id":
      "Service",
    "/asset-service/pending-service": "Service",
    "/asset-service/complete-service": "Service",
    "/completed-service-process/details/:id": "Service",
    "/assetstatus/all-asset": "Asset Status",
    "/assetstatus/in-stock": "Asset Status",
    "/assetstatus/assigned-stock": "Asset Status",
    "/assetstatus/blocked-stock": "Asset Status",
    "/assetstatus/awaiting-stock": "Asset Status",
    "/assetstatus/write-off": "Asset Status",
    "/assetstatus/bulk-upload": "Asset Status",
    "/transfer/initiate-transfer": "Transfer",
    "/transfer/transfer-list": "Transfer",
    "/transfer/transfer/:id": "Transfer",
    "/request/initiate": "Request",
    "/request/approve": "Request",
    "/request/write-off-request": "Request",
    // "/ticketservice/ticketlist": "Ticketing",
    "/ticketservice/ticketlist": userRole === "User" ? "Dashboard" : "Ticketing",
    "/ticketservice/category": "Ticketing",
    "/ticketservice/subcategory": "Ticketing",
    "/ticketservice/ticketlist/assign": "Ticketing",
    "/ticketservice/ticketlist/service-check": "Ticketing",
    "/ticketservice/ticketlist/approval": "Ticketing",
    "/ticketservice/ticketlist/review": "Ticketing",
    "/reports/available-assets": "Report",
    "/reports/asset-service": "Report",
    "/reports/asset-allocation": "Report",
    "/reports/asset-location": "Report",
    "/reports/asset-aging": "Report",
    "/reports/soft-report": "Report",
    "/reports/asset-cost": "Report",
    "/reports/total-asset": "Report",
    "/reports/employee-report": "Report",
    "/ticket-report": "Ticket Report",
  };

  const getRouteTitle = (pathname) => {
    for (const route in routeTitles) {
      const match = matchPath({ path: route, end: true }, pathname);
      if (match) return routeTitles[route];
    }
    return "Dashboard";
  };

  const currentTitle = getRouteTitle(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const profile = JSON.parse(localStorage.getItem("profile"))?.data;

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${baseUrl}/ntf/notification/notification-get?page=1&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(res.data.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markNotificationsAsRead = async (ids) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${baseUrl}/ntf/notification/mark-as-read`,
        { ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#100b31",
        color: "#ffffff",
        padding: "6px 24px",
        // borderBottom: "1px solid #f1f1f1",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ffffff" }}
            onClick={toggleSidebar}
          >
            <Menu size={18} />
          </button>
          <span style={{ fontWeight: 600, fontSize: "16px" }}>
            {currentTitle}
          </span>
        </div>

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
          }}
        >
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => {


                setShowNotifications((prev) => !prev);
                setShowProfile(false);
              }}
            >
              <Bell size={18} color="#ffde24" />
              {notifications.length > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    fontSize: "10px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.length}
                </div>
              )
                :
                <div
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#f4e808",
                    fontSize: "6px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.length}
                </div>
              }
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  marginTop: "8px",
                  width: "280px",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Notifications
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {loading ? (
                    <p style={{ padding: "12px" }}>Loading...</p>
                  ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div

                        key={n.id}
                        onClick={() => {
                          const url = n.transactionLink || "";
                          const relativePath = url.replace(
                            /^https?:\/\/[^/]+/,
                            ""
                          );
                          if (!n.isRead) {
                            markNotificationsAsRead([n.id]);
                          }

                          navigate(relativePath);
                        }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f3f4f6",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "transparent")
                        }
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#111827",
                          }}
                        >
                          {n.text}
                        </p>
                        <span style={{ fontSize: "12px", color: "#ffffff" }}>
                          {new Date(n.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: "12px" }}>No notifications</p>
                  )}
                </div>

                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    className="Global-Button10"
                    onClick={() => {
                      navigate("/notifications");
                      setShowNotifications(false);
                    }}
                  >
                    Show More
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              width: "40px",
              height: "2px",
              background: "#f5f5ef",
              transform: "rotate(90deg)",
            }}
          />

          {/* Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowProfile((prev) => !prev);
              setShowNotifications(false);
            }}
          >
            {/* <img
              src={Avatar1}
              alt="Profile"
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            /> */}
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                {profile?.name || "Unknown"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                {profile?.role || "No Role"}
              </p>
            </div>
            {showProfile ? (
              <ChevronUp size={18} color="#6b7280" />
            ) : (
              <ChevronDown size={18} color="#6b7280" />
            )}
          </div>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "0",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                marginTop: "6px",
                minWidth: "120px",
                padding: "4px",
                zIndex: 9999,
              }}
            >
              <Button
                startIcon={<LogoutIcon />}
                fullWidth
                onClick={handleLogout}
                sx={{
                  justifyContent: "flex-start",
                  fontSize: "14px",
                  textTransform: "none",
                  color: "#333",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
