import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import c from "classnames";

import Indicator from "../Indicator";
import { appContext } from "../App";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ website, onClick }) => {
    const [uptime, setUptime] = useState(0);
    const { period } = useContext(appContext);

    useEffect(() => {
        api.uptime(website.id, ...period).then(setUptime);
    }, [website.id]);

    return (
        <div className={style.website} onClick={onClick}>
            <div className={style.segment}>
                <Indicator status={website.status} />
            </div>
            <div className={c(style.segment, style.name)}>
                {website.url}
                <small className={style.timestamp}>
                    <Moment date={website.updatedAt} fromNow />
                </small>
            </div>
            <div className={c(style.segment, style.uptime)}>{uptime % 1 > 0 ? uptime.toFixed(4) : uptime}%</div>
        </div>
    );
};
