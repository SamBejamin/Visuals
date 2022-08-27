import React, { useEffect, useRef, useState } from "react";
import { useData } from "../context/DataContext";
import VisBarChartRace from "./VisBarChartRace";
import { Button, Stack } from "@mui/material";
import VisNoData from "./VisNoData";

export default function VisTopSongs() {
  const visContainer = useRef(null);
  const [replay, setReplay] = useState(false);

  const data = useData();
  const selectedData = data.find((d) => d.selected).data;

  const handleClick = () => {
    setReplay((replay) => !replay);
  };

  useEffect(() => {
    let chart;
    if (selectedData.length) {
      chart = new VisBarChartRace({
        el: visContainer.current,
        data: selectedData,
      });
    }
    return () => {
      if (chart) chart.unmount();
    };
  }, [selectedData, replay]);

  return selectedData.length ? (
    <Stack spacing={4}>
      <div>
        <Button variant="outlined" onClick={handleClick}>
          Replay
        </Button>
      </div>
      <div ref={visContainer}></div>
    </Stack>
  ) : (
    <VisNoData />
  );
}
