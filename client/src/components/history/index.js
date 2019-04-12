import React, { useState, useEffect } from "react";
import Moment from "react-moment";
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

export default ({ website }) => {
  if (!website) {
    return (
      <div className={style.blank}>
        Select a website to display its history.
      </div>
    );
  }

  const [checks, setChecks] = useState([]);

  useEffect(() => {
    api.request(`/websites/${website.id}/checks`).then(setChecks);
  }, [website]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.request(`/websites/${website.id}/history`).then(setHistory);
  }, [website]);

  return (
    <div className={style.history}>
      <div className={style.topbar}>
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
              <td>{entry.status}</td>
              <td>{formattedDuration(entry.duration)}</td>
              <td alignment="right">{(entry.latency / 1000).toFixed(1)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
