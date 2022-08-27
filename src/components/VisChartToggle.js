import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Link from "./Link";

export default function VisChartToggle({ value }) {
  return (
    <ToggleButtonGroup
      color="primary"
      value={value}
      exclusive
      aria-label="visualization toggle"
    >
      <ToggleButton
        value="artists"
        aria-label="Top Artists"
        component={Link}
        noLinkStyle
        href="/top-artists"
      >
        Top Artists
      </ToggleButton>
      <ToggleButton
        value="days"
        aria-label="Top Days"
        component={Link}
        noLinkStyle
        href="/top-days"
      >
        Top Days
      </ToggleButton>
      <ToggleButton
        value="songs"
        aria-label="Top Songs"
        component={Link}
        noLinkStyle
        href="/top-songs"
      >
        Top Songs
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
