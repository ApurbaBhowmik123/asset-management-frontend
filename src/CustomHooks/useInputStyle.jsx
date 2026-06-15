import { useMemo } from "react";

const useInputStyle = () => {
  const inputLabelStyle = useMemo(() => ({
    fontWeight: "medium",
    marginBottom: "8px",
    // display: "block",
    fontSize: "12px",
    color: "#333",
  }));

  const textFieldStyles = useMemo(() => ({
    backgroundColor: "#f5f5f5",
    borderRadius: 1,
    "& .MuiInputBase-root": {
      height: "33px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "8px 12px",
      //   height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  }));

  const textFieldStylesWhiteBg = useMemo(() => ({
    backgroundColor: "white",
    borderRadius: 1,
    "& .MuiInputBase-root": {
      height: "33px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "8px 12px",
      //   height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  }));

  const selectStyles = {
    backgroundColor: "#f5f5f5",
    "& .MuiInputBase-root": { height: "40px" },
    "& .MuiSelect-select": {
      padding: "8px 12px",
      height: "100% !important",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    width: "100%",
  };
  const datePickerStyles = {
    ...textFieldStyles,
    width: "100%",
  };

  const textAreaStyle = useMemo(
    () => ({
      width: "100%",
      backgroundColor: "#f5f5f5",
      borderRadius: 3,
      border: "none",
      padding: "8px 12px",
      fontSize: "0.875rem",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: "80px",
      boxSizing: "border-box",
      outline: "none",
    }),
    []
  );

  // const textAreaStyle = useMemo(() => ({
  //   backgroundColor: "#f5f5f5",
  //   borderRadius: 1,
  //   "& .MuiInputBase-root": {
  //     // height: "33px",
  //     display: "flex",
  //     alignItems: "center",
  //   },
  //   "& .MuiInputBase-input": {
  //     fontSize: "0.875rem",
  //     padding: "8px 12px",
  //     //   height: "100%",
  //     boxSizing: "border-box",
  //     width: "100%",
  //   },
  //   "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  // }));

  const dateTextFieldStyles = {
    backgroundColor: "#f5f5f5",
    "& .MuiOutlinedInput-root": {
      height: "33px", 
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
    },
    // Target the inner input to adjust padding & height
    "& .MuiInputBase-input": {
      height: "33px",
      padding: "8px 14px !important", // Adjust padding to center text
    },
    // For the dropdown icon (adjust if needed)
    "& .MuiButtonBase-root": {
      color: "inherit",
      padding: "6px", // Optional: Adjust icon padding
    },
    // Remove box shadow when focused
    "& .MuiOutlinedInput-root.Mui-focused": {
      boxShadow: "none",
    },
  };

  return {
    inputLabelStyle,
    textFieldStyles,
    textFieldStylesWhiteBg,
    selectStyles,
    datePickerStyles,
    textAreaStyle,
    dateTextFieldStyles,
  };
};

export default useInputStyle;
