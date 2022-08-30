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
      </Box>
    </Container>
  );
}

export default function UploadBox({ accept = ".json", onUploaded = () => {} }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef();

  // handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    switch (e.type) {
      case "dragenter":
        setIsDragActive(true);
        break;
      case "dragover":
        setIsDragActive(true);
        break;
      case "dragleave":
        setIsDragActive(false);
        break;

      default:
        break;
    }
  };

  // triggers when file is dropped
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onUploaded(file);
    }
  };

  // triggers when file is selected with click
  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploaded(file);
    }
  };
  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div>
      <Typography
        variant="h5"
        color="primary"
        sx={{ marginBottom: "8px", fontWeight: "bold" }}
      >
        <DriveFolderUploadIcon /> Upload
      </Typography>
      <form
        className={css.wrapper}
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          id={css.file_input}
          className={css.file_input}
          type="file"
          multiple={false}
          onChange={handleInputChange}
          accept={accept}
        />
        <label
          htmlFor={css.file_input}
          className={
            isDragActive
              ? [css.file_input_label, css.drag_active].join(" ")
              : css.file_input_label
          }
        >
          <div>
            <p>Drag & Drop</p>
            <p>Your Streaming History Json file</p>
            <button
              className={css.upload_button}
              onClick={onButtonClick}
            ></button>
          </div>
        </label>
        {isDragActive && (
          <div
            className={css.drag_file_element}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          ></div>
        )}
      </form>
    </div>
  );
}
