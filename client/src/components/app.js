import React from "react";
import styled from "styled-components";
import TimeAgo from "react-timeago";
import Chart from "./chart";
import Indicator from "./indicator";
import { Table, Row, Cell } from "./table";

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

const Website = ({ website, checks }) => (
  <Row>
    <Cell width="1">
      <Indicator status={checks[checks.length - 1].status} />
    </Cell>
    <Cell alignment="left">
      <a href={website.url}>{website.url}</a>
    </Cell>
    <Cell collapse="collapse">
      <StyledChart checks={checks} />
    </Cell>
    <Cell collapse="collapse">{goodStatusRatio(checks)}%</Cell>
    <Cell collapse="collapse">~{averageLatency(checks)}s</Cell>
    <Cell collapse="wrap">
      <TimeAgo date={website.timestamp} />
    </Cell>
  </Row>
);

const StyledMain = styled.main`
  color: #3c342a;
  padding: 3rem 1.5rem;
`;

export default () => {
  const websites = [
    {
      id: "1",
      timestamp: "2019-04-05T03:31:32.990652Z",
      url: "http://www.google.com"
    },
    {
      id: "2",
      timestamp: "2019-04-05T03:32:13.134183Z",
      url: "http://www.uol.com.br"
    }
  ];
  // const [checks, setChecks] = useState({});
  const checks = {
    1: [
      { status: 200, latency: 900 },
      { status: 200, latency: 700 },
      { status: 200, latency: 800 },
      { status: 200, latency: 1200 },
      { status: 200, latency: 900 },
      { status: 200, latency: 700 },
      { status: 200, latency: 1300 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 900 },
      { status: 200, latency: 1500 },
      { status: 200, latency: 800 },
      { status: 200, latency: 900 },
      { status: 200, latency: 700 },
      { status: 200, latency: 800 },
      { status: 200, latency: 900 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 700 },
      { status: 200, latency: 1000 },
      { status: 500, latency: 5000 },
      { status: 200, latency: 900 }
    ],
    2: [
      { status: 200, latency: 900 },
      { status: 200, latency: 700 },
      { status: 200, latency: 1100 },
      { status: 200, latency: 1300 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 1200 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 1000 },
      { status: 200, latency: 900 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 700 },
      { status: 200, latency: 900 },
      { status: 200, latency: 900 },
      { status: 200, latency: 800 },
      { status: 200, latency: 700 },
      { status: 500, latency: 5000 },
      { status: 500, latency: 5000 },
      { status: 500, latency: 5000 },
      { status: 500, latency: 2300 }
    ]
  };

  for (let i = 10; i--; ) {
    websites.push({ ...websites[0] });
    websites.push({ ...websites[1] });
  }
  return (
    <StyledMain>
      <Table>
        {websites.map(website => (
          <Website
            key={website.id}
            website={website}
            checks={checks[website.id]}
          />
        ))}
      </Table>
    </StyledMain>
  );
};
