import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import c from "classnames";

import api from "../../api.js";
import { appContext } from "../App";
import Indicator from "../Indicator";

import style from "./style.module.css";

export default ({ website, extended, onClick }) => {
    const [stats, setStats] = useState(null);
    const { period } = useContext(appContext);

    useEffect(() => {
        api.stats(website.id, ...period).then(setStats);
    }, [website.id]);

    return (
        <div className={style.website} onClick={onClick}>
            <div className={style.row}>
                <div className={style.segment}>
                    <Indicator status={website.status} />
                </div>
                <div className={c(style.segment, style.name)}>
                    {website.url}
                    <small className={style.label}>
                        <Moment date={website.updatedAt} fromNow />
                    </small>
                </div>
                {extended ? (
                    <>
                        <div className={c(style.segment, style.desktop)}>
                            <small className={style.label}>Apdex</small>
                            {stats ? stats.apdex.toFixed(2) : "0.00"}
                        </div>
                        <div className={c(style.segment, style.desktop)}>
                            <small className={style.label}>Average</small>
                            {stats ? (stats.average / 1000).toFixed(2) : "0.00"}s
                        </div>
                        <div className={c(style.segment, style.desktop)}>
                            <small className={style.label}>Lowest</small>
                            {stats ? (stats.lowest / 1000).toFixed(2) : "0.00"}s
                        </div>
                        <div className={c(style.segment, style.desktop)}>
                            <small className={style.label}>Highest</small>
                            {stats ? (stats.highest / 1000).toFixed(2) : "0.00"}s
                        </div>
                        <div className={c(style.segment, style.desktop)}>
                            <small className={style.label}>Checks</small>
                            {stats ? stats.count : "0"}
                        </div>
                        <div className={style.segment}>
                            <small className={style.label}>Uptime</small>
                            {stats ? (stats.uptime % 1 > 0 ? stats.uptime.toFixed(4) : stats.uptime) : 0}%
                        </div>
                    </>
                ) : (
                    <div className={style.segment}>
                        {stats ? (stats.uptime % 1 > 0 ? stats.uptime.toFixed(4) : stats.uptime) : 0}%
                    </div>
                )}
            </div>
            {extended ? (
                <div className={c(style.row, style.justified, style.mobile)}>
                    <div className={style.segment}>
                        <small className={style.label}>Apdex</small>
                        {stats ? stats.apdex.toFixed(2) : "0.00"}
                    </div>
                    <div className={style.segment}>
                        <small className={style.label}>Average</small>
                        {stats ? (stats.average / 1000).toFixed(2) : "0.00"}s
                    </div>
                    <div className={style.segment}>
                        <small className={style.label}>Lowest</small>
                        {stats ? (stats.lowest / 1000).toFixed(2) : "0.00"}s
                    </div>
                    <div className={style.segment}>
                        <small className={style.label}>Highest</small>
                        {stats ? (stats.highest / 1000).toFixed(2) : "0.00"}s
                    </div>
                    <div className={style.segment}>
                        <small className={style.label}>Checks</small>
                        {stats ? stats.count : "0"}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
