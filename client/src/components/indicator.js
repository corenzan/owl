// import React from "react";
import styled from "styled-components";
import { ReactComponent as Owl } from "../owl.svg";

const statusColors = {
  2: "#8dc11f",
  3: "#e46b58",
  4: "#e46b58",
  5: "#e46b58"
};

export default styled(Owl)`
  color: ${props => statusColors[Math.floor(props.status / 100)]};
  height: 1.875rem;
  width: 1.875rem;
`;
