import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import moment from "moment";
import c from "classnames";
import { appContext } from "../App";
import Chart from "../Chart";
import Website from "../Website";
import Duration from "../Duration";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ params }) => {
    const [website, setWebsite] = useState(null);
    const { date } = useContext(appContext);

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

    if (!website) {
        return null;
    }

    return (
        <div className={style.history}>
            <a className={style.topbar} href="/">
                <Website website={website} />
            </a>
            <div className={style.chart}>
                <Chart checks={checks} />
            </div>
            <table className={style.table}>
                <tbody>
                    {checks.map(check => (
                        <tr key={check.checkedAt}>
                            <td>
                                <Moment date={check.checkedAt} format="MMM DD, HH:mma" />
                            </td>
                            <td
                                className={c(style.status, {
                                    [style.red]: check.statusCode !== 200
                                })}
                            >
                                {check.statusCode}
                            </td>
                            <td>{(check.duration / 1000).toFixed(2)}s</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
