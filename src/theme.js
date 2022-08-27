import { createTheme } from "@mui/material/styles";

const white = "#ffffff";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#1A4D9A",
      light: "#EEF1F7",
      contrastText: white,
    },
    secondary: {
      main: "#FCB13F",
      light: "#FEF1DC",
      contrastText: "#3D2D16",
    },
    light: {
      main: "#EAECEF",
      light: "#EAECEF",
      contrastText: "#3D2D16",
    },
    error: {
      main: "#E85065",
      dark: "#973442",
      contrastText: white,
    },
    warning: {
      main: "#E85065",
      dark: "#973442",
      contrastText: white,
    },
    info: {
      main: "#36B453",
      contrastText: white,
    },
    success: {
      main: "#36B453",
      contrastText: white,
    },
  },
  typography: {
    fontSize: 14,
  },
});

export default theme;
