import { useMemo, useState } from "react";
import * as d3 from "d3";
import { isNumeric, isValidDate } from "../../utils/valueCheck";
import defaultHistoryRaw from "../../data/StreamingHistory0.json";

export default function useStreamingHistory() {
  const [error, setError] = useState();
  const defaultHistory = useMemo(() => dataProcess(defaultHistoryRaw), []);

  const [history, setHistory] = useState(defaultHistory);

  const setHistoryRaw = (raw) => {
    try {
      const data = dataProcess(typeof raw == "string" ? JSON.parse(raw) : raw);
      setHistory(data);
      setError(undefined);
    } catch (e) {
      setError(e);
    }
  };

  return { history, setHistory, setHistoryRaw, error };
}

function dataProcess(raw) {
  if (!Array.isArray(raw)) {
    throw new Error();
  }

  const data = raw.map((d) => ({
    endTime: new Date(d.endTime),
    date: dateDay(d.endTime),
    artist: typeof d.artistName == "string" ? d.artistName.trim() : undefined,
    msPlayed:
      typeof d.msPlayed == "number"
        ? d.msPlayed
        : typeof d.msPlayed == "string" && isNumeric(d.msPlayed)
        ? d.msPlayed
        : undefined,
    track: typeof d.trackName == "string" ? d.trackName : undefined,
  }));

  return data;
}

function dateDay(value) {
  const time = typeof value == "string" ? new Date(value) : value;
  if (isValidDate(time)) {
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
  }

  return time;
}
