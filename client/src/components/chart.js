import React from "react";
import styled from "styled-components";

const baseBarHeight = 80;
const barWidth = 8;
const barGap = 6;
const barStatusColors = {
  2: "#8dc11f",
  3: "#e46b58",
  4: "#e46b58",
  5: "#e46b58"
};

const Bar = ({ className, index, latency, maxLatency }) => {
  const h = (latency / maxLatency) * baseBarHeight;

  return (
    <rect
      className={className}
      width={barWidth}
      height={h}
      x={index * (barWidth + barGap)}
      y={baseBarHeight - h}
      rx={barWidth}
      ry={barWidth}
    />
  );
};

const StyledBar = styled(Bar)`
  fill: ${props => barStatusColors[Math.floor(props.status / 100)]};
`;

export default ({ className, checks }) => {
  const w = checks.length * (barWidth + barGap) - barGap;
  const viewBox = `0 0 ${w} ${baseBarHeight}`;
  const maxLatency = Math.max(...checks.map(check => check.latency));

  return (
    <svg className={className} role="img" viewBox={viewBox}>
      {checks.map((check, index) => (
        <StyledBar
          key={index}
          index={index}
          status={check.status}
          latency={check.latency}
          maxLatency={maxLatency}
        />
      ))}
    </svg>
  );
};