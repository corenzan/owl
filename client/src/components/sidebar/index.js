import React, { useState, useEffect } from "react";
import Website from "../website";
import Moment from "react-moment";
import c from "classnames";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ websiteId }) => {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    api.request("/websites").then(setWebsites);
  }, []);

  return (
    <div className={style.sidebar}>
      <div className={style.topbar}>
        <h1 className={style.brand}>
          <a href="/#/">Owl</a>
        </h1>
        <span>
          <Moment format="MMM Y" />
        </span>
      </div>
      <div className={style.list}>
        {websites.map(website => (
          <div
            key={website.id}
            className={c(style.row, {
              [style.selected]: websiteId === website.id
            })}
          >
            <Website
              website={website}
              onClick={e => {
                window.location.hash = "#/websites/" + website.id;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
