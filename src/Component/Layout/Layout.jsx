// import React, { useState } from "react";
// import Sidebar from "../../Page/SideBar/SideBar";
// import Navbar from "../../Page/NavBar/Navbar";
// import { Outlet } from "react-router-dom";
// import "./Layout.css";
// import SideBarWIthoutTitle from "../../Page/SideBarWIthoutTitle/SideBarWIthoutTitle";
// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };
//   return (
//     <div className="layout">
//       {sidebarOpen && <Sidebar />}
//       {!sidebarOpen && <SideBarWIthoutTitle />}
//       <div className="main-content">
//         <Navbar toggleSidebar={toggleSidebar} />
//         <div className="page-content">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
// import React, { useState } from "react";
// import Sidebar from "../../Page/SideBar/SideBar";
// import Navbar from "../../Page/NavBar/Navbar";
// import { Outlet } from "react-router-dom";
// import "./Layout.css";
// import SideBarWIthoutTitle from "../../Page/SideBarWIthoutTitle/SideBarWIthoutTitle";

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };
//   return (
//     <div className="layout">
//       {sidebarOpen ? (
//         <Sidebar />
//       ) : (
//         <SideBarWIthoutTitle onItemClick={() => setSidebarOpen(true)} />
//       )}
//       <div className="main-content">
//         <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
//         <div className="page-content">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
// import React, { useState } from "react";
// import Sidebar from "../../Page/SideBar/SideBar";
// import Navbar from "../../Page/NavBar/Navbar";
// import { Outlet } from "react-router-dom";
// import "./Layout.css";
// import SideBarWIthoutTitle from "../../Page/SideBarWIthoutTitle/SideBarWIthoutTitle";

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };
//   return (
//     <div
//       className="layout"
//       style={{
//         display: "flex",
//         transition: "all 0.5s ease",
//       }}
//     >
//       {sidebarOpen ? (
//         <div
//           style={{
//             width: "250px",
//             transition: "width 0.5s ease",
//           }}
//         >
//           <Sidebar />
//         </div>
//       ) : (
//         <div
//           style={{
//             width: "70px",
//             transition: "width 0.5s ease",
//           }}
//         >
//           <SideBarWIthoutTitle onItemClick={() => setSidebarOpen(true)} />
//         </div>
//       )}
//       <div
//         className="main-content"
//         style={{
//           flexGrow: 1,
//           transition: "margin 0.5s ease",
//           marginLeft: sidebarOpen ? "0px" : "0px",
//         }}
//       >
//         <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
//         <div className="page-content">{<Outlet />}</div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
import React, { useState } from "react";
import Sidebar from "../../Page/SideBar/SideBar";
import Navbar from "../../Page/NavBar/Navbar";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import SideBarWIthoutTitle from "../../Page/SideBarWIthoutTitle/SideBarWIthoutTitle";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Shared state for both sidebars
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [openSection, setOpenSection] = useState(null);


  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div
      className="layout"
      style={{
        display: "flex",
        transition: "all 0.5s ease",
      }}
    >
      {sidebarOpen ? (
        <div
          style={{
            width: "250px",
            transition: "width 0.5s ease",
          }}
        >
          <Sidebar
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            openSection={openSection}
            setOpenSection={setOpenSection}
          />
        </div>
      ) : (
        <div
          style={{
            width: "70px",
            transition: "width 0.5s ease",
          }}
        >
          <SideBarWIthoutTitle
            onItemClick={() => setSidebarOpen(true)}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            openSection={openSection}
            setOpenSection={setOpenSection}
          />
        </div>
      )}
      <div
        className="main-content"
        style={{
          flexGrow: 1,
          transition: "margin 0.5s ease",
          marginLeft: sidebarOpen ? "0px" : "0px",
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen}  />
        <div className="page-content">{<Outlet />}</div>
      </div>
    </div>
  );
};

export default Layout;
