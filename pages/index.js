import * as React from "react";
import { Box, Container } from "@mui/material";
import VisChartToggle from "../src/components/VisChartToggle";
import React, { useState, useRef } from "react";
import Typography from "@mui/material/Typography";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import css from "./UploadBox.module.css";

export default function Index() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <VisChartToggle />
        <p>Home Page</p> 
        <div className={css.uploadBox}>
          <DriveFolderUploadIcon />
          <Typography variant="h6">Upload Data</Typography>
        </div>
      </Box>
    </Container>
  );
}

