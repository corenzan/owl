import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Moment from "react-moment";
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

const formattedDuration = duration => {
  if (duration > 3600) {
    return Math.round(duration / 3600) + "h";
  }
  return Math.round(duration / 60) + "m";
};

export default ({ website }) => {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    request(`/websites/${website.id}/checks`).then(setChecks);
  }, [website]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    request(`/websites/${website.id}/history`).then(setHistory);
  }, [website]);

  return (
    <>
      <ChartArea>
        <Chart height="40" checks={checks} />
      </ChartArea>
      <Table>
        {history.map(entry => (
          <Row key={entry.changed}>
            <Cell alignment="left">
              <Moment date={entry.changed} format="MMM D, H:ma" />
            </Cell>
            <Cell>{entry.status}</Cell>
            <Cell>{formattedDuration(entry.duration)}</Cell>
            <Cell alignment="right">{(entry.latency / 1000).toFixed(1)}s</Cell>
          </Row>
        ))}
      </Table>
    </>
  );
};
