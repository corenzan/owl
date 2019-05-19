import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import moment from "moment";
import c from "classnames";
import Indicator from "../Indicator";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ website, onClick }) => {
    const [uptime, setUptime] = useState(0);
    const [lastCheck, setLastCheck] = useState({});

    useEffect(() => {
        api.request("/websites/" + website.id + "/uptime?mo=" + moment().format("MMM+Y")).then(setUptime);
    }, []);

    useEffect(() => {
        api.request("/websites/" + website.id).then(website => setLastCheck(website.lastCheck));
    }, []);

    return (
        <div className={style.website} onClick={onClick}>
            <div className={style.segment}>
                <Indicator lastCheck={lastCheck} />
            </div>
            <div className={c(style.segment, style.name)}>
                {website.url}
                <small className={style.timestamp}>{lastCheck ? <Moment date={lastCheck.checkedAt} fromNow /> : "-"}</small>
            </div>
            <div className={c(style.segment, style.uptime)}>{uptime % 1 > 0 ? uptime.toFixed(4) : uptime}%</div>
        </div>
    );
};