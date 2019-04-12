import React from "react";
import moment from "moment";
import c from "classnames";

import style from "./style.module.css";

const barMaxHeight = 40;
const barMinHeight = 4;
const barWidth = 6;
const barGap = 1;

const maxLatency = 5000;

const Bar = ({ index, created, status, latency }) => {
  const height = Math.round(
    (latency / maxLatency) * (barMaxHeight - barMinHeight) + barMinHeight
  );
  const x = index * barWidth;
  const y = Math.round(barMaxHeight - height);
  const cornerRadius = barWidth / 2;
  return (
    <g className={style.hitbox}>
      <title>
        {moment(created).format("MMM DD Y, HH:mma")} — {status} —{" "}
        {(latency / 1000).toFixed(2)}s
      </title>
      <rect width={barWidth} height={barMaxHeight} x={x} />
      <rect
        className={style.gap}
        width={barWidth}
        height={height}
        x={x}
        y={y}
        rx={cornerRadius}
        ry={cornerRadius}
      />
      <rect
        className={c(style.bar, { [style.red]: status !== 200 })}
        width={barWidth - barGap * 2}
        height={height - barGap * 2}
        x={x + barGap}
        y={y + barGap}
        rx={cornerRadius - barGap}
        ry={cornerRadius - barGap}
      />
    </g>
  );
};

export default ({ height, checks }) => {
  const w = checks.length * barWidth;
  const viewBox = `0 0 ${w} ${barMaxHeight}`;

  return (
    <svg role="img" viewBox={viewBox} height={height || "auto"}>
      {checks.map((check, index) => (
        <Bar
          key={index}
          index={index}
          created={check.created}
          status={check.status}
          latency={check.latency}
        />
      ))}
    </svg>
  );
};
