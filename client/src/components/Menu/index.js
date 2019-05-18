import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import Moment from "react-moment";
import c from "classnames";
import Website from "../Website";
import api from "../../api.js";

import style from "./style.module.css";

const isSelected = (website, params) => {
  return params && Number(params.id) === website.id;
};

export default () => {
  const [_, params] = useRoute("/websites/:id");
  const [list, update] = useState([]);

  useEffect(() => {
    api.request("/websites").then(update);
  }, []);

  return (
    <div className={style.menu}>
      <div className={style.topbar}>
        <h1 className={style.brand}>
          <Link href="/">Owl</Link>
        </h1>
        <span>
          <Moment format="MMM Y" />
        </span>
      </div>
      <div className={style.list}>
        {list.map(website => (
          <Link href={"/websites/" + website.id} key={website.id}>
            <a
              className={c(
                style.row,
                isSelected(website, params) ? style.selected : null
              )}
            >
              <Website website={website} />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};
