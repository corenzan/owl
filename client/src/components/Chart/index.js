import React from "react";
import moment from "moment";
import c from "classnames";

import style from "./style.module.css";

const maxDuration = 5000;
const height = 100;
const barWidth = 10;
const barStroke = 2;

const Bar = ({ index, check }) => {
    const x = barWidth * index;
    const y = check.duration / maxDuration;

    const dnsRatio = check.breakdown.dns / check.duration;
    const connectionRatio = check.breakdown.connection / check.duration;
    const tlsRatio = check.breakdown.tls / check.duration;
    const waitRatio = check.breakdown.wait / check.duration;

    return (
        <g>
            <title>
                DNS: {check.breakdown.dns}ms, Connection: {check.breakdown.connection}ms, TLS: {check.breakdown.tls}ms, Wait:{" "}
                {check.breakdown.wait}ms, Total: {check.duration}ms, Status: {check.statusCode}
            </title>
            <defs>
                <linearGradient id={"fill" + index} x2="0" y2="1">
                    <stop offset={0 + "%"} stopColor="#cae00d" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#cae00d" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#ffce00" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#ffce00" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#ff9200" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#ff9200" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#f15524" />
                    <stop offset={100 + "%"} stopColor="#f15524" />
                </linearGradient>
            </defs>
            <rect
                width={barWidth - barStroke * 2}
                height={height * y}
                x={x + barStroke}
                y={height * (1 - y)}
                fill={"url(#fill" + index + ")"}
                className={style.bar}
            />
            <rect width={barWidth} height={height} x={x} fill="transparent" className={style.overlay} />
        </g>
    );
};

export default ({ checks }) => {
    const width = checks.length * barWidth;
    const viewBox = `0 0 ${width} ${height}`;

    return (
        <svg role="img" viewBox={viewBox} height={height}>
            {checks.map((check, index) => (
                <Bar key={index} index={index} check={check} />
            ))}
        </svg>
    );
};
