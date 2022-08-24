import * as React from "react";
import VisLayout from "../src/components/VisLayout";
import VisTopDays from "../src/components/VisTopDays";

export default function TopDays() {
  return (
    <VisLayout vis="days">
      <VisTopDays />
    </VisLayout>
  );
}
