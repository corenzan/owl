import React, { useState, useRef, useEffect, useCallback } from "react";
import c from "classnames";

import style from "./style.module.css";
import moment from "moment";

const maxLatency = 10000;
const height = 128;
const step = 12;
const stroke = 1;

const Bar = ({ index, check }) => {
    const x = step * index;
    const y = check.latency.total / maxLatency;

    const dns = (check.latency.dns / (check.latency.total || 1)) * 100;
    const connection = (check.latency.connection / (check.latency.total || 1)) * 100;
    const tls = (check.latency.tls / (check.latency.total || 1)) * 100;

    return (
        <g className={style.area}>
            <title>
                {moment(check.checkedAt).format("MMM D, H:mm")} / Result: {check.result === "up" ? "Up" : "Down"} / DNS:{" "}
                {check.latency.dns}ms / Connection: {check.latency.connection}ms / TLS: {check.latency.tls}ms / Application:{" "}
                {check.latency.application}
                ms / Total: {check.latency.total}ms
            </title>
            {check.latency.total > 0 ? (
                <defs>
                    <linearGradient id={"fill" + index} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#444" />
                        <stop offset={dns + "%"} stopColor="#444" />
                        <stop offset={dns + "%"} stopColor="#666" />
                        <stop offset={dns + connection + "%"} stopColor="#666" />
                        <stop offset={dns + connection + "%"} stopColor="#888" />
                        <stop offset={dns + connection + tls + "%"} stopColor="#888" />
                        <stop offset={dns + connection + tls + "%"} stopColor="#aaa" />
                        <stop offset="100%" stopColor="#aaa" />
                    </linearGradient>
                </defs>
            ) : null}
            <rect
                width={step - stroke * 2}
                height={Math.ceil((height - 1) * y) + 1}
                x={x + stroke}
                y={Math.ceil((height - 1) * (1 - y)) - 1}
                fill={check.latency.total > 0 ? "url(#fill" + index + ")" : "#aaa"}
                className={style.bar}
            />
            <rect width={step} height={height} x={x} className={c(style.overlay, { [style.bad]: check.result !== "up" })} />
        </g>
    );
};

export default ({ checks }) => {
    const ref = useRef(null);

    const [availableSpace, setAvailableSpace] = useState(0);
    useEffect(() => {
        const calculateAvailableSpace = e => {
            const parent = ref.current.parentElement;
            const style = getComputedStyle(parent);
            setAvailableSpace(parent.clientWidth - parseInt(style.paddingLeft, 10) - parseInt(style.paddingRight, 10));
        };
        calculateAvailableSpace();
        window.addEventListener("resize", calculateAvailableSpace);
        return () => {
            window.removeEventListener("resize", calculateAvailableSpace);
        };
    }, []);

    const limit = Math.floor(availableSpace / step);
    const width = step * limit;
    const viewBox = `0 0 ${width} ${height}`;
    const maxOffset = checks.length - limit;

    const [offset, setOffset] = useState(Infinity);

    useEffect(() => {
        setOffset(offset > maxOffset ? maxOffset : offset);
    }, [maxOffset]);

    const [previousClientX, setPreviousClientX] = useState(0);
    const [previousOffset, setPreviousOffset] = useState(0);

    const onWheel = useCallback(
        e => {
            if (checks.length < limit) {
                return;
            }
            const delta = e.deltaY || e.deltaX;
            if (delta > 0) {
                setOffset(Math.min(offset + Math.round(delta / step), maxOffset));
            } else {
                setOffset(Math.max(offset + Math.round(delta / step), 0));
            }
            e.stopPropagation();
        },
        [offset, maxOffset]
    );

    const onTouchMove = useCallback(
        e => {
            if (checks.length < limit) {
                return;
            }
            const delta = previousClientX - e.touches[0].clientX;
            if (delta > 0) {
                setOffset(Math.min(previousOffset + Math.round(delta / step), maxOffset));
            } else {
                setOffset(Math.max(previousOffset + Math.round(delta / step), 0));
            }
            e.stopPropagation();
        },
        [maxOffset, previousClientX, previousOffset]
    );

    const onTouchStart = useCallback(
        e => {
            setPreviousClientX(e.touches[0].clientX);
            setPreviousOffset(offset);
            // e.preventDefault();
        },
        [offset]
    );

    // console.log(checks.length, offset, limit);

    return (
        <svg
            className={style.svg}
            role="img"
            ref={ref}
            viewBox={viewBox}
            height={height}
            width={width}
            onTouchMove={e => onTouchMove(e)}
            onWheel={e => onWheel(e)}
            onTouchStart={e => onTouchStart(e)}
        >
            {checks.slice(offset, offset + limit).map((check, index) => (
                <Bar key={index} index={index} check={check} />
            ))}
        </svg>
    );
};
