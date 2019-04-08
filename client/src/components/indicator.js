// import React from "react";
import styled from "styled-components";
import { ReactComponent as Owl } from "../owl.svg";

const getStatusColor = status => {
  if (status === 200) {
    return "#8dc11f";
  }
  return "#e46b58";
};

export default styled(Owl)`
  color: ${props => getStatusColor(props.status)};
  height: 1.875rem;
  width: 1.875rem;
`;
