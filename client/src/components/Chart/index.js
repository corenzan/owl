import React, { useState, useRef, useEffect } from "react";
import c from "classnames";

import style from "./style.module.css";
import moment from "moment";

const maxDuration = 5000;
const height = 64;
const barWidth = 12;
const barStroke = 2;

const Bar = ({ index, check }) => {
    const x = barWidth * index;
    const y = check.duration / maxDuration;

    const dnsRatio = check.breakdown.dns / check.duration;
    const connectionRatio = check.breakdown.connection / check.duration;
    const tlsRatio = check.breakdown.tls / check.duration;
    // const applicationRatio = check.breakdown.application / check.duration;

    return (
        <g className={style.area}>
            <title>
                {moment(check.checkedAt).format("MMM D, H:mm")} / Status: {check.statusCode} / DNS: {check.breakdown.dns}ms /
                Connection: {check.breakdown.connection}ms / TLS: {check.breakdown.tls}ms / Application:{" "}
                {check.breakdown.application}ms / Total: {check.duration}ms
            </title>
            <defs>
                <linearGradient id={"fill" + index} x2="0" y2="1">
                    <stop offset={0 + "%"} stopColor="#999" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#999" />
                    <stop offset={dnsRatio * 100 + "%"} stopColor="#ccc" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#ccc" />
                    <stop offset={(dnsRatio + connectionRatio) * 100 + "%"} stopColor="#999" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#999" />
                    <stop offset={(dnsRatio + connectionRatio + tlsRatio) * 100 + "%"} stopColor="#666" />
                    <stop offset={100 + "%"} stopColor="#666" />
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
            <rect
                width={barWidth}
                height={height}
                x={x}
                className={c(style.overlay, { [style.red]: check.statusCode !== 200 })}
            />
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
