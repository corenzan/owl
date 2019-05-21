import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import { Link } from "wouter";
import c from "classnames";

import api from "../../api.js";
import { appContext } from "../App";
import Chart from "../Chart";
import Duration from "../Duration";
import Website from "../Website";

import style from "./style.module.css";

export default ({ params }) => {
    const { period } = useContext(appContext);

    const [website, setWebsite] = useState(null);
    const [checks, setChecks] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.website(params.id).then(setWebsite);
        api.checks(params.id, ...period).then(setChecks);
        api.history(params.id, ...period).then(setHistory);
    }, [params.id]);

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
                        <tr key={entry.time}>
                            <td>
                                <Moment date={entry.time} format="MMM DD, h:mma" />
                            </td>
                            <td
                                className={c(style.status, {
                                    [style.bad]: entry.status !== "up"
                                })}
                            >
                                {entry.status === "up" ? "Up" : "Down"}
                            </td>
                            <td>
                                <Duration value={entry.duration} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
