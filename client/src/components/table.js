import React from "react";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
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
      return "table-cell";
    default:
      return "table-cell";
  }
};

const StyledCell = styled.td`
  height: 3rem;
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
    border-radius: 3rem 0 0 3rem;
  }

  &:last-child {
    padding-right: 1.5rem;
    border-radius: 0 3rem 3rem 0;
  }

  small {
    display: none;
  }

  @media screen and (max-width: 768px) {
    display: ${props => getCellCollapseDisplayValue(props.collapse)};
    height: 3.75rem;

    &:first-child {
      border-radius: 0;
    }

    &:last-child {
      border-radius: 0;
    }

    small {
      display: block;
      line-height: 1.5;
    }
  }
`;

export const Cell = ({ children, ...props }) => (
  <StyledCell {...props}>{children}</StyledCell>
);
