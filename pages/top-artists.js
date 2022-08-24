import * as React from "react";
import VisLayout from "../src/components/VisLayout";
import VisTopArtists from "../src/components/VisTopArtists";

export default function TopArtists() {
  return (
    <VisLayout vis="artists">
      <VisTopArtists />
    </VisLayout>
  );
}
