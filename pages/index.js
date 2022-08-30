import * as React from "react";
import { Box, Container } from "@mui/material";
import VisChartToggle from "../src/components/VisChartToggle";

export default function Index() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <VisChartToggle />
        <p>Home Page</p>
      </Box>
    </Container>
  );
}

