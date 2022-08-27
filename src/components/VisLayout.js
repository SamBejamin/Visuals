import React from "react";
import { Box, Container, Stack } from "@mui/material";
import VisChartToggle from "./VisChartToggle";
import VisDataToggle from "./VisDataToggle";

export default function VisLayout({ vis, children }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <Stack spacing={4}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <VisChartToggle value={vis} />
            <VisDataToggle />
          </Box>
          <div className="vis">{children}</div>
        </Stack>
      </Box>
    </Container>
  );
}
