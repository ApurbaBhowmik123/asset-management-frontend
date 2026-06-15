import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import pdfIcon from "../../../assets/Service/pdf.png";
import logo from "../../../assets/Sidebarimages/Layer 1 1.jpeg";
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

// const PdfTemplate = ({ data }) => {
//   console.log("dataaaa", data)

//   // Get the last 4 services sorted by date (most recent first)
//   const sortedServices =
//     data?.services
//       ?.sort((a, b) => {
//         const dateA = new Date(a.createdAt || a.updatedAt);
//         const dateB = new Date(b.createdAt || b.updatedAt);
//         return dateB - dateA;
//       })
//       .slice(0, 4) || [];

//   // Assign services to quarters (Q4 = most recent, Q1 = oldest of the 4)
//   const quarterServices = {
//     Q1: sortedServices[3] || null, // Oldest
//     Q2: sortedServices[2] || null,
//     Q3: sortedServices[1] || null,
//     Q4: sortedServices[0] || null, // Most recent
//   };


//   const renderCheck = (value) => {
//     return value ? "✓" : "✗";
//   };

//   const getServiceValue = (quarter, field) => {
//     const service = quarterServices[quarter];
//     if (!service) return "";

//     if (typeof service[field] === "boolean") {
//       return renderCheck(service[field]);
//     }
//     return service[field] || "NA";
//   };

//   return (
//     <div className="pdf-container">
//       <div className="header">
//         <div className="title">PREVENTIVE MAINTENANCE CHECKLIST SHEET</div>
//         <div className="logo-right">
//           <img src={logo} alt="Logo" />
//         </div>
//       </div>

//       <table className="table system-info">
//         <tbody>
//           <tr>
//             <td style={{ fontWeight: "bold" }}>Title</td>
//             <td colSpan="5" style={{ fontWeight: "bold" }}>
//               System Details
//             </td>
//           </tr>
//           <tr>
//             <td>User Name</td>
//             <td>
//               <span>{data?.assignedUserName || "NA"}</span>
//             </td>
//             <td>Asset Type</td>
//             <td>
//               <span>
//                 {data?.grInventoryProduct?.product?.category?.name || "NA"}
//               </span>
//             </td>
//             <td>OS</td>
//             <td>
//               <span>
//                 {data?.softwareInstalls?.find((s) => s.softwares?.name === "OS")
//                   ?.value || "NA"}
//               </span>
//             </td>
//           </tr>
//           <tr>
//             <td>Dept.</td>
//             <td>
//               <span>{data?.department || "NA"}</span>
//             </td>
//             <td>Host name</td>
//             <td>
//               <span>
//                 {data?.softwareInstalls?.find(
//                   (s) => s.softwares?.name === "Host Name"
//                 )?.value || "NA"}
//               </span>
//             </td>
//             <td>USB Status</td>
//             <td style={{ textAlign: "center", fontWeight: "bold" }}>
//               {data?.usbStatus === "Disabled" ? "Blocked" : "Enabled"}
//             </td>
//           </tr>
//           <tr>
//             <td>Model No</td>
//             <td>
//               <span>{data?.inventoryProductDetail?.grInventoryProduct?.product?.name || "NA"}</span>
//             </td>
//             <td>Processor</td>
//             <td>
//               <span>
//                 {data?.specValues?.find(
//                   (s) => s.specField?.name === "Processor"
//                 )?.value || "NA"}{" "}
//               </span>
//             </td>
//             <td>AV Ver.</td>
//             <td>
//               <span>
//                 {data?.softwareInstalls?.find((s) => s.softwares?.name === "AV")
//                   ?.value || "NA"}
//               </span>
//             </td>
//           </tr>
//           <tr>
//             <td>Sl. No</td>
//             <td>
//               <span>{data?.serialNo1 || data?.serialNo2 || "NA"}</span>
//             </td>
//             <td>HDD / SSD</td>
//             <td>
//               <span>
//                 {data?.specValues?.find((s) => s.specField?.name === "Memory")
//                   ?.value || "NA"}
//               </span>
//             </td>
//             <td>IP Add</td>
//             <td>
//               <span>
//                 {data?.softwareInstalls?.find(
//                   (s) => s.softwares?.name === "IP Address"
//                 )?.value || "NA"}
//               </span>
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       <table className="table activity-table">
//         <tbody>
//           <tr className="table-header">
//             <td className="sl-col">Sl No</td>
//             <td className="activity-col">Activity</td>
//             <td className="description-col">Description</td>
//             <td className="quarter-col">Q1</td>
//             <td className="quarter-col">Q2</td>
//             <td className="quarter-col">Q3</td>
//             <td className="quarter-col">Q4</td>
//           </tr>
//           <tr>
//             <td>1</td>
//             <td>System Boot</td>
//             <td className="activity-description">
//               Latest Version of OS updated
//             </td>
//             <td>{getServiceValue("Q1", "latestVersionOfOsUpdate")}</td>
//             <td>{getServiceValue("Q2", "latestVersionOfOsUpdate")}</td>
//             <td>{getServiceValue("Q3", "latestVersionOfOsUpdate")}</td>
//             <td>{getServiceValue("Q4", "latestVersionOfOsUpdate")}</td>
//           </tr>
//           <tr>
//             <td>2</td>
//             <td>System Log-in</td>
//             <td className="activity-description">
//               Monitor errors/Login script
//             </td>
//             <td>{getServiceValue("Q1", "monitorCheck")}</td>
//             <td>{getServiceValue("Q2", "monitorCheck")}</td>
//             <td>{getServiceValue("Q3", "monitorCheck")}</td>
//             <td>{getServiceValue("Q4", "monitorCheck")}</td>
//           </tr>
//           <tr>
//             <td rowSpan="5">3</td>
//             <td rowSpan="5">Network setting to be check</td>
//             <td>TCP/IP settings are ok</td>
//             <td>{getServiceValue("Q1", "tcpipCheck")}</td>
//             <td>{getServiceValue("Q2", "tcpipCheck")}</td>
//             <td>{getServiceValue("Q3", "tcpipCheck")}</td>
//             <td>{getServiceValue("Q4", "tcpipCheck")}</td>
//           </tr>
//           <tr>
//             <td>Azure Join & Domain name check</td>
//             <td>{getServiceValue("Q1", "azurejoinandDomainCheck")}</td>
//             <td>{getServiceValue("Q2", "azurejoinandDomainCheck")}</td>
//             <td>{getServiceValue("Q3", "azurejoinandDomainCheck")}</td>
//             <td>{getServiceValue("Q4", "azurejoinandDomainCheck")}</td>
//           </tr>
//           <tr>
//             <td>AD policy status to be check</td>
//             <td>{getServiceValue("Q1", "adPolicyCheck")}</td>
//             <td>{getServiceValue("Q2", "adPolicyCheck")}</td>
//             <td>{getServiceValue("Q3", "adPolicyCheck")}</td>
//             <td>{getServiceValue("Q4", "adPolicyCheck")}</td>
//           </tr>
//           <tr>
//             <td>Zscaler V2.0 & DNS to be check</td>
//             <td>{getServiceValue("Q1", "zscalerandDnsCheck")}</td>
//             <td>{getServiceValue("Q2", "zscalerandDnsCheck")}</td>
//             <td>{getServiceValue("Q3", "zscalerandDnsCheck")}</td>
//             <td>{getServiceValue("Q4", "zscalerandDnsCheck")}</td>
//           </tr>
//           <tr>
//             <td>Device manager settings to be check</td>
//             <td>{getServiceValue("Q1", "deviceManagerCheck")}</td>
//             <td>{getServiceValue("Q2", "deviceManagerCheck")}</td>
//             <td>{getServiceValue("Q3", "deviceManagerCheck")}</td>
//             <td>{getServiceValue("Q4", "deviceManagerCheck")}</td>
//           </tr>

//           <tr>
//             <td rowSpan="5">4</td>
//             <td rowSpan="5">Computer Hardware settings</td>
//             <td>HDD performance to be check</td>
//             <td>{getServiceValue("Q1", "hDDPerformanceCheck")}</td>
//             <td>{getServiceValue("Q2", "hDDPerformanceCheck")}</td>
//             <td>{getServiceValue("Q3", "hDDPerformanceCheck")}</td>
//             <td>{getServiceValue("Q4", "hDDPerformanceCheck")}</td>
//           </tr>
//           <tr>
//             <td>System driver status to be check</td>
//             <td>{getServiceValue("Q1", "systemDriverStatusCheck")}</td>
//             <td>{getServiceValue("Q2", "systemDriverStatusCheck")}</td>
//             <td>{getServiceValue("Q3", "systemDriverStatusCheck")}</td>
//             <td>{getServiceValue("Q4", "systemDriverStatusCheck")}</td>
//           </tr>
//           <tr>
//             <td>Memory speed to be check</td>
//             <td>{getServiceValue("Q1", "memorySpeedCheck")}</td>
//             <td>{getServiceValue("Q2", "memorySpeedCheck")}</td>
//             <td>{getServiceValue("Q3", "memorySpeedCheck")}</td>
//             <td>{getServiceValue("Q4", "memorySpeedCheck")}</td>
//           </tr>
//           <tr>
//             <td>Laptop battery status to be check</td>
//             <td>{getServiceValue("Q1", "laptopBatteryCheck")}</td>
//             <td>{getServiceValue("Q2", "laptopBatteryCheck")}</td>
//             <td>{getServiceValue("Q3", "laptopBatteryCheck")}</td>
//             <td>{getServiceValue("Q4", "laptopBatteryCheck")}</td>
//           </tr>
//           <tr>
//             <td>Hard Disk Health Check</td>
//             <td>{getServiceValue("Q1", "harddiskCheck")}</td>
//             <td>{getServiceValue("Q2", "harddiskCheck")}</td>
//             <td>{getServiceValue("Q3", "harddiskCheck")}</td>
//             <td>{getServiceValue("Q4", "harddiskCheck")}</td>
//           </tr>

//           <tr>
//             <td>5</td>
//             <td>ZscalerProxy to be check</td>
//             <td className="activity-description">
//               Verify updated version & Operation
//             </td>
//             <td>{getServiceValue("Q1", "zscalerProxyVerUpgrade")}</td>
//             <td>{getServiceValue("Q2", "zscalerProxyVerUpgrade")}</td>
//             <td>{getServiceValue("Q3", "zscalerProxyVerUpgrade")}</td>
//             <td>{getServiceValue("Q4", "zscalerProxyVerUpgrade")}</td>
//           </tr>

//           <tr>
//             <td rowSpan="2">6</td>
//             <td rowSpan="2">Application status to be check</td>
//             <td>Application license status to be check</td>
//             <td>{getServiceValue("Q1", "applicationLicenseCheck")}</td>
//             <td>{getServiceValue("Q2", "applicationLicenseCheck")}</td>
//             <td>{getServiceValue("Q3", "applicationLicenseCheck")}</td>
//             <td>{getServiceValue("Q4", "applicationLicenseCheck")}</td>
//           </tr>
//           <tr>
//             <td>Applications: Ms Teams</td>
//             <td>{getServiceValue("Q1", "applicationOffice")}</td>
//             <td>{getServiceValue("Q2", "applicationOffice")}</td>
//             <td>{getServiceValue("Q3", "applicationOffice")}</td>
//             <td>{getServiceValue("Q4", "applicationOffice")}</td>
//           </tr>

//           <tr>
//             <td rowSpan="3">7</td>
//             <td rowSpan="3">Crowd Strike Antivirus activity</td>
//             <td>Antivirus status to be check </td>
//             <td>{getServiceValue("Q1", "antivirusStatusCheck")}</td>
//             <td>{getServiceValue("Q2", "antivirusStatusCheck")}</td>
//             <td>{getServiceValue("Q3", "antivirusStatusCheck")}</td>
//             <td>{getServiceValue("Q4", "antivirusStatusCheck")}</td>
//           </tr>
//           <tr>
//             <td>Antivirus policy to be check </td>
//             <td>{getServiceValue("Q1", "antiVirusPolicyCheck")}</td>
//             <td>{getServiceValue("Q2", "antiVirusPolicyCheck")}</td>
//             <td>{getServiceValue("Q3", "antiVirusPolicyCheck")}</td>
//             <td>{getServiceValue("Q4", "antiVirusPolicyCheck")}</td>
//           </tr>
//           <tr>
//             <td>System to be scan and logs to be check </td>
//             <td>{getServiceValue("Q1", "systemScanAndLogCheck")}</td>
//             <td>{getServiceValue("Q2", "systemScanAndLogCheck")}</td>
//             <td>{getServiceValue("Q3", "systemScanAndLogCheck")}</td>
//             <td>{getServiceValue("Q4", "systemScanAndLogCheck")}</td>
//           </tr>

//           <tr>
//             <td rowSpan="2">8</td>
//             <td rowSpan="2">Patch </td>
//             <td>Verify system is updated with recent WSUS Patches release</td>
//             <td>{getServiceValue("Q1", "wsusPatchRelease")}</td>
//             <td>{getServiceValue("Q2", "wsusPatchRelease")}</td>
//             <td>{getServiceValue("Q3", "wsusPatchRelease")}</td>
//             <td>{getServiceValue("Q4", "wsusPatchRelease")}</td>
//           </tr>
//           <tr>
//             <td>Intune application status to be check </td>
//             <td>{getServiceValue("Q1", "intuneApplicationCheck")}</td>
//             <td>{getServiceValue("Q2", "intuneApplicationCheck")}</td>
//             <td>{getServiceValue("Q3", "intuneApplicationCheck")}</td>
//             <td>{getServiceValue("Q4", "intuneApplicationCheck")}</td>
//           </tr>

//           <tr>
//             <td rowSpan="3">9</td>
//             <td rowSpan="3">Clearance</td>
//             <td>Unwanted application to be removed</td>
//             <td>{getServiceValue("Q1", "unWantedapplicationTobeRemoved")}</td>
//             <td>{getServiceValue("Q2", "unWantedapplicationTobeRemoved")}</td>
//             <td>{getServiceValue("Q3", "unWantedapplicationTobeRemoved")}</td>
//             <td>{getServiceValue("Q4", "unWantedapplicationTobeRemoved")}</td>
//           </tr>
//           <tr>
//             <td>Temp/prefetch/recycle bin/caches file to be delete</td>
//             <td>{getServiceValue("Q1", "tempRefetchPrefetchtobeDeleted")}</td>
//             <td>{getServiceValue("Q2", "tempRefetchPrefetchtobeDeleted")}</td>
//             <td>{getServiceValue("Q3", "tempRefetchPrefetchtobeDeleted")}</td>
//             <td>{getServiceValue("Q4", "tempRefetchPrefetchtobeDeleted")}</td>
//           </tr>
//           <tr>
//             <td>Startup to be configure</td>
//             <td>{getServiceValue("Q1", "startupToBeConfigured")}</td>
//             <td>{getServiceValue("Q2", "startupToBeConfigured")}</td>
//             <td>{getServiceValue("Q3", "startupToBeConfigured")}</td>
//             <td>{getServiceValue("Q4", "startupToBeConfigured")}</td>
//           </tr>

//           <tr>
//             <td>10</td>
//             <td>Bitlocker</td>
//             <td className="activity-description">
//               Bitlocker enable check and Recovery Key check
//             </td>
//             <td>{getServiceValue("Q1", "bitLockerCheck")}</td>
//             <td>{getServiceValue("Q2", "bitLockerCheck")}</td>
//             <td>{getServiceValue("Q3", "bitLockerCheck")}</td>
//             <td>{getServiceValue("Q4", "bitLockerCheck")}</td>
//           </tr>
//           <tr>
//             <td>11</td>
//             <td>Back Up</td>
//             <td className="activity-description">
//               Backup Solution installed and configured
//             </td>
//             <td>{getServiceValue("Q1", "backupSolutionCheck")}</td>
//             <td>{getServiceValue("Q2", "backupSolutionCheck")}</td>
//             <td>{getServiceValue("Q3", "backupSolutionCheck")}</td>
//             <td>{getServiceValue("Q4", "backupSolutionCheck")}</td>
//           </tr>
//           <tr>
//             <td>12</td>
//             <td>Peripheral devices</td>
//             <td className="activity-description">
//               Mouse & Keyboard status to be check
//             </td>
//             <td>{getServiceValue("Q1", "mouseKeyboardStatus")}</td>
//             <td>{getServiceValue("Q2", "mouseKeyboardStatus")}</td>
//             <td>{getServiceValue("Q3", "mouseKeyboardStatus")}</td>
//             <td>{getServiceValue("Q4", "mouseKeyboardStatus")}</td>
//           </tr>
//         </tbody>
//       </table>

//       <table className="table pm-summary">
//         <tbody>
//           <tr className="table-header">
//             <td>PM</td>
//             <td>
//               Q5(Sept'24-Nov'24){" "}
//               {quarterServices.Q1
//                 ? `(${new Date(
//                   quarterServices.Q1.createdAt || quarterServices.Q1.updatedAt
//                 ).toLocaleDateString()})`
//                 : ""}
//             </td>
//             <td>
//               Q6(Dec'24-Feb'25){" "}
//               {/* {quarterServices.Q2
//                 ? `(${new Date(
//                     quarterServices.Q2.createdAt || quarterServices.Q2.updatedAt
//                   ).toLocaleDateString()})`
//                 : ""} */}
//             </td>
//             <td>
//               Q7(Mar'25-May'25){" "}
//               {/* {quarterServices.Q3
//                 ? `(${new Date(
//                     quarterServices.Q3.createdAt || quarterServices.Q3.updatedAt
//                   ).toLocaleDateString()})`
//                 : ""} */}
//             </td>
//             <td>
//               Q8(Jun'25-Aug'25){" "}
//               {/* {quarterServices.Q4
//                 ? `(${new Date(
//                     quarterServices.Q4.createdAt || quarterServices.Q4.updatedAt
//                   ).toLocaleDateString()})`
//                 : ""} */}
//             </td>
//           </tr>
//           <tr>
//             <td>Date</td>
//             <td>
//               {quarterServices.Q1
//                 ? new Date(
//                   quarterServices.Q1.nextServiceDate ||
//                   quarterServices.Q1.createdAt
//                 ).toLocaleDateString()
//                 : ""}
//             </td>
//             <td>
//               {quarterServices.Q2
//                 ? new Date(
//                   quarterServices.Q2.nextServiceDate ||
//                   quarterServices.Q2.createdAt
//                 ).toLocaleDateString()
//                 : ""}
//             </td>
//             <td>
//               {quarterServices.Q3
//                 ? new Date(
//                   quarterServices.Q3.nextServiceDate ||
//                   quarterServices.Q3.createdAt
//                 ).toLocaleDateString()
//                 : ""}
//             </td>
//             <td>
//               {quarterServices.Q4
//                 ? new Date(
//                   quarterServices.Q4.nextServiceDate ||
//                   quarterServices.Q4.createdAt
//                 ).toLocaleDateString()
//                 : ""}
//             </td>
//           </tr>
//           <tr>
//             <td>User Signature</td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//           </tr>
//           <tr>
//             <td>User Remarks</td>
//             <td>{quarterServices.Q1?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q2?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q3?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q4?.servicingRemarks || ""}</td>
//           </tr>
//           <tr>
//             <td>Eng. Signature</td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//           </tr>
//           <tr>
//             <td>Eng. Remarks</td>
//             <td>{quarterServices.Q1?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q2?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q3?.servicingRemarks || ""}</td>
//             <td>{quarterServices.Q4?.servicingRemarks || ""}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div className="notes">
//         <strong>Note:</strong>
//       </div>
//     </div>
//   );
// };
const PdfTemplate = ({ data }) => {
  console.log("dataaaa", data)

  // Get the last 4 services sorted by date (most recent first)
  const sortedServices =
    data?.services
      ?.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt);
        const dateB = new Date(b.createdAt || b.updatedAt);
        return dateB - dateA;
      })
      .slice(0, 4) || [];

  // Assign services to quarters (Q4 = most recent, Q1 = oldest of the 4)
  const quarterServices = {
    Q1: sortedServices[3] || null, // Oldest
    Q2: sortedServices[2] || null,
    Q3: sortedServices[1] || null,
    Q4: sortedServices[0] || null, // Most recent
  };


  const renderCheck = (value) => {
    return value ? "✓" : "✗";
  };

  const getServiceValue = (quarter, field) => {
    const service = quarterServices[quarter];
    if (!service) return "";

    if (typeof service[field] === "boolean") {
      return renderCheck(service[field]);
    }
    return service[field] || "NA";
  };

  return (
    <div className="pdf-container">
      <div className="header">
        <div className="title">PREVENTIVE MAINTENANCE CHECKLIST SHEET</div>
        <div className="logo-right">
          <img src={logo} alt="Logo" />
        </div>
      </div>

      <table className="table system-info">
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold" }}>Title</td>
            <td colSpan="5" style={{ fontWeight: "bold" }}>
              System Details
            </td>
          </tr>
          <tr>
            <td>User Name</td>
            <td>
              <span>{data?.assignedUserName || "NA"}</span>
            </td>
            <td>Asset Type</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.grInventoryProduct?.product?.category?.name || "NA"}
              </span>
            </td>
            <td>OS</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.softwareInstalls?.find((s) => s.softwares?.name === "OS")
                  ?.value || "NA"}
              </span>
            </td>
          </tr>
          <tr>
            <td>Dept.</td>
            <td>
              <span>{data?.department || "NA"}</span>
            </td>
            <td>Host name</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.softwareInstalls?.find(
                  (s) => s.softwares?.name === "Host Name"
                )?.value || "NA"}
              </span>
            </td>
            <td>USB Status</td>
            <td style={{ textAlign: "center", fontWeight: "bold" }}>
              {data?.usbStatus === "Disabled" ? "Blocked" : "Enabled"}
            </td>
          </tr>
          <tr>
            <td>Model No</td>
            <td>
              <span>{data?.inventoryProductDetail?.grInventoryProduct?.product?.name || "NA"}</span>
            </td>
            <td>Processor</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.specValues?.find(
                  (s) => s?.specField?.name === "Processor"
                )?.value || "NA"}{" "}
              </span>
            </td>
            <td>AV Ver.</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.softwareInstalls?.find((s) => s.softwares?.name === "AV")
                  ?.value || "NA"}
              </span>
            </td>
          </tr>
          <tr>
            <td>Sl. No</td>
            <td>
              <span>{data?.inventoryProductDetail?.serialNo1 || data?.inventoryProductDetail?.serialNo2 || "NA"}</span>
            </td>
            <td>HDD / SSD</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.specValues?.find((s) => s.specField?.name === "Disk Type")
                  ?.value || "NA"}
              </span>
            </td>
            <td>IP Add</td>
            <td>
              <span>
                {data?.inventoryProductDetail?.softwareInstalls?.find(
                  (s) => s.softwares?.name === "IP Address"
                )?.value || "NA"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="table activity-table">
        <tbody>
          <tr className="table-header">
            <td className="sl-col">Sl No</td>
            <td className="activity-col">Activity</td>
            <td className="description-col">Description</td>
            <td className="quarter-col">Q1</td>
            <td className="quarter-col">Q2</td>
            <td className="quarter-col">Q3</td>
            <td className="quarter-col">Q4</td>
          </tr>
          <tr>
            <td>1</td>
            <td>System Boot</td>
            <td className="activity-description">
              Latest Version of OS updated
            </td>
            <td>{data?.latestVersionOfOsUpdate}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>
          <tr>
            <td>2</td>
            <td>System Log-in</td>
            <td className="activity-description">
              Monitor errors/Login script
            </td>
            <td>{data?.monitorCheck}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>
          <tr>
            <td rowSpan="5">3</td>
            <td rowSpan="5">Network setting to be check</td>
            <td>TCP/IP settings are ok</td>
            <td>{data?.tcpipCheck}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Azure Join & Domain name check</td>
            <td>{renderCheck(data?.azurejoinandDomainCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>AD policy status to be check</td>
            <td>{renderCheck(data?.adPolicyCheck)}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>
          <tr>
            <td>Zscaler V2.0 & DNS to be check</td>
            <td>{renderCheck(data?.zscalerandDnsCheck)}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>
          <tr>
            <td>Device manager settings to be check</td>
            <td>{renderCheck(data?.deviceManagerCheck)}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>

          <tr>
            <td rowSpan="5">4</td>
            <td rowSpan="5">Computer Hardware settings</td>
            <td>HDD performance to be check</td>
            <td>{renderCheck(data?.hDDPerformanceCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>System driver status to be check</td>
            <td>{renderCheck(data?.systemDriverStatusCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Memory speed to be check</td>
            <td>{renderCheck(data?.memorySpeedCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Laptop battery status to be check</td>
            <td>{renderCheck(data?.laptopBatteryCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Hard Disk Health Check</td>
            <td>{data?.harddiskCheck}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>5</td>
            <td>ZscalerProxy to be check</td>
            <td className="activity-description">
              Verify updated version & Operation
            </td>
            <td>{data?.zscalerProxyVerUpgrade}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td rowSpan="2">6</td>
            <td rowSpan="2">Application status to be check</td>
            <td>Application license status to be check</td>
            <td>{renderCheck(data?.applicationLicenseCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Applications: Ms Teams</td>

            <td>{data?.applicationOffice}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>

          <tr>
            <td rowSpan="3">7</td>
            <td rowSpan="3">Crowd Strike Antivirus activity</td>
            <td>Antivirus status to be check </td>
            <td>{renderCheck(data?.antivirusStatusCheck)}</td>
            <td></td>
            <td></td>
            <td></td>

          </tr>
          <tr>
            <td>Antivirus policy to be check </td>
            <td>{renderCheck(data?.antiVirusPolicyCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>System to be scan and logs to be check </td>
            <td>{renderCheck(data?.systemScanAndLogCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td rowSpan="2">8</td>
            <td rowSpan="2">Patch </td>
            <td>Verify system is updated with recent WSUS Patches release</td>
            <td>{data?.wsusPatchRelease}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Intune application status to be check </td>
            <td>{renderCheck(data?.intuneApplicationCheck)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td rowSpan="3">9</td>
            <td rowSpan="3">Clearance</td>
            <td>Unwanted application to be removed</td>
            <td>{data?.unWantedapplicationTobeRemoved}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Temp/prefetch/recycle bin/caches file to be delete</td>
            <td>{data?.tempRefetchPrefetchtobeDeleted}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Startup to be configure</td>
            <td>{data?.startupToBeConfigured}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td>10</td>
            <td>Bitlocker</td>
            <td className="activity-description">
              Bitlocker enable check and Recovery Key check
            </td>
            <td>{data?.bitLockerCheck}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>11</td>
            <td>Back Up</td>
            <td className="activity-description">
              Backup Solution installed and configured
            </td>
            <td>{data?.backupSolutionCheck}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>12</td>
            <td>Peripheral devices</td>
            <td className="activity-description">
              Mouse & Keyboard status to be check
            </td>
            <td>{renderCheck(data?.mouseKeyboardStatus)}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <table className="table pm-summary">
        <tbody>
          <tr className="table-header">
            <td>PM</td>
            <td>
              Q5(Sept'24-Nov'24){" "}
              {quarterServices.Q1
                ? `(${new Date(
                  quarterServices.Q1.createdAt || quarterServices.Q1.updatedAt
                ).toLocaleDateString()})`
                : ""}
            </td>
            <td>
              Q6(Dec'24-Feb'25){" "}
              {/* {quarterServices.Q2
                ? `(${new Date(
                    quarterServices.Q2.createdAt || quarterServices.Q2.updatedAt
                  ).toLocaleDateString()})`
                : ""} */}
            </td>
            <td>
              Q7(Mar'25-May'25){" "}
              {/* {quarterServices.Q3
                ? `(${new Date(
                    quarterServices.Q3.createdAt || quarterServices.Q3.updatedAt
                  ).toLocaleDateString()})`
                : ""} */}
            </td>
            <td>
              Q8(Jun'25-Aug'25){" "}
              {/* {quarterServices.Q4
                ? `(${new Date(
                    quarterServices.Q4.createdAt || quarterServices.Q4.updatedAt
                  ).toLocaleDateString()})`
                : ""} */}
            </td>
          </tr>
          <tr>
            <td>Date</td>
            <td>
              {quarterServices.Q1
                ? new Date(
                  quarterServices.Q1.nextServiceDate ||
                  quarterServices.Q1.createdAt
                ).toLocaleDateString()
                : ""}
            </td>
            <td>
              {quarterServices.Q2
                ? new Date(
                  quarterServices.Q2.nextServiceDate ||
                  quarterServices.Q2.createdAt
                ).toLocaleDateString()
                : ""}
            </td>
            <td>
              {quarterServices.Q3
                ? new Date(
                  quarterServices.Q3.nextServiceDate ||
                  quarterServices.Q3.createdAt
                ).toLocaleDateString()
                : ""}
            </td>
            <td>
              {quarterServices.Q4
                ? new Date(
                  quarterServices.Q4.nextServiceDate ||
                  quarterServices.Q4.createdAt
                ).toLocaleDateString()
                : ""}
            </td>
          </tr>
          <tr>
            <td>User Signature</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>User Remarks</td>
            <td>{quarterServices.Q1?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q2?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q3?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q4?.servicingRemarks || ""}</td>
          </tr>
          <tr>
            <td>Eng. Signature</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Eng. Remarks</td>
            <td>{quarterServices.Q1?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q2?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q3?.servicingRemarks || ""}</td>
            <td>{quarterServices.Q4?.servicingRemarks || ""}</td>
          </tr>
        </tbody>
      </table>

      <div className="notes">
        <strong>Note:</strong>
      </div>
    </div>
  );
};
const CompleteService = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const printRef = useRef();
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();



  const fetchAllCompletedServices = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/asset-service/details/${id}`,
        {
          method: "GET",
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
      return result.data;
    } catch (error) {
      console.error("Error fetching service details:", error);
      throw error;
    }
  };


  const handleDownloadPdf = async (rowData) => {
    console.log("rowDataaaa", rowData)
    try {
      // Fetch the detailed service data
      const serviceDetails = await fetchAllCompletedServices(rowData?.uuid);

      // Merge the basic row data with the detailed service data
      const fullData = {
        ...rowData,
        ...serviceDetails,
      };

      setSelectedRow(fullData);

      setTimeout(async () => {
        try {
          const input = printRef.current;
          const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            letterRendering: true,
            backgroundColor: "#ffffff",
            width: input.scrollWidth,
            height: input.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          if (imgHeight > pdfHeight - 20) {
            const ratio = (pdfHeight - 20) / imgHeight;
            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;
            pdf.addImage(imgData, "PNG", 10, 10, finalWidth, finalHeight);
          } else {
            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
          }

          pdf.save(
            `Preventive_Maintenance_Checklist_${rowData?.createdUser?.name?.replace(
              /\s+/g,
              "_"
            )}_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`
          );
        } catch (error) {
          console.error("Error generating PDF:", error);
          alert("Error generating PDF. Please try again.");
        }
      }, 100);
    } catch (error) {
      console.error("Error preparing PDF data:", error);
      alert("Error preparing PDF data. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const { pageIndex, pageSize } = pagination;
        const page = pageIndex + 1; // API uses 1-based indexing
        const limit = pageSize;

        // Build sort parameters
        let sortBy = "createdAt";
        let sortOrder = "desc";
        if (sorting.length > 0) {
          sortBy = sorting[0].id;
          sortOrder = sorting[0].desc ? "desc" : "asc";
        }

        // Build API URL with query parameters
        let url = `${baseUrl}/asset-service/list?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}`;

        // Add search filter if present
        if (globalFilter) {
          url += `&search=${globalFilter}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        if (result.status && result.data) {
          // Transform the data to match the table structure
          const transformedData = result.data.data.map((item) => ({
            id: item.id,
            uuid: item.uuid,
            nextServiceDate: item.nextServiceDate,
            harddiskCheck: item.harddiskCheck,
            monitorCheck: item.monitorCheck,
            tcpipCheck: item.tcpipCheck,
            latestVersionOfOsUpdate: item.latestVersionOfOsUpdate,
            azurejoinandDomainCheck: item.azurejoinandDomainCheck,
            adPolicyCheck: item.adPolicyCheck,
            zscalerandDnsCheck: item.zscalerandDnsCheck,
            deviceManagerCheck: item.deviceManagerCheck,
            hDDPerformanceCheck: item.hDDPerformanceCheck,
            systemDriverStatusCheck: item.systemDriverStatusCheck,
            memorySpeedCheck: item.memorySpeedCheck,
            laptopBatteryCheck: item.laptopBatteryCheck,
            zscalerProxyVerUpgrade: item.zscalerProxyVerUpgrade,
            applicationLicenseCheck: item.applicationLicenseCheck,
            applicationOffice: item.applicationOffice,
            antivirusStatusCheck: item.antivirusStatusCheck,
            systemScanAndLogCheck: item.systemScanAndLogCheck,
            wsusPatchRelease: item.wsusPatchRelease,
            intuneApplicationCheck: item.intuneApplicationCheck,
            unWantedapplicationTobeRemoved: item.unWantedapplicationTobeRemoved,
            tempRefetchPrefetchtobeDeleted: item.tempRefetchPrefetchtobeDeleted,
            startupToBeConfigured: item.startupToBeConfigured,
            bitLockerCheck: item.bitLockerCheck,
            backupSolutionCheck: item.backupSolutionCheck,
            mouseKeyboardStatus: item.mouseKeyboardStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            inventoryProductDetailId: item.inventoryProductDetailId,
            inventoryProductDetail: {
              uuid: item.inventoryProductDetail?.uuid || "N/A",
              serialNo1: item.inventoryProductDetail?.serialNo1 || "N/A",
            },
          }));

          setData(transformedData);
          setTotalRows(result.data.total);
          setTotalPages(result.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination, sorting, globalFilter]);

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("uuid", { header: "Service ID", size: 120 }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() =>
              navigate(
                `/completed-service-process/details/${row?.original?.uuid}`
              )
            }
            size="small"
            color="primary"
          >
            <img src={ViewIcon} alt="view" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleDownloadPdf(row.original)}
            title="Download PDF"
          >
            <img src={pdfIcon} style={{ height: 18, width: 18 }} alt="Pdf" />
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("inventoryProductDetail.uuid", {
      header: "Asset ID",
      size: 120,
    }),
    columnHelper.accessor("inventoryProductDetail.serialNo1", {
      header: "Serial Number",
      size: 120,
    }),
    columnHelper.accessor("nextServiceDate", {
      header: "Next Service Date",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("harddiskCheck", {
      header: "Hard Disk Check",
      size: 120,
    }),
    columnHelper.accessor("monitorCheck", {
      header: "Monitor Check",
      size: 120,
    }),
    columnHelper.accessor("tcpipCheck", { header: "TCP/IP Check", size: 120 }),
    columnHelper.accessor("latestVersionOfOsUpdate", {
      header: "Latest OS Version",
      size: 150,
    }),
    columnHelper.accessor("azurejoinandDomainCheck", {
      header: "Azure/Domain Check",
      size: 150,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("adPolicyCheck", {
      header: "AD Policy Check",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("zscalerandDnsCheck", {
      header: "Zscaler/DNS Check",
      size: 150,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("deviceManagerCheck", {
      header: "Device Manager Check",
      size: 150,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("hDDPerformanceCheck", {
      header: "HDD Performance",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("systemDriverStatusCheck", {
      header: "Driver Status",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("memorySpeedCheck", {
      header: "Memory Speed",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("laptopBatteryCheck", {
      header: "Battery Check",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("zscalerProxyVerUpgrade", {
      header: "Zscaler Proxy",
      size: 120,
    }),
    columnHelper.accessor("applicationLicenseCheck", {
      header: "License Check",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("applicationOffice", {
      header: "Office App",
      size: 120,
    }),
    columnHelper.accessor("antivirusStatusCheck", {
      header: "Antivirus Status",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("systemScanAndLogCheck", {
      header: "System Scan",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("wsusPatchRelease", {
      header: "WSUS Patch",
      size: 120,
    }),
    columnHelper.accessor("intuneApplicationCheck", {
      header: "Intune Check",
      size: 120,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("unWantedapplicationTobeRemoved", {
      header: "Unwanted Apps",
      size: 150,
    }),
    columnHelper.accessor("tempRefetchPrefetchtobeDeleted", {
      header: "Temp Files",
      size: 120,
    }),
    columnHelper.accessor("startupToBeConfigured", {
      header: "Startup Config",
      size: 150,
    }),
    columnHelper.accessor("bitLockerCheck", { header: "BitLocker", size: 120 }),
    columnHelper.accessor("backupSolutionCheck", {
      header: "Backup Solution",
      size: 150,
    }),
    columnHelper.accessor("mouseKeyboardStatus", {
      header: "Mouse/Keyboard",
      size: 150,
      Cell: ({ cell }) => String(cell.getValue()),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
  ];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
      rowSelection: selectedRows,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRows,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px", whiteSpace: "nowrap" },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": {
          backgroundColor: "#fafafa",
        },
      },
    },
     muiTableContainerProps: {
      sx: {
        width: "100%",
        overflowX: "auto",
        maxWidth: "100%",
        "&::-webkit-scrollbar": {
          height: "8px",
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "8px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      },
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),

  });

  return (
    <Box mt={3}>
      <Box sx={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={printRef}>
          {selectedRow && <PdfTemplate data={selectedRow} />}
        </div>
      </Box>
      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1050px",
            xl: "1300px",
          },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default CompleteService;
