import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import moment from "moment";
import { Link } from "wouter";
import match from "../../match";
import c from "classnames";
import Chart from "../chart";
import Website from "../website";
import api from "../../api.js";

import style from "./style.module.css";

const pluralize = (n, single, plural) => {
  return n + " " + (n != 1 ? plural || single + "s" : single);
};

const formattedDuration = duration => {
  if (duration > 3600 * 24 * 2) {
    return pluralize(Math.round(duration / (3600 * 24)), "day");
  }
  if (duration > 3600) {
    return pluralize(Math.round(duration / 3600), "hour");
  }
  return pluralize(Math.round(duration / 60), "minute");
};

export default ({ params }) => {
  const [website, setWebsite] = useState(null);

  useEffect(
    () => {
      api.request("/websites/" + params.id).then(setWebsite);
    },
    [params.id]
  );

  const [checks, setChecks] = useState([]);

  useEffect(
    () => {
      if (!website) {
        return;
      }
      api
        .request(
          `/websites/${website.id}/checks?mo=` + moment().format("MMM+Y")
        )
        .then(setChecks);
    },
    [website]
  );

  if (!website) {
    return null;
  }

  return (
    <div className={style.history}>
      <Link className={style.topbar} href="/">
        <Website website={website} />
      </Link>
      <div className={style.chart}>
        <Chart height="40" checks={checks} />
      </div>
      <table className={style.table}>
        <tbody>
          {checks.map(check => (
            <tr key={check.checked}>
              <td>
                <Moment date={check.checked} format="MMM DD, HH:mma" />
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
