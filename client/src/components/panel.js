// import React from "react";
import styled from "styled-components";

export default styled.div`
  min-width: 20rem;
  position: relative;

  ${props => (props.sidebar ? `flex-basis: 0;` : null)}

  ${props =>
    props.theme === "negative"
      ? `background-color: #7e5c62; color: #fbf5ee;`
      : null}

  @media screen and (max-width: 768px) {
    min-width: 100%;
  }
`;
