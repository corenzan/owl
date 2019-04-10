import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Time from "react-time";
import { Table, Row, Cell } from "./table";
import Chart from "./chart";
import { request } from "../api.js";

const ChartArea = styled.div`
  padding: 1.5rem;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default ({ website }) => {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    request(`/websites/${website.id}/checks`).then(checks => {
      setChecks(checks.slice(checks.length - 144));
    });
  }, [website]);

  return (
    <>
      <ChartArea>
        <Chart height="40" checks={checks} />
      </ChartArea>
      <Table>
        {checks.map(check => (
          <Row key={check.id}>
            <Cell alignment="left">
              <Time
                value={check.timestamp}
                format="MMM D, H:ma"
                titleFormat="llll"
              />
            </Cell>
            <Cell>{check.status}</Cell>
            <Cell>0</Cell>
            <Cell alignment="right">0</Cell>
          </Row>
        ))}
      </Table>
    </>
  );
};
