import { Select, styled } from "@mui/material";

export const StyledSelect = styled(Select)(() => ({
  backgroundColor: "#f9f9f9",
  borderRadius: 4,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: "33px",
    padding: "0 10px",
    "& fieldset": { border: "none" },
    "& input": { height: "15px", padding: 0 },
    "& select": { height: "15px", padding: 0 },
  },
}));