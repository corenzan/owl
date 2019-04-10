import React from "react";
import styled, { ThemeProvider } from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
`;

export const Table = ({ theme, children }) => (
  <ThemeProvider theme={{ default: theme || "regular" }}>
    <StyledTable>
      <tbody>{children}</tbody>
    </StyledTable>
  </ThemeProvider>
);

export const Row = styled.tr`
  ${props =>
    props.isSelected
      ? `background-color: #996459;`
      : `&:nth-child(2n + 1) {
    background-color: ${
      props.theme.default === "negative" ? "#6f5156" : "#fdfaf7"
    };
  }`};
`;

const getCellCollapseDisplayValue = collapse => {
  switch (collapse) {
    case "collapse":
      return "none";
    case "wrap":
      return "table-cell";
    default:
      return "table-cell";
  }
};

export const Cell = styled.td`
  height: 3.75rem;
  line-height: 1.25;
  overflow: hidden;
  padding: 0 0.75rem;
  text-align: ${props => props.alignment || "center"};
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
  width: ${props => props.width || "auto"};

  &:first-child {
    padding-left: 1.5rem;
  }

  &:last-child {
    padding-right: 1.5rem;
  }

  small {
    display: block;
    line-height: 1.5;
    opacity: 0.75;
  }

  @media screen and (max-width: 768px) {
    display: ${props => getCellCollapseDisplayValue(props.collapse)};
  }
`;
