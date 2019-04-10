// import React from "react";
import styled from "styled-components";

const getStatusColor = status => {
  if (status === 200) {
    return "#8dc11f";
  }
  return "#e46b58";
};

export default styled.div`
  background-color: ${props => getStatusColor(props.status)};
  border-radius: 0.375rem;
  height: 1.25rem;
  width: 1rem;
`;
