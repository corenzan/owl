import React from "react";
import styled from "styled-components";

const barMaxHeight = 40;
const barMinHeight = 4;
const barWidth = 6;
const barGap = 1;

const maxLatency = 5000;

const StyledGroup = styled.g`
  fill: transparent;
  pointer-events: bounding-box;

  rect {
    transition: fill 0.125s ease-out;
  }

  .bad {
    fill: hsl(8, 72%, 62%);
  }
  .ok {
    fill: hsl(79, 72%, 44%);
  }

  &:hover {
    .bad {
      /* fill: hsl(8, 82%, 72%); */
      fill: #996459;
    }
    .ok {
      /* fill: hsl(79, 82%, 54%); */
      fill: #996459;
    }
  }
`;

const Bar = ({ index, status, latency }) => {
  const height = Math.round(
    (latency / maxLatency) * (barMaxHeight - barMinHeight) + barMinHeight
  );
  const x = index * barWidth;
  const y = Math.round(barMaxHeight - height);
  const cornerRadius = barWidth / 2;
  return (
    <StyledGroup>
      <title>
        {status} — {(latency / 1000).toFixed(2)}s
      </title>
      <rect width={barWidth} height={barMaxHeight} x={x} />
      <rect
        className="gap"
        width={barWidth}
        height={height}
        x={x}
        y={y}
        rx={cornerRadius}
        ry={cornerRadius}
      />
      <rect
        className={status === 200 ? "bar ok" : "bar bad"}
        width={barWidth - barGap * 2}
        height={height - barGap * 2}
        x={x + barGap}
        y={y + barGap}
        rx={cornerRadius - barGap}
        ry={cornerRadius - barGap}
      />
    </StyledGroup>
  );
};

export default ({ className, height, checks }) => {
  const w = checks.length * barWidth;
  const viewBox = `0 0 ${w} ${barMaxHeight}`;

  return (
    <svg
      className={className}
      role="img"
      viewBox={viewBox}
      height={height || "auto"}
    >
      {checks.map((check, index) => (
        <Bar
          key={index}
          index={index}
          status={check.status}
          latency={check.latency}
        />
      ))}
    </svg>
  );
};
