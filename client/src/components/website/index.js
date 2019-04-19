import React from "react";
import Indicator from "../indicator";
import Moment from "react-moment";
import c from "classnames";

import style from "./style.module.css";

export default ({ website, onClick }) => {
  return (
    <div className={style.website} onClick={onClick}>
      <div className={style.segment}>
        <Indicator status={website.status} />
      </div>
      <div className={c(style.segment, style.name)}>
        {website.url}
        <small className={style.timestamp}>
          <Moment date={website.updated} fromNow />
        </small>
      </div>
      <div
        className={c(style.segment, style.uptime)}
        title={
          (website.uptime % 1 > 0
            ? website.uptime.toFixed(4)
            : website.uptime) + "%"
        }
      >
        {Math.floor(website.uptime)}%
      </div>
    </div>
  );
};
