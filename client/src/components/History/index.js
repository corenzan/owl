import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import moment from "moment";
import { Link } from "wouter";
import c from "classnames";
import { appContext } from "../App";
import Chart from "../Chart";
import Period from "../Period";
import Website from "../Website";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ params }) => {
    const { date } = useContext(appContext);

    const [website, setWebsite] = useState(null);
    useEffect(() => {
        api.request("/websites/" + params.id).then(setWebsite);
    }, [params.id]);

    const [checks, setChecks] = useState([]);
    useEffect(() => {
        if (!website) {
            return;
        }
        api.request(`/websites/${website.id}/checks?mo=` + moment(date).format("MMM+Y")).then(setChecks);
    }, [website]);

    const [history, setHistory] = useState([]);
    useEffect(() => {
        if (!website) {
            return;
        }
        api.request(`/websites/${website.id}/history?mo=` + moment(date).format("MMM+Y")).then(setHistory);
    }, [website]);

    if (!website) {
        return null;
    }

    return (
        <div className={style.history}>
            <Link href="/">
                <a className={style.topbar} href="/">
                    <Website website={website} />
                </a>
            </Link>
            <div className={style.chart}>{checks.length ? <Chart checks={checks} /> : null}</div>
            <table className={style.table}>
                <tbody>
                    {history.map(entry => (
                        <tr key={entry.startedAt}>
                            <td>
                                <Moment date={entry.startedAt} format="MMM DD, HH:mma" />
                            </td>
                            <td
                                className={c(style.status, {
                                    [style.red]: entry.statusCode !== 200
                                })}
                            >
                                {entry.statusCode}
                            </td>
                            <td>
                                <Period value={entry.period} />
                            </td>
                            <td>{(entry.averageDuration / 1000).toFixed(2)}s</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
