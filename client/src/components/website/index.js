import React, { useState, useEffect } from "react";
import Indicator from "../indicator";
import Moment from "react-moment";
import moment from "moment";
import c from "classnames";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ website, onClick }) => {
  const [uptime, update] = useState(0);

  useEffect(() => {
    api
      .request(
        "/websites/" + website.id + "/uptime?mo=" + moment().format("MMM+Y")
      )
      .then(update);
  }, []);

  return (
    <div className={style.website} onClick={onClick}>
      <div className={style.segment}>
        <Indicator status={website.lastCheck.statusCode} />
      </div>
      <div className={c(style.segment, style.name)}>
        {website.url}
        <small className={style.timestamp}>
          <Moment date={website.lastCheck.checked} fromNow />
        </small>
      </div>
      <div className={c(style.segment, style.uptime)}>
        {uptime % 1 > 0 ? uptime.toFixed(4) : uptime}%
      </div>
    </div>
  );
};
