import React, { Suspense, lazy } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Component/Layout/Layout";
const Dashboard = lazy(() => import("./Page/Dashboard/Dashboard"));
const Login = lazy(() => import("./Page/Login/Login"));
import ProtectedRoute from "./Control/ProtectedRoute";
import "./App.css";
// SetUp
import UnitPage from "./Page/Setup/Unit/UnitList";
import BrandList from "./Page/Setup/Brand/BrandList";
import BrandAdd from "./Page/Setup/Brand/BrandAdd";
import AddVendor from "./Page/Setup/Vendor/AddVendor";
import VendorList from "./Page/Setup/Vendor/VendorList";
import CategoryList from "./Page/Setup/Category/CategoryList";
import AddProduct from "./Page/Setup/Product/AddProduct";
import AddSub from "./Page/Setup/SubCategory/AddSub";
import SubList from "./Page/Setup/SubCategory/SubList";
import ProductList from "./Page/Setup/Product/ProductList";
import DepartmentAdd from "./Page/Setup/Department/DepartmentAdd";
import DepartmentList from "./Page/Setup/Department/DepartmentList";
import CustomFieldList from "./Page/Setup/CustomField/CustomFieldList";
import AddLoaction from "./Page/Setup/Loaction/AddLOaction";
import ListLoaction from "./Page/Setup/Loaction/ListLoaction";
import Software from "./Page/Setup/Software/Software";
import ListEmail from "./Page/Setup/Email/ListEmail";
// Employee
import ActiveEmp from "./Page/Employee/ActiveEmp";
// Asset Management
import AssignAsset from "./Page/AssetManagement/AssignAsset/AssignAsset";
import UnassignAsset from "./Page/AssetManagement/UnassignAsset/UnassignAsset";
import ListHandHover from "./Page/AssetManagement/Handover/ListHandhover";
import ReturnHandoverList from "./Page/AssetManagement/ReturnHandover/ReturnHandoverList";
import ReturnHandover from "./Page/AssetManagement/ReturnHandover/ReturnHandover";
import UnassignList from "./Page/AssetManagement/UnassignList/UnassignList";
import Handover from "./Page/AssetManagement/Handover/Handover";
import AssignList from "./Page/AssetManagement/AssignList/AssignList";
import AssignDetails from "./Page/AssetManagement/AssignList/AssignDetails";
// GR
import CreateGr from "./Page/GrEntry/CreateGr";
import ListGr from "./Page/GrEntry/ListGr/ListGr";
import AddGr from "./Page/GrEntry/ListGr/AddGr";
import ViewGr from "./Page/GrEntry/ListGr/ViewGr";
import QR from "./Page/GrEntry/ListGr/QR";
// Installation
import Installation from "./Page/GrEntry/Installation/Installation";
import InstallationList from "./Page/GrEntry/Installation/InstallationList";
import InstallationDetails from "./Page/GrEntry/Installation/InstallationDetails";
import BulkImport from "./Page/GrEntry/Installation/BulkImport/BulkImport";
import EditInventory from "./Page/GrEntry/Installation/EditInventory";
// QR
import QrList from "./Page/QrList/QrList";
import ProductDetail from "./Page/QrList/ProductDetail";
// Ticket
import TicketList from "./Page/Ticket/TicketList";
import TicketServiceCheckLists from "./Page/Ticket/TicketServiceCheckLists";
// Assets
import AllAsset from "./Page/AssetStatus/AllAsset/AllAsset";
import InStock from "./Page/AssetStatus/InStock/InStock";
import AssignedStock from "./Page/AssetStatus/AssignedStock/AssignedStock";
import BlockedStock from "./Page/AssetStatus/BlockedStock/BlockedStock";
import AwaitingStock from "./Page/AssetStatus/AwaitingStock/AwaitingStock";
import EWaste from "./Page/AssetStatus/EWaste/EWaste";
import ScrapList from "./Page/AssetStatus/ScrapList/ScrapList";
import BulkUpload from "./Page/AssetStatus/BulkUpload/BulkUpload";
// Service
import UpComingServiceProcessList from "./Page/AssetService/UpComingServiceProcess/UpComingServiceProcessList";
import UpcomingServiceProcessDetails from "./Page/AssetService/UpComingServiceProcess/UpcomingServiceProcessDetails";
import PendingService from "./Page/AssetService/PendingService/PendingService";
import CompleteService from "./Page/AssetService/CompleteService/CompleteService";
import ViewCompleteService from "./Page/AssetService/CompleteService/ViewCompleteService";
// Reports
import AvailableAssets from "./Page/Reports/AvailableAssets/AvailableAssets";
import AssetService from "./Page/Reports/AssetService/AssetService";
import AssetAllocation from "./Page/Reports/AssetAllocation/AssetAllocation";
import AssetLocation from "./Page/Reports/AssetLocation/AssetLocation";
import AssetCost from "./Page/Reports/AssetCost/AssetCost";
import TotalAsset from "./Page/Reports/TotalAsset/TotalAsset";
import AssetAging from "./Page/Reports/AssetAging/AssetAging";
import EmployeeReport from "./Page/Reports/EmployeeReport/EmployeeReport";
import SoftReport from "./Page/Reports/SoftReport/SoftReport";
// Transfer
import InitiateTransfer from "./Page/Transfer/InitiateTransfer";
//  Request
import Initiate from "./Page/Request/Initiate/Initiate";
import Approve from "./Page/Request/Approve/Approve";
import WriteOffRequest from "./Page/Request/WriteOffRequest/WriteOffRequest";
import Log from "./Page/Log/Log";
import TransferList from "./Page/Transfer/TransferList";
import Transfer from "./Page/Transfer/Transfer";
import TicketReport from "./Page/TicketReport/TicketReport";
import Notification from "./Page/Notification/Notification";
// Software
import SoftwareName from "./Page/Software/SoftwareName";
import SoftwareAssign from "./Page/Software/SoftwareAssign/SoftwareAssign";
import SoftwareAssignList from "./Page/Software/SoftwareAssign/SoftwareAssignList";
import UnassignSoftware from "./Page/Software/SoftwareAssign/UnassignSoftware";
import UnassignSoftwareList from "./Page/Software/SoftwareAssign/UnassignSoftwareList";
import SoftwareLog from "./Page/Software/Softwarelog/SoftwareLOG";
import SoftwareNameList from "./Page/Software/SoftwareNameList";
import NotificationDetails from "./Page/Notification/NotificationDetails";
import { TicketCategoryList } from "./Page/Ticket/master/category/TicketCategoryLists";
import { TicketSubcategoryList } from "./Page/Ticket/master/subcategory/TicketSubCategoryLists";

import NotFound from "./Page/NotFound/NotFound";
import TicketView from "./Page/Ticket/TicketView";
import TicketEdit from "./Page/Ticket/actions/TicketEdit";
//Loader
import Loader from "./Component/Loader/Loader";
// Role
import CreateRole from "./Page/ACL/CreateRole";
import RoleList from "./Page/ACL/RoleList";
import PermissionCreate from "./Page/ACL/Permission/permissioncreate";
import Permissionlist from "./Page/ACL/Permission/Permissionlist";
import ProductStatus from "./Page/ProductStatus/ProductStatus";
import TicketUnAssignedLists from "./Page/Ticket/TicketUnassignedLists";
const App = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />}></Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="/role/:id" element={<CreateRole />} />
              <Route path="/role-list" element={<RoleList />} />
              <Route path="/permission-create" element={<PermissionCreate />} />
              <Route path="/permission-list" element={<Permissionlist />} />
              {/* Setup */}
              <Route path="/setup/unit" element={<UnitPage />} />
              <Route path="/setup/brand/brandlist" element={<BrandList />} />
              <Route path="/setup/brand/brand-add" element={<BrandAdd />} />
              <Route path="/setup/loaction/list-loaction" element={<ListLoaction />} />
              <Route path="/setup/loaction/add-loaction" element={<AddLoaction />} />
              <Route path="/setup/vendor/addvendor" element={<AddVendor />} />
              <Route path="/setup/vendor/vendorlist" element={<VendorList />} />
              <Route path="/setup/software" element={<Software />} />
              <Route path="/setup/customfield/customfieldList" element={<CustomFieldList />} />
              <Route path="/setup/category/categorylist" element={<CategoryList />} />
              <Route path="/setup/brand/brandlist" element={<BrandList />} />
              <Route path="/setup/product/addproduct" element={<AddProduct />} />
              <Route path="/setup/subcategory/addsub" element={<AddSub />} />
              <Route path="/setup/subcategory/sublist" element={<SubList />} />
              <Route path="/setup/product/productlist" element={<ProductList />} />
              <Route path="/setup/department/departmentadd" element={<DepartmentAdd />} />
              <Route path="/setup/department/departmentlist" element={<DepartmentList />} />
              <Route path="/setup/list-email" element={<ListEmail />} />
              {/* Employee */}
              <Route path="/employee/activeemp" element={<ActiveEmp />} />
              {/* GR */}
              <Route path="/grentry/creategr" element={<CreateGr />} />
              <Route path="/grentry/listgr" element={<ListGr />} />
              <Route path="/grentry/addgr" element={<AddGr />} />
              <Route path="/grentry/listgr/qr/:id" element={<QR />} />
              <Route path="/grentry/listgr/viewgr/:id" element={<ViewGr />} />
              {/* Installation */}
              <Route path="/grentry/installation" element={<Installation />} />
              <Route path="/grentry/installation-list" element={<InstallationList />} />
              <Route path="/installation-details/:id" element={<InstallationDetails />} />
              <Route path="/grentry/bulk-import" element={<BulkImport />} />
              <Route path="/grentry/inventory/edit/:id" element={<EditInventory />} />
              {/* Allocation */}
              <Route path="/assetmanagement/assignasset" element={<AssignAsset />} />
              <Route path="/assetmanagement/assignlist" element={<AssignList />} />
              <Route path="/assetmanagement/assigndetails/:id" element={<AssignDetails />} />
              <Route path="/assetmanagement/unassignasset" element={<UnassignAsset />} />
              <Route path="/assetmanagement/listHandhover" element={<ListHandHover />} />
                <Route path="/assetmanagement/return-handover" element={<ReturnHandoverList />} />
                <Route path="/assetmanagement/return-handover/:id" element={<ReturnHandover />} />
                <Route path="/assetmanagement/unassign-list" element={<UnassignList />} />
              <Route path="/assetmanagement/handover/:id" element={<Handover />} />
              {/* Stock */}
              <Route path="/assetstatus/all-asset" element={<AllAsset />} />
              <Route path="/assetstatus/in-stock" element={<InStock />} />
              <Route path="/assetstatus/assigned-stock" element={<AssignedStock />} />
              <Route path="/assetstatus/blocked-stock" element={<BlockedStock />} />
              <Route path="/assetstatus/awaiting-stock" element={<AwaitingStock />} />
              <Route path="/assetstatus/write-off" element={<EWaste />} />
              <Route path="/assetstatus/scrap-list" element={<ScrapList />} />
              <Route path="/assetstatus/bulk-upload" element={<BulkUpload />} />

              {/* Reports */}
              <Route path="/reports/available-assets" element={<AvailableAssets />} />
              <Route path="/reports/asset-service" element={<AssetService />} />
              <Route path="/reports/asset-allocation" element={<AssetAllocation />} />
              <Route path="/reports/asset-location" element={<AssetLocation />} />
              <Route path="/reports/asset-aging" element={<AssetAging />} />
              <Route path="/reports/asset-cost" element={<AssetCost />} />
              <Route path="/reports/total-asset" element={<TotalAsset />} />
              <Route path="/reports/employee-report" element={<EmployeeReport />} />
              <Route path="/reports/soft-report" element={<SoftReport />} />

              {/* Request */}
              <Route path="/request/initiate" element={<Initiate />} />
              <Route path="/request/approve" element={<Approve />} />
              <Route path="/request/write-off-request" element={<WriteOffRequest />} />

              {/* Transfer */}
              <Route path="/transfer/initiate-transfer" element={<InitiateTransfer />} />
              <Route path="/transfer/transfer-list" element={<TransferList />} />
              <Route path="/transfer/transfer/:id" element={<Transfer />} />

              {/* Service */}
              <Route path="/asset-service/upcoming-service-process/asset-maintainance-checklist" element={<UpComingServiceProcessList />} />
              <Route path="/asset-service/upcoming-service-process/asset-maintainance-checklist-details/:id" element={<UpcomingServiceProcessDetails />} />
              <Route path="/asset-service/pending-service" element={<PendingService />} />
              <Route path="/asset-service/complete-service" element={<CompleteService />} />
              <Route path="/completed-service-process/details/:id" element={<ViewCompleteService />} />

              {/* Ticket */}
              <Route path="/ticketservice/category" element={<TicketCategoryList />} />
              <Route path="/ticketservice/subcategory" element={<TicketSubcategoryList />} />
              <Route path="/ticketservice/ticketlist" element={<TicketList />} />
              <Route path="/tickets/:ticketId" element={<TicketView />} />
              <Route path="/ticketservice/:ticketId" element={<TicketEdit />} />

              <Route path="/ticketservice/ticketlist/unassigned-tickets" element={<TicketUnAssignedLists />} />

              <Route path="/ticketservice/ticketlist/service-check" element={<TicketServiceCheckLists />} />

              {/* QR */}
              <Route path="/qrlist" element={<QrList />} />
              {/* LOG */}
              <Route path="/log/:id" element={<Log />} />
              <Route path="/ticket-report" element={<TicketReport />} />
              {/* Notification */}

              {/**Product Status */}
              <Route path="/product-status/:id" element={<ProductStatus />} />

              <Route path="/notifications" element={<Notification />} />
              <Route path="/notification/:id" element={<NotificationDetails />} />
              {/* Software */}
              <Route path="/software" element={<SoftwareName />} />
              <Route path="/software-list" element={<SoftwareNameList />} />
              <Route path="/software/software-assign" element={<SoftwareAssign />} />
              <Route path="/software/software-assign-list" element={<SoftwareAssignList />} />
              <Route path="/software/unassign/:id" element={<UnassignSoftware />} />
              <Route path="/software/unassign-list" element={<UnassignSoftwareList />} />
              <Route path="/software/software-log" element={<SoftwareLog />} />
            </Route>
          </Route>
          <Route path="/product-detail/:assetId" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
