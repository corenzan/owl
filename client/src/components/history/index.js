import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import match from "../../match";
import c from "classnames";
import Chart from "../chart";
import Website from "../website";
import api from "../../api.js";

import style from "./style.module.css";

const formattedDuration = duration => {
  if (duration > 3600) {
    return Math.round(duration / 3600) + "h";
  }
  return Math.round(duration / 60) + "m";
};

export default ({ path }) => {
  const { websiteId } = match("/websites/:websiteId", path);

  const [website, setWebsite] = useState(null);

  useEffect(() => {
    if (websiteId) {
      api.request("/websites/" + websiteId).then(setWebsite);
    }
  }, [websiteId]);

  const [checks, setChecks] = useState([]);

  useEffect(() => {
    if (!website) {
      return;
    }
    api.request(`/websites/${website.id}/checks`).then(setChecks);
  }, [website]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!website) {
      return;
    }
    api.request(`/websites/${website.id}/history`).then(setHistory);
  }, [website]);

  if (!website) {
    return null;
  }

  return (
    <div className={style.history}>
      <div
        className={style.topbar}
        onClick={e => (window.location.hash = "#/")}
      >
        <Website website={website} />
      </div>
      <div className={style.chart}>
        <Chart height="40" checks={checks} />
      </div>
      <table className={style.table}>
        <tbody>
          {history.map(entry => (
            <tr key={entry.changed}>
              <td>
                <Moment date={entry.changed} format="MMM DD, HH:mma" />
              </td>
              <td
                className={c(style.status, {
                  [style.bad]: entry.status !== 200
                })}
              >
                {entry.status}
              </td>
              <td>{formattedDuration(entry.duration)}</td>
              <td className={style.latency}>
                {(entry.latency / 1000).toFixed(1)}s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
