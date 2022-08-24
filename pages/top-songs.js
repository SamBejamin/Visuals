import * as React from "react";
import VisLayout from "../src/components/VisLayout";
import VisTopSongs from "../src/components/VisTopSongs";

export default function TopSongs() {
  return (
    <VisLayout vis="songs">
      <VisTopSongs />
    </VisLayout>
  );
}
