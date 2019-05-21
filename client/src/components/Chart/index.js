import React, { useState, useRef, useEffect } from "react";
import c from "classnames";

import style from "./style.module.css";
import moment from "moment";

const maxLatency = 5000;
const height = 96;
const barWidth = 12;
const barStroke = 2;

const Bar = ({ index, check }) => {
    const x = barWidth * index;
    const y = check.latency.total / maxLatency;

    const dnsRatio = check.latency.dns / check.latency.total;
    const connectionRatio = check.latency.connection / check.latency.total;
    const tlsRatio = check.latency.tls / check.latency.total;
    // const applicationRatio = check.latency.application / check.latency.total;

    return (
        <g className={style.area}>
            <title>
                {moment(check.checkedAt).format("MMM D, H:mm")} / Result: {check.result === "up" ? "Up" : "Down"} / DNS:{" "}
                {check.latency.dns}ms / Connection: {check.latency.connection}ms / TLS: {check.latency.tls}ms / Application:{" "}
                {check.latency.application}
                ms / Total: {check.latency.total}ms
            </title>
            <defs>
                <linearGradient id={"fill" + index} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#444" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#444" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#666" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#666" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#888" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#888" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#aaa" />
                    <stop offset="100%" stopColor="#aaa" />
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
            <rect width={barWidth} height={height} x={x} className={c(style.overlay, { [style.bad]: check.result !== "up" })} />
        </g>
    );
};

const calculateAvailableWidth = element => {
    const style = getComputedStyle(element.parentElement);
    return element.parentElement.clientWidth - parseInt(style.paddingLeft, 10) - parseInt(style.paddingRight, 10);
};

let previousClientX = 0;

export default ({ checks }) => {
    const root = useRef(null);
    const [limit, setLimit] = useState(0);
    const [offset, setOffset] = useState(0);

    const width = barWidth * limit;
    const viewBox = `0 0 ${width} ${height}`;

    useEffect(() => {
        const availableWidth = calculateAvailableWidth(root.current);
        const limit = Math.floor(availableWidth / barWidth);
        setLimit(limit);
        setOffset(Math.max(checks.length - limit, 0));
    }, [checks]);

    const onScroll = e => {
        if (checks.length < limit) {
            return;
        }
        let delta = 0;
        if (e.type === "wheel") {
            delta = e.deltaY || e.deltaX;
        } else {
            delta = previousClientX - e.touches[0].clientX;
            previousClientX = e.touches[0].clientX;
        }
        if (delta > 0) {
            setOffset(Math.min(offset + 1, checks.length - limit));
        } else {
            setOffset(Math.max(offset - 1, 0));
        }
    };

    const onTouchStart = e => {
        previousClientX = e.touches[0].clientX;
    };

    return (
        <svg
            role="img"
            ref={root}
            viewBox={viewBox}
            height={height}
            width={width}
            onTouchMove={e => onScroll(e)}
            onWheel={e => onScroll(e)}
            onTouchStart={e => onTouchStart(e)}
        >
            {checks.slice(offset, offset + limit).map((check, index) => (
                <Bar key={index} index={index} check={check} />
            ))}
        </svg>
    );
};
