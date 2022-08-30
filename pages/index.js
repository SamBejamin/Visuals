import * as React from "react";
import { Box, Container } from "@mui/material";
import VisChartToggle from "../src/components/VisChartToggle";
import { useEffect, useState } from "react";
import { Snackbar, Alert, Grid, Stack, Typography } from "@mui/material/";
import UploadBox from "../components/UploadBox/UploadBox";
import TopArtist from "../components/Chart/TopArtist";
import DayDistribution from "../components/Chart/DayDistribution";
import WeekdayDistribution from "../components/Chart/WeekdayDistribution";
import MonthDistribution from "../components/Chart/MonthDistribution";
import useStreamingHistory from "../components/Chart/useStreamingHistory";

export default function Home() {
  const { history, setHistoryRaw, error } = useStreamingHistory();

  //uploaded
  const handleUploaded = (file) => {
    file
      .text()
      .then((text) => {
        setHistoryRaw(text);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  //Snackbar
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    setOpen(error ? true : false);
  }, [error]);

  return (
    <>
      <Stack
        direction="row"
        columnGap={"40px"}
        sx={{ minWidth: "1200px" }}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Stack rowGap={"40px"} sx={{ width: "300px" }}>
          <UploadBox accept=".json" onUploaded={handleUploaded} />
          <TopArtist data={history} />
        </Stack>
        <Grid container rowGap={10} columnGap={5}>
          <Grid item xs={12}>
            <Title title={"Day Distribution"} />
            <DayDistribution data={history} />
          </Grid>
          <Grid item xs={7}>
            <Title title={"Month Distribution"} />
            <MonthDistribution data={history} />
          </Grid>
          <Grid item xs={4}>
            <Title title={"Weekday Distribution"} />
            <WeekdayDistribution data={history} />
          </Grid>
        </Grid>
      </Stack>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        {error && (
          <Alert
            severity="error"
            onClose={handleClose}
          >{`${error.name}: ${error.message}`}</Alert>
        )}
      </Snackbar>
    </>
  );
}

const Title = ({ title }) => {
  return (
    <Typography color="primary" sx={{ marginBottom: "10px",fontWeight:"bold" }}>
      {title}
    </Typography>
  );
};


