import React from "react";
import moment from "moment";
import c from "classnames";

import style from "./style.module.css";

const maxLatency = 5000;

const Bar = ({ index, check, minHeight, maxHeight, maxWidth, stroke }) => {
  const outerMaxHeight = maxHeight;
  const outerHeight = Math.round(
    (check.duration / maxLatency) * (maxHeight - minHeight) + minHeight
  );
  const outerWidth = maxWidth;
  const outerRadius = Math.round(outerWidth / 2);
  const innerHeight = outerHeight - stroke * 2;
  const innerWidth = outerWidth - stroke * 2;
  const innerMaxHeight = maxHeight - stroke * 2;
  const innerRadius = Math.round(innerWidth / 2);
  const outerX = index * outerWidth;
  const outerY = Math.round(outerMaxHeight - outerHeight);
  const innerX = outerX + stroke;
  const innerY = outerY + stroke;

  return (
    <g>
      <rect
        width={outerWidth}
        height={outerMaxHeight}
        x={outerX}
        fill="transparent"
      />
      <rect
        width={outerWidth}
        height={outerHeight}
        x={outerX}
        y={outerY}
        rx={outerRadius}
        ry={outerRadius}
        fill="white"
      />
      <rect
        width={innerWidth}
        height={innerHeight}
        x={innerX}
        y={innerY}
        rx={innerRadius}
        ry={innerRadius}
        fill="blue"
      />
    </g>
  );
};

export default ({ height, checks }) => {
  const minHeight = 2;
  const maxWidth = 6;
  const barStroke = 1;
  const w = checks.length * maxWidth;
  const viewBox = `0 0 ${w} ${height}`;

  return (
    <svg role="img" viewBox={viewBox} height={height || "auto"}>
      {checks.map((check, index) => (
        <Bar
          key={index}
          index={index}
          check={check}
          minHeight={minHeight}
          maxHeight={height}
          maxWidth={maxWidth}
          stroke={barStroke}
        />
      ))}
    </svg>
  );
};
