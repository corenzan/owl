import React from "react";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
`;

export const Table = ({ children }) => (
  <StyledTable>
    <tbody>{children}</tbody>
  </StyledTable>
);

const StyledRow = styled.tr`
  &:nth-child(2n + 1) {
    background-color: #fbfaf9;
  }
`;

export const Row = ({ children }) => <StyledRow>{children}</StyledRow>;

const getCellCollapseDisplayValue = collapse => {
  switch (collapse) {
    case "collapse":
      return "none";
    case "wrap":
      return "inline-block";
    default:
      return "table-cell";
  }
};

const StyledCell = styled.td`
  height: 3rem;
  line-height: 1.25;
  padding: 0 0.75rem;
  text-align: ${props => props.alignment || "center"};
  vertical-align: middle;
  width: ${props => props.width || "auto"};

  &:first-child {
    padding-left: 1.5rem;
    border-radius: 3rem 0 0 3rem;
  }

  &:last-child {
    padding-right: 1.5rem;
    border-radius: 0 3rem 3rem 0;
  }

  @media screen and (max-width: 768px) {
    display: ${props => getCellCollapseDisplayValue(props.collapse)};
  }
`;

export const Cell = ({ width, alignment, collapse, children }) => (
  <StyledCell width={width} alignment={alignment} collapse={collapse}>
    {children}
  </StyledCell>
);
