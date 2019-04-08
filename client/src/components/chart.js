import React from "react";
import styled from "styled-components";

const baseBarHeight = 80;
const barWidth = 8;
const barGap = 6;
const getStatusColor = status => {
  if (status === 200) {
    return "#8dc11f";
  }
  return "#e46b58";
};

const maxLatency = 5000;

const Bar = ({ className, index, latency }) => {
  let h = (latency / maxLatency) * baseBarHeight;
  if (isNaN(h)) h = 0;

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
  fill: ${props => getStatusColor(props.status)};
`;

export default ({ className, checks }) => {
  const w = checks.length * (barWidth + barGap) - barGap;
  const viewBox = `0 0 ${w} ${baseBarHeight}`;

  return (
    <svg className={className} role="img" viewBox={viewBox}>
      {checks.map((check, index) => (
        <StyledBar
          key={index}
          index={index}
          status={check.status}
          latency={check.latency}
        />
      ))}
    </svg>
  );
};
