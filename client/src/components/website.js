import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TimeAgo from "react-timeago";
import Chart from "./chart";
import Indicator from "./indicator";
import { Row, Cell } from "./table";
import { request } from "../api.js";

const goodStatusRatio = checks => {
  const goodStatusCount = checks.reduce(
    (count, check) => count + (check.status < 300 ? 1 : 0),
    0
  );
  return Math.round((goodStatusCount / checks.length) * 100);
};

const averageLatency = checks => {
  const sum = checks.reduce((sum, check) => sum + check.latency, 0);
  return (sum / checks.length / 1000).toFixed(1);
};

const StyledChart = styled(Chart)`
  height: 1.5rem;
`;

export default ({ website }) => {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    request(`/websites/${website.id}/checks`).then(setChecks);
  }, []);

  return (
    <Row>
      <Cell width="1">
        <Indicator status={website.status} />
      </Cell>
      <Cell alignment="left">
        <a href={website.url}>{website.url}</a>
      </Cell>
      <Cell collapse="collapse">
        {checks.length ? <StyledChart checks={checks} /> : "-"}
      </Cell>
      <Cell collapse="collapse">
        {checks.length ? goodStatusRatio(checks) + "%" : "-"}
      </Cell>
      <Cell collapse="collapse">
        {checks.length ? averageLatency(checks) + "s" : "-"}
      </Cell>
      <Cell collapse="wrap">
        <TimeAgo date={website.timestamp} />
      </Cell>
    </Row>
  );
};
