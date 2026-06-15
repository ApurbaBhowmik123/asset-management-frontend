// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Link,
//   Container,
//   InputAdornment,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import LoginBackground from "../../assets/LoginImages/loginimage.jpg";
// import star from "../../assets/LoginImages/two-0.png";
// import AdityBirlaLogo from "../../assets/LoginImages/AdityBirlaLogo.png";
// import view from "../../assets/LoginImages/view.png";
// import greenTick from "../../assets/LoginImages/greenTick.png";
// import { PRIMARY_COLOR, PRIMARY_HOVER_COLOR } from "../../Constant/Color";
// import { Password } from "@mui/icons-material";
// import { useState } from "react";
// import { baseUrl } from "../Api";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const defaultState = {
//     email: "",
//     password: "",
//   };
//   const [loginData, setLoginData] = useState(defaultState);
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const isValidEmail = emailRegex.test(loginData?.email);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });
//   const handleChange = (e) => {
//     setLoginData({ ...loginData, [e.target.name]: e.target.value });
//   };

//   const handleShowPassword = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!loginData.email || !loginData.password) {
//       setSnackbar({
//         open: true,
//         severity: "error",
//         message: "Please enter both email and password",
//       });
//       return;
//     }

//     if (!isValidEmail) {
//       setSnackbar({
//         open: true,
//         severity: "error",
//         message: "Please enter a valid email address",
//       });
//       return;
//     }

//     try {

//       const res = await fetch(`${baseUrl}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(loginData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       if (data?.status === "validation_error" || false) {
//         setSnackbar({
//           open: true,
//           severity: "error",
//           message: data?.message,
//         });
//         return;
//       }

//       if (data?.status) {
//         localStorage.setItem("token", data?.token);
//         localStorage.setItem("profile", JSON.stringify(data));
//         setSnackbar({
//           open: true,
//           severity: "success",
//           message: data.message || "Login successful!",
//         });

//         if (data?.data?.role === "User") {
//           navigate("/ticketservice/ticketlist");
//         } else {
//           navigate("/");
//         }
//       } else {
//         setSnackbar({
//           open: true,
//           severity: "error",
//           message: data?.errorResponse?.message || "Login error!",
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setSnackbar({
//         open: true,
//         severity: "error",
//         message: error.message || "An error occurred during login",
//       });
//     }
//   };
//   return (
//     <Grid container sx={{ minHeight: "100vh", overflow: "hidden" }}>
//       <Grid
//         item
//         xs={12}
//         sm={6}
//         sx={{
//           display: { xs: "none", sm: "flex" },
//           alignItems: "flex-start",
//           justifyContent: "center",
//           p: { sm: 1, md: 2, lg: 3 },
//           backgroundImage: `linear-gradient(rgba(219, 48, 39, 0.3), rgba(219, 48, 39, 0.3)), url(${LoginBackground})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundRepeat: "no-repeat",
//           minHeight: "100vh",
//           width: "50%",
//         }}
//       >
//         <Box
//           sx={{
//             position: "relative",
//             width: "100%",
//             maxWidth: { sm: "70%", md: "60%", lg: "45%" },
//             pt: { sm: 4, md: 6, lg: 14 },
//           }}
//         >
//           <Box
//             component="img"
//             src={star}
//             sx={{
//               width: "100%",
//               height: "auto",
//             }}
//           />
//           {/* <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translateX(-50%)",
//               width: "100%",
//               px: 2,
//             }}
//           >
//             <Typography
//               variant="h5"
//               sx={{
//                 color: "white",
//                 fontWeight: 500,
//                 mb: 1,
//                 fontSize: { sm: "1rem", md: "1.25rem", lg: "1.8rem" },
//               }}
//             >
//               New Scheduling And Routing Options
//             </Typography>
//             <Typography
//               variant="caption"
//               sx={{
//                 color: "#FFFFFFD1",
//                 display: "block",
//                 fontSize: { sm: "0.6rem", md: "0.7rem", lg: "0.8rem" },
//               }}
//             >
//               Lorem ipsum dolor sit amet consectetur. Mattis neque bibendum vel
//               quam eu
//             </Typography>
//           </Box> */}
//         </Box>
//       </Grid>

//       {/* Right Side - Login Form */}
//       <Grid
//         item
//         xs={12}
//         sm={6}
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           p: { xs: 2, sm: 2, md: 3, lg: 4 },
//           backgroundColor: "white",
//           minHeight: "100vh",
//           overflowY: "auto",
//           "&::-webkit-scrollbar": {
//             display: "none",
//           },
//           msOverflowStyle: "none",
//           scrollbarWidth: "none",
//           width: "50%",
//         }}
//       >
//         <Container
//           maxWidth="sm"
//           sx={{
//             width: "100%",
//             "&::-webkit-scrollbar": {
//               display: "none",
//             },
//             msOverflowStyle: "none",
//             scrollbarWidth: "none",
//             my: 4, // Add vertical margin instead of fixed margin-top
//           }}
//         >
//           {/* Logo */}
//           <Box
//             display="flex"
//             justifyContent="center"
//             mb={{ xs: 2, sm: 2, md: 3 }}
//           >
//             <img
//               src={AdityBirlaLogo}
//               alt="Logo"
//               style={{
//                 borderRadius: 8,
//                 maxWidth: "100%",
//                 height: "auto",
//                 maxHeight: { xs: "40px", sm: "50px", md: "60px" },
//               }}
//             />
//           </Box>

//           <Typography
//             variant="h5"
//             fontWeight="500"
//             align="center"
//             fontSize={{ xs: "24px", sm: "26px", md: "28px", lg: "30px" }}
//             mb={1}
//           >
//             Welcome Back!
//           </Typography>
//           <Typography
//             sx={{ fontSize: { xs: "12px", sm: "13px", md: "14px" } }}
//             align="center"
//             color="text.secondary"
//             mb={{ xs: 2, sm: 3, md: 4 }}
//           >
//             Please sign-in to your account and start the adventure
//           </Typography>

//           {/* Form */}
//           <Box onSubmit={handleSubmit} component="form">
//             <TextField
//               name="email"
//               value={loginData?.email}
//               onChange={handleChange}
//               fullWidth
//               label="Email"
//               variant="outlined"
//               sx={{
//                 backgroundColor: "#F5F6FA",
//                 borderRadius: "6px",
//                 "& .MuiOutlinedInput-root": {
//                   "& fieldset": {
//                     border: "none",
//                   },
//                   "&:hover fieldset": {
//                     border: "none",
//                   },
//                   "&.Mui-focused fieldset": {
//                     border: "none",
//                   },
//                 },
//                 mb: 2,
//               }}
//               InputProps={{
//                 endAdornment: (
//                   <>
//                     {isValidEmail && (
//                       <InputAdornment position="end">
//                         <img
//                           src={greenTick}
//                           alt="valid"
//                           style={{ height: "14px" }}
//                         />
//                       </InputAdornment>
//                     )}
//                   </>
//                 ),
//               }}
//             />
//             <TextField
//               name="password"
//               value={loginData?.password}
//               onChange={handleChange}
//               fullWidth
//               label="Password"
//               type={`${showPassword ? "text" : "password"}`}
//               variant="outlined"
//               margin="normal"
//               sx={{
//                 backgroundColor: "#F5F6FA",
//                 borderRadius: "6px",
//                 "& .MuiOutlinedInput-root": {
//                   "& fieldset": {
//                     border: "none",
//                   },
//                   "&:hover fieldset": {
//                     border: "none",
//                   },
//                   "&.Mui-focused fieldset": {
//                     border: "none",
//                   },
//                 },
//                 mb: 1,
//               }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <img
//                       onClick={handleShowPassword}
//                       src={view}
//                       alt="view password"
//                       style={{ height: "10px", cursor: "pointer" }}
//                     />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mt={1}
//               mb={{ xs: 2, sm: 2, md: 3 }}
//               flexDirection={{ xs: "column", sm: "row" }}
//               gap={{ xs: 1, sm: 0 }}
//             >

//             </Box>

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{
//                 backgroundColor: PRIMARY_COLOR,
//                 "&:hover": { backgroundColor: PRIMARY_HOVER_COLOR },
//                 borderRadius: "8px",
//                 py: 1.5,
//                 mb: { xs: 2, sm: 2, md: 3 },
//                 fontSize: { xs: "14px", sm: "inherit" },
//               }}
//             >
//               Login
//             </Button>
//           </Box>

//         </Container>
//       </Grid>
//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Grid>
//   );
// };

// export default Login;

import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Container,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import LoginBackground from "../../assets/LoginImages/loginimage.jpg";
import star from "../../assets/LoginImages/two-0.png";
import AdityBirlaLogo from "../../assets/LoginImages/AdityBirlaLogo.png";
import view from "../../assets/LoginImages/view.png";
import greenTick from "../../assets/LoginImages/greenTick.png";
import { PRIMARY_COLOR, PRIMARY_HOVER_COLOR } from "../../Constant/Color";
import { Password } from "@mui/icons-material";
import { useState } from "react";
import { baseUrl } from "../Api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const defaultState = {
    email: "",
    password: "",
  };
  const [loginData, setLoginData] = useState(defaultState);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(loginData?.email);
  const [showPassword, setShowPassword] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Please enter both email and password",
      });
      return;
    }

    if (!isValidEmail) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data?.status === "validation_error" || false) {
        setSnackbar({
          open: true,
          severity: "error",
          message: data?.message,
        });
        return;
      }

      if (data?.status) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("profile", JSON.stringify(data));

        try {
          const accessRes = await fetch(`${baseUrl}/access/get-my-access`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data?.token}`,
            },
          });

          const accessData = await accessRes.json();

          if (accessRes.ok) {
            localStorage.setItem("myAccess", JSON.stringify(accessData));
          } else {
            console.error("Failed to fetch access data:", accessData);
          }
        } catch (accessError) {
          console.error("Access API error:", accessError);
        }

        setSnackbar({
          open: true,
          severity: "success",
          message: data.message || "Login successful!",
        });

        // Navigate based on role
        if (data?.data?.role === "User") {
          navigate("/ticketservice/ticketlist");
        } else {
          navigate("/");
        }
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: data?.errorResponse?.message || "Login error!",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "An error occurred during login",
      });
    }
  };
  const handleLdapLogin = async (e) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Please enter both username and password",
      });
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/auth/ldap/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data?.status === "validation_error" || false) {
        setSnackbar({
          open: true,
          severity: "error",
          message: data?.message,
        });
        return;
      }

      if (data?.status) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("profile", JSON.stringify(data));

        try {
          const accessRes = await fetch(`${baseUrl}/access/get-my-access`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data?.token}`,
            },
          });

          const accessData = await accessRes.json();

          if (accessRes.ok) {
            localStorage.setItem("myAccess", JSON.stringify(accessData));
          } else {
            console.error("Failed to fetch access data:", accessData);
          }
        } catch (accessError) {
          console.error("Access API error:", accessError);
        }

        setSnackbar({
          open: true,
          severity: "success",
          message: data.message || "Login successful!",
        });

        // Navigate based on role
        if (data?.data?.role === "User") {
          navigate("/ticketservice/ticketlist");
        } else {
          navigate("/");
        }
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: data?.errorResponse?.message || "Login error!",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "An error occurred during login",
      });
    }
  };
  return (
    <Grid container sx={{ minHeight: "100vh", overflow: "hidden" }}>
      <Grid
        item
        xs={12}
        sm={6}
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "flex-start",
          justifyContent: "center",
          p: { sm: 1, md: 2, lg: 3 },
          backgroundImage: `linear-gradient(rgba(219, 48, 39, 0.3), rgba(219, 48, 39, 0.3)), url(${LoginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "50%",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: { sm: "70%", md: "60%", lg: "45%" },
            pt: { sm: 4, md: 6, lg: 14 },
          }}
        >
          <Box
            component="img"
            src={star}
            sx={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
      </Grid>

      {/* Right Side - Login Form */}
      <Grid
        item
        xs={12}
        sm={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 2, md: 3, lg: 4 },
          backgroundColor: "white",
          minHeight: "100vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          width: "50%",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            width: "100%",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            my: 4,
          }}
        >
          {/* Logo */}
          <Box
            display="flex"
            justifyContent="center"
            mb={{ xs: 2, sm: 2, md: 3 }}
          >
            <img
              src={AdityBirlaLogo}
              alt="Logo"
              style={{
                borderRadius: 8,
                maxWidth: "100%",
                height: "auto",
                maxHeight: { xs: "40px", sm: "50px", md: "60px" },
              }}
            />
          </Box>

          <Typography
            variant="h5"
            fontWeight="500"
            align="center"
            fontSize={{ xs: "24px", sm: "26px", md: "28px", lg: "30px" }}
            mb={1}
          >
            Welcome Back!
          </Typography>
          <Typography
            sx={{ fontSize: { xs: "12px", sm: "13px", md: "14px" } }}
            align="center"
            color="text.secondary"
            mb={{ xs: 2, sm: 3, md: 4 }}
          >
            Please sign-in to your account and start the adventure
          </Typography>

          {/* Form */}
          {adminLogin ? (
            <Box
              onSubmit={handleSubmit}
              component="form"
              sx={{
                width: "100%",
                maxWidth: "400px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TextField
                name="email"
                value={loginData?.email}
                onChange={handleChange}
                fullWidth
                label="Email"
                variant="outlined"
                sx={{
                  backgroundColor: "#F5F6FA",
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  mb: 2,
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      {isValidEmail && (
                        <InputAdornment position="end">
                          <img src={greenTick} alt="valid" style={{ height: "14px" }} />
                        </InputAdornment>
                      )}
                    </>
                  ),
                }}
              />
              <TextField
                name="password"
                value={loginData?.password}
                onChange={handleChange}
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                sx={{
                  backgroundColor: "#F5F6FA",
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  mb: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <img
                        onClick={handleShowPassword}
                        src={view}
                        alt="view password"
                        style={{ height: "10px", cursor: "pointer" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  "&:hover": { backgroundColor: PRIMARY_HOVER_COLOR },
                  borderRadius: "8px",
                  py: 1.5,
                  mb: { xs: 2, sm: 2, md: 3 },
                  fontSize: { xs: "14px", sm: "inherit" },
                }}
              >
                Login
              </Button>
            </Box>
          ) : (
            <Box
              onSubmit={handleLdapLogin}
              component="form"
              sx={{
                width: "100%",
                maxWidth: "400px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TextField
                name="username"
                value={loginData?.username}
                onChange={handleChange}
                fullWidth
                label="Mail ID"
                variant="outlined"
                sx={{
                  backgroundColor: "#F5F6FA",
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  mb: 2,
                }}
              />
              <TextField
                name="password"
                value={loginData?.password}
                onChange={handleChange}
                fullWidth
                label="Domain Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                sx={{
                  backgroundColor: "#F5F6FA",
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  mb: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <img
                        onClick={handleShowPassword}
                        src={view}
                        alt="view password"
                        style={{ height: "10px", cursor: "pointer" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  "&:hover": { backgroundColor: PRIMARY_HOVER_COLOR },
                  borderRadius: "8px",
                  py: 1.5,
                  mb: { xs: 2, sm: 2, md: 3 },
                  fontSize: { xs: "14px", sm: "inherit" },
                }}
              >
                Login
              </Button>
            </Box>
          )}

          <div style={{ textAlign: "center" }}>
            <Button
              onClick={() => setAdminLogin(!adminLogin)}
              sx={{ textTransform: "none" }}
            >
              {adminLogin
                ? "Login with LDAP Credentials"
                : "Login with Admin Credentials"}
            </Button>
          </div>
        </Container>
      </Grid>
      {/* Snackbar */}
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
    </Grid>
  );
};

export default Login;
