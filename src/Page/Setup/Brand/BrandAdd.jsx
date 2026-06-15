// // import React, { useState } from 'react';
// // import {
// //   Box,
// //   Typography,
// //   TextField,
// //   Checkbox,
// //   Button,
// //   IconButton,
// //   Snackbar,
// //   Alert,
// // } from '@mui/material';
// // import AddIcon from '@mui/icons-material/Add';
// // import { ArrowLeft } from 'lucide-react';
// // import Deleteicon1 from '../../../assets/EmployeeImages/Vector (1).png';
// // import { baseUrl } from '../../Api';
// // import axios from 'axios';

// // const BrandAdd = ({ onBack }) => {
// //   const [brands, setBrands] = useState([{ brandName: '', status: true }]);
// //   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

// //  const token =
// //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMSIsInJvbGUiOltudWxsXX0sImlhdCI6MTc1MzM1MjMwMywiZXhwIjoxNzU1OTQ0MzAzfQ.wArzNRQ0EqzXXPfsUt-2PgouojJqU7baTvCrG4PqEGY';

// //   const handleAddRow = () => {
// //     setBrands([...brands, { brandName: '', status: true }]);
// //   };

// //   const handleRemoveRow = (index) => {
// //     const updated = [...brands];
// //     updated.splice(index, 1);
// //     setBrands(updated);
// //   };

// //   const handleChange = (index, field, value) => {
// //     const updated = [...brands];
// //     updated[index][field] = value;
// //     setBrands(updated);
// //   };

// // const handleSave = async () => {
// //   try {
// //     const payload = brands.map((brand) => ({
// //       name: brand.brandName,
// //       status: brand.status,
// //     }));

// //     const response = await axios.post(
// //       `${baseUrl}/super-admin/brands/create`,
// //       payload,
// //       {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           'Content-Type': 'application/json',
// //         },
// //       }
// //     );

// //     if (response.data.status) {
// //       setSnackbar({
// //         open: true,
// //         message: response.data.message,
// //         severity: 'success',
// //       });

// //       // Go back to the BrandList view after 1 second
// //       setTimeout(() => {
// //         onBack();
// //       }, 1000);
// //     } else {
// //       setSnackbar({
// //         open: true,
// //         message: 'Something went wrong',
// //         severity: 'error',
// //       });
// //     }
// //   } catch (error) {
// //     console.error('Error saving brands:', error);
// //     setSnackbar({
// //       open: true,
// //       message: 'Failed to save brands',
// //       severity: 'error',
// //     });
// //   }
// // };


// //   return (
// //     <Box sx={{ minHeight: '100vh' }}>
// //       {/* Header */}
// //       <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
// //         <Box display="flex" alignItems="center">
// //           <IconButton onClick={onBack}>
// //             <ArrowLeft />
// //           </IconButton>
// //           <Typography fontWeight={600} fontSize={16} variant="subtitle1">
// //             Add Multiple Brands
// //           </Typography>
// //         </Box>
// //         <Button className="Global-Button" startIcon={<AddIcon />} onClick={handleAddRow}>
// //           Add Brand Row
// //         </Button>
// //       </Box>

// //       {/* Card */}
// //       <Box
// //         sx={{
// //           backgroundColor: '#fff',
// //           borderRadius: 2,
// //           p: 3,
// //           boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
// //         }}
// //       >
// //         {brands.map((brand, index) => (
// //           <Box
// //             key={index}
// //             sx={{
// //               border: '1px solid #dee2e6',
// //               borderRadius: 2,
// //               p: 2,
// //               mb: 2,
// //             }}
// //           >
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //               {/* Brand # */}
// //               <Box sx={{ width: '10%' }}>
// //                 <Typography fontWeight={600}>{`Brand #${index + 1}`}</Typography>
// //               </Box>

// //               {/* Brand Name */}
// //               <Box sx={{ width: '60%' }}>
// //                 <Typography fontWeight={500} fontSize={13} mb={0.5}>
// //                   Brand Name
// //                 </Typography>
// //                 <TextField
// //                   fullWidth
// //                   size="small"
// //                   placeholder="Example Brand"
// //                   value={brand.brandName}
// //                   onChange={(e) => handleChange(index, 'brandName', e.target.value)}
// //                   InputProps={{
// //                     sx: {
// //                       backgroundColor: '#f1f1ff',
// //                       borderRadius: 1,
// //                       '& fieldset': { border: 'none' },
// //                     },
// //                   }}
// //                 />
// //               </Box>

// //               {/* Status and Delete */}
// //               <Box
// //                 sx={{
// //                   width: '20%',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'space-between',
// //                 }}
// //               >
// //                 <Box>
// //                   <Typography fontWeight={500} fontSize={13} mb={0.5}>
// //                     Status
// //                   </Typography>
// //                   <Box display="flex" alignItems="center">
// //                     <Checkbox
// //                       checked={brand.status}
// //                       color="success"
// //                       onChange={(e) => handleChange(index, 'status', e.target.checked)}
// //                     />
// //                     <Typography fontWeight={500}>Active</Typography>
// //                   </Box>
// //                 </Box>

// //                 {brands.length > 1 && (
// //                   <IconButton
// //                     onClick={() => handleRemoveRow(index)}
// //                     color="error"
// //                     sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
// //                   >
// //                     <Box component="img" src={Deleteicon1} alt="delete" sx={{ width: 16, height: 16 }} />
// //                   </IconButton>
// //                 )}
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {/* Save Button */}
// //         <Box mt={3} display="flex" justifyContent="center">
// //           <Button className="Global-Button2" onClick={handleSave}>
// //             Save All
// //           </Button>
// //         </Box>
// //       </Box>

// //       {/* Snackbar */}
// //       <Snackbar
// //         open={snackbar.open}
// //         autoHideDuration={4000}
// //         onClose={() => setSnackbar({ ...snackbar, open: false })}
// //         anchorOrigin={{ vertical: "top", horizontal: "center" }}
// //       >
// //         <Alert
// //           onClose={() => setSnackbar({ ...snackbar, open: false })}
// //           severity={snackbar.severity}
// //           variant="filled"
// //           sx={{ width: '100%' }}
// //         >
// //           {snackbar.message}
// //         </Alert>
// //       </Snackbar>
// //     </Box>
// //   );
// // };

// // export default BrandAdd;



// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Checkbox,
//   Button,
//   IconButton,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import { ArrowLeft } from 'lucide-react';
// import Deleteicon1 from '../../../assets/EmployeeImages/Vector (1).png';
// import { baseUrl } from '../../Api';
// import axios from 'axios';

// const BrandAdd = ({ onBack, onSuccess }) => {
//   const [brands, setBrands] = useState([{ brandName: '', status: true }]);
//   const [errors, setErrors] = useState([]);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success',
//   });

//   const token =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMSIsInJvbGUiOltudWxsXX0sImlhdCI6MTc1MzM1MjMwMywiZXhwIjoxNzU1OTQ0MzAzfQ.wArzNRQ0EqzXXPfsUt-2PgouojJqU7baTvCrG4PqEGY';

//   const handleAddRow = () => {
//     setBrands([...brands, { brandName: '', status: true }]);
//     setErrors([...errors, {}]);
//   };

//   const handleRemoveRow = (index) => {
//     const updatedBrands = [...brands];
//     updatedBrands.splice(index, 1);
//     setBrands(updatedBrands);

//     const updatedErrors = [...errors];
//     updatedErrors.splice(index, 1);
//     setErrors(updatedErrors);
//   };

//   const handleChange = (index, field, value) => {
//     const updatedBrands = [...brands];
//     updatedBrands[index][field] = value;
//     setBrands(updatedBrands);

//     const updatedErrors = [...errors];
//     if (!updatedErrors[index]) updatedErrors[index] = {};
//     updatedErrors[index][field] = '';
//     setErrors(updatedErrors);
//   };

//   const validateBrands = () => {
//     const newErrors = [];

//     brands.forEach((brand, index) => {
//       const fieldErrors = {};
//       if (!brand.brandName.trim()) {
//         fieldErrors.brandName = 'Brand name is required';
//       }
//       newErrors[index] = fieldErrors;
//     });

//     setErrors(newErrors);
//     return newErrors.every((err) => Object.keys(err).length === 0);
//   };

//   const handleSave = async () => {
//     if (!validateBrands()) {
//       setSnackbar({
//         open: true,
//         message: 'Brand name is required.',
//         severity: 'error',
//       });
//       return;
//     }

//     try {
//       const payload = brands.map((b) => ({
//         name: b.brandName,
//         status: b.status,
//       }));

//       const response = await axios.post(`${baseUrl}/super-admin/brands/create`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.data.status) {
//         setSnackbar({
//           open: true,
//           message: response.data.message,
//           severity: 'success',
//         });

//         setTimeout(() => {
//            onSuccess();  
//           onBack();
//         }, 1000);
//       } else {
//         setSnackbar({
//           open: true,
//           message: 'Something went wrong',
//           severity: 'error',
//         });
//       }
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.status === 422 &&
//         error.response.data.status === 'validation_error'
//       ) {
//         const errorData = error.response.data.data;
//         const updatedErrors = [...errors];

//         Object.keys(errorData).forEach((fieldKey) => {
//           const match = fieldKey.match(/\[(\d+)\]\.name/);
//           if (match) {
//             const index = parseInt(match[1], 10);
//             if (!updatedErrors[index]) updatedErrors[index] = {};
//             updatedErrors[index].brandName = errorData[fieldKey][0];
//           }
//         });

//         setErrors(updatedErrors);

//         setSnackbar({
//           open: true,
//           message: error.response.data.message || 'Validation error',
//           severity: 'error',
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: 'Failed to save brands',
//           severity: 'error',
//         });
//       }
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh' }}>
//       {/* Header */}
//       <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
//         <Box display="flex" alignItems="center">
//           <IconButton onClick={onBack}>
//             <ArrowLeft />
//           </IconButton>
//           <Typography fontWeight={600} fontSize={16}>
//             Add Multiple Brands
//           </Typography>
//         </Box>
//         <Button className="Global-Button" startIcon={<AddIcon />} onClick={handleAddRow}>
//           Add Brand Row
//         </Button>
//       </Box>

//       {/* Card */}
//       <Box
//         sx={{
//           backgroundColor: '#fff',
//           borderRadius: 2,
//           p: 3,
//           boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
//         }}
//       >
//         {brands.map((brand, index) => (
//           <Box
//             key={index}
//             sx={{
//               border: '1px solid #dee2e6',
//               borderRadius: 2,
//               p: 2,
//               mb: 2,
//             }}
//           >
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Box sx={{ width: '10%' }}>
//                 <Typography fontWeight={600}>{`Brand #${index + 1}`}</Typography>
//               </Box>

//               {/* Brand Name */}
//               <Box sx={{ width: '60%' }}>
//                 <Typography fontWeight={500} fontSize={13} mb={0.5}>
//                   Brand Name
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Example Brand"
//                   value={brand.brandName}
//                   onChange={(e) => handleChange(index, 'brandName', e.target.value)}
//                   error={!!errors[index]?.brandName}
//                   helperText={errors[index]?.brandName}
//                   InputProps={{
//                     sx: {
//                       backgroundColor: '#f1f1ff',
//                       borderRadius: 1,
//                       '& fieldset': { border: 'none' },
//                     },
//                   }}
//                 />
//               </Box>

//               {/* Status & Delete */}
//               <Box
//                 sx={{
//                   width: '20%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                 }}
//               >
//                 <Box>
//                   <Typography fontWeight={500} fontSize={13} mb={0.5}>
//                     Status
//                   </Typography>
//                   <Box display="flex" alignItems="center">
//                     <Checkbox
//                       checked={brand.status}
//                       color="success"
//                       onChange={(e) => handleChange(index, 'status', e.target.checked)}
//                     />
//                     <Typography fontWeight={500}>Active</Typography>
//                   </Box>
//                 </Box>
//                 {brands.length > 1 && (
//                   <IconButton
//                     onClick={() => handleRemoveRow(index)}
//                     color="error"
//                     sx={{ p: 1 }}
//                   >
//                     <Box component="img" src={Deleteicon1} alt="delete" sx={{ width: 16, height: 16 }} />
//                   </IconButton>
//                 )}
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         {/* Save Button */}
//         <Box mt={3} display="flex" justifyContent="center">
//           <Button className="Global-Button2" onClick={handleSave}>
//             Save All
//           </Button>
//         </Box>
//       </Box>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default BrandAdd;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ArrowLeft } from 'lucide-react';
import Deleteicon1 from '../../../assets/EmployeeImages/Vector (1).png';
import { baseUrl } from '../../Api';
import axios from 'axios';
import { CustomTextField } from '../../../utils/CustomTextField';

const BrandAdd = ({ onBack, onSuccess, editingBrand, onUpdate }) => {
  const [brands, setBrands] = useState([{ brandName: '', status: true }]);
  const [errors, setErrors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });


  const token = localStorage.getItem('token');

  useEffect(() => {
    if (editingBrand) {
      setBrands([{ 
        brandName: editingBrand.name, 
        status: editingBrand.status 
      }]);
    } else {
      setBrands([{ brandName: '', status: true }]);
    }
    setErrors([]);
  }, [editingBrand]);

  const handleAddRow = () => {
    setBrands([...brands, { brandName: '', status: true }]);
    setErrors([...errors, {}]);
  };

  const handleRemoveRow = (index) => {
    const updatedBrands = [...brands];
    updatedBrands.splice(index, 1);
    setBrands(updatedBrands);

    const updatedErrors = [...errors];
    updatedErrors.splice(index, 1);
    setErrors(updatedErrors);
  };

  const handleChange = (index, field, value) => {
    const updatedBrands = [...brands];
    updatedBrands[index][field] = value;
    setBrands(updatedBrands);

    const updatedErrors = [...errors];
    if (!updatedErrors[index]) updatedErrors[index] = {};
    updatedErrors[index][field] = '';
    setErrors(updatedErrors);
  };

  const validateBrands = () => {
    const newErrors = [];

    brands.forEach((brand, index) => {
      const fieldErrors = {};
      if (!brand.brandName.trim()) {
        fieldErrors.brandName = 'Brand name is required';
      }
      newErrors[index] = fieldErrors;
    });

    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

 const handleSave = async () => {
  if (!validateBrands()) {
    setSnackbar({
      open: true,
      message: 'Brand name is required.',
      severity: 'error',
    });
    return;
  }

  if (editingBrand) {
    try {
      // Prepare the payload with all required fields
      const payload = {
        name: brands[0].brandName,
        status: brands[0].status,
        id: editingBrand.id // Make sure to include the id in the payload if backend needs it
      };

      const response = await axios.put(
        `${baseUrl}/super-admin/brands/update/${editingBrand.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success',
        });

        setTimeout(() => {
          onSuccess();
          onBack();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to update brand',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating brand',
        severity: 'error',
      });
    }
  } else {
    // Rest of the create logic remains the same
    try {
      const payload = brands.map((b) => ({
        name: b.brandName,
        status: b.status,
      }));

      const response = await axios.post(`${baseUrl}/super-admin/brands/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success',
        });

        setTimeout(() => {
          onSuccess();
          onBack();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: response.data.errorResponse.message,
          severity: 'error',
        });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 422 &&
        error.response.data.status === 'validation_error'
      ) {
        const errorData = error.response.data.data;
        const updatedErrors = [...errors];

        Object.keys(errorData).forEach((fieldKey) => {
          const match = fieldKey.match(/\[(\d+)\]\.name/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (!updatedErrors[index]) updatedErrors[index] = {};
            updatedErrors[index].brandName = errorData[fieldKey][0];
          }
        });

        setErrors(updatedErrors);

        setSnackbar({
          open: true,
          message: error.response.data.message || 'Validation error',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to save brands',
          severity: 'error',
        });
      }
    }
  }
};

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <Typography fontWeight={600} fontSize={16}>
            {editingBrand ? 'Edit Brand' : 'Add Multiple Brands'}
          </Typography>
        </Box>
        {!editingBrand && (
          <Button className="Global-Button" startIcon={<AddIcon />} onClick={handleAddRow}>
            Add Brand Row
          </Button>
        )}
      </Box>

      {/* Card */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          p: 3,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {brands.map((brand, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #dee2e6',
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: '10%' }}>
                <Typography fontWeight={600}>{`Brand #${index + 1}`}</Typography>
              </Box>

              {/* Brand Name */}
              <Box sx={{ width: '60%' }}>
                <Typography fontWeight={500} fontSize={13} mb={0.5}>
                  Brand Name
                </Typography>
                <CustomTextField
                  fullWidth
                  size="small"
                  placeholder="Example Brand"
                  value={brand.brandName}
                  onChange={(e) => handleChange(index, 'brandName', e.target.value)}
                  error={!!errors[index]?.brandName}
                  helperText={errors[index]?.brandName}
                  InputProps={{
                    sx: {
                      backgroundColor: '#f1f1ff',
                      borderRadius: 1,
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>

              {/* Status & Delete */}
              <Box
                sx={{
                  width: '20%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography fontWeight={500} fontSize={13} mb={0.5}>
                    Status
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={brand.status}
                      color="success"
                      onChange={(e) => handleChange(index, 'status', e.target.checked)}
                    />
                    <Typography fontWeight={500}>Active</Typography>
                  </Box>
                </Box>
                {brands.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveRow(index)}
                    color="error"
                    sx={{ p: 1 }}
                  >
                    <Box component="img" src={Deleteicon1} alt="delete" sx={{ width: 16, height: 16 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        ))}

        {/* Save Button */}
        <Box mt={3} display="flex" justifyContent="center">
          <Button className="Global-Button2" onClick={handleSave}>
            {editingBrand ? 'Update Brand' : 'Save All'}
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandAdd;