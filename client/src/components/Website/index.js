import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import c from "classnames";

import api from "../../api.js";
import { appContext } from "../App";
import Indicator from "../Indicator";

import style from "./style.module.css";

const Uptime = ({ value, className, label }) => (
  <div className={className}>
    {label ? <small className={style.label}>Uptime</small> : null}
    {value ? (value % 1 > 0 ? value.toFixed(2) : value) : 0}%
  </div>
);
const Apdex = ({ value, className }) => (
  <div className={className}>
    <small className={style.label}>Apdex</small>
    {value ? value.toFixed(2) : "0.00"}
  </div>
);
const Average = ({ value, className }) => (
  <div className={className}>
    <small className={style.label}>Average</small>
    {value ? (value / 1000).toFixed(2) : "0.00"}s
  </div>
);
const Lowest = ({ value, className }) => (
  <div className={className}>
    <small className={style.label}>Lowest</small>
    {value ? (value / 1000).toFixed(2) : "0.00"}s
  </div>
);
const Highest = ({ value, className }) => (
  <div className={className}>
    <small className={style.label}>Highest</small>
    {value ? (value / 1000).toFixed(2) : "0.00"}s
  </div>
);
const Checks = ({ value, className }) => (
  <div className={className}>
    <small className={style.label}>Checks</small>
    {value ? value : "0"}
  </div>
);

export default ({ website, extended, onClick }) => {
  const [stats, setStats] = useState(null);
  const { period } = useContext(appContext);

  useEffect(() => {
    if (extended) {
      api.stats(website.id, ...period).then(setStats);
    }
  }, [extended, website.id]);

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
          <div className={c(style.segment, style.stats, style.desktop)}>
            <Apdex value={stats && stats.apdex} />
            <Average value={stats && stats.average} />
            <Lowest value={stats && stats.lowest} />
            <Highest value={stats && stats.highest} />
            <Checks value={stats && stats.count} />
            <Uptime value={stats && stats.uptime} label />
          </div>
        ) : (
          <div className={style.segment}>
            <Uptime value={website.uptime} />
          </div>
        )}
      </div>
      {extended ? (
        <div className={c(style.row, style.mobile)}>
          <div className={c(style.segment, style.stats)}>
            <Uptime value={stats && stats.uptime} label />
            <Apdex value={stats && stats.apdex} />
            <Average value={stats && stats.average} />
            <Lowest value={stats && stats.lowest} />
            <Highest value={stats && stats.highest} />
            <Checks value={stats && stats.count} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
