import React, { useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import VisCollapsibleTree from "./VisCollapsibleTree";
import VisNoData from "./VisNoData";

export default function VisTopDays() {
  const visContainer = useRef(null);

  const data = useData();
  const selectedData = data.find((d) => d.selected).data;

  useEffect(() => {
    let chart;
    if (selectedData.length) {
      chart = new VisCollapsibleTree({
        el: visContainer.current,
        data: selectedData,
      });
    }
    return () => {
      if (chart) chart.unmount();
    };
  }, [selectedData]);

  return selectedData.length ? <div ref={visContainer}></div> : <VisNoData />;
}
