import React from "react";
import { useData, useDataDispatch } from "../context/DataContext";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function VisDataToggle() {
  const data = useData();
  const dispatch = useDataDispatch();

  const selectedId = data.find((d) => d.selected).id;

  const handleChange = (event, newId) => {
    if (newId !== null && newId !== selectedId) {
      dispatch({
        type: "select",
        id: newId,
      });
    }
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={selectedId}
      exclusive
      onChange={handleChange}
      aria-label="data toggle"
    >
      <ToggleButton value="user" aria-label="your data">
        Your Data
      </ToggleButton>
      <ToggleButton value="community" aria-label="community data">
        Community Data
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
