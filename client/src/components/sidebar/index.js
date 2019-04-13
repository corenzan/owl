import React, { useState, useEffect } from "react";
import Website from "../website";
import Moment from "react-moment";
import c from "classnames";
import { navigate } from "../route";
import api from "../../api.js";

import style from "./style.module.css";

export default ({ closeSidebar }) => {
  const [websites, setWebsites] = useState([]);

  const [selectedWebsite, setSelectedWebsite] = useState(null);

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
              [style.selected]: selectedWebsite === website
            })}
          >
            <Website
              website={website}
              onClick={e => {
                setSelectedWebsite(website);
                closeSidebar();
                navigate("/websites/" + website.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
