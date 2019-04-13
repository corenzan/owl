import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import c from "classnames";
import Chart from "../chart";
import Website from "../website";
import { useRoute } from "../route";
import api from "../../api.js";

import style from "./style.module.css";

const formattedDuration = duration => {
  if (duration > 3600) {
    return Math.round(duration / 3600) + "h";
  }
  return Math.round(duration / 60) + "m";
};

export default ({ openSidebar }) => {
  const route = useRoute();

  const [website, setWebsite] = useState(null);

  useEffect(() => {
    if (route.match) {
      api.request("/websites/" + route.match.id).then(setWebsite);
    }
  }, [route]);

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

  return (
    <div className={style.history}>
      {website ? (
        <>
          <div className={style.topbar} onClick={e => openSidebar()}>
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
        </>
      ) : null}
    </div>
  );
};
