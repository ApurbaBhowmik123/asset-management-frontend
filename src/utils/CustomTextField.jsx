import { TextField } from "@mui/material";

export const CustomTextField = ({
  multiline = false,
  rows,
  select,
  children,
  error,
  helperText,
  ...props
}) => (
  <TextField
    fullWidth
    multiline={multiline}
    rows={rows}
    select={select}
    error={error}
    helperText={helperText}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          border: error
            ? "1px solid #d32f2f"
            : "1px solid #9e9e9e", 
        },
        "&.Mui-focused fieldset": {
          border: error
            ? "1px solid #d32f2f"
            : "1px solid #212121", 
        },
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        height: multiline ? "auto" : "36px",
        alignItems: "center",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      },
      "& .MuiOutlinedInput-root.Mui-focused": {
        boxShadow: error
          ? "0 0 0 2px rgba(211,47,47,0.25)"
          : "0 0 0 2px rgba(33,33,33,0.2)",
      },
      "& .MuiInputBase-input": {
        height: multiline ? "auto" : "20px",
        padding: multiline ? "12px" : "10px 14px",
      },
      "& .MuiFormHelperText-root": {
        marginLeft: "4px",
        marginTop: "4px",
        fontSize: "0.75rem",
      },
    }}
    {...props}
  >
    {children}
  </TextField>
);
