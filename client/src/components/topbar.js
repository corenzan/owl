// import React from "react";
import styled from "styled-components";

export default styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
  padding: 0 1.125rem;
  position: sticky;
  top: 0%;
  z-index: 10;

  ${props =>
    props.theme === "negative"
      ? `background-color: #7e5c62; color: #fbf5ee;`
      : `background-color: #efeaeb;`}

  > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
