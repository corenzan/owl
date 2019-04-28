import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import Website from "../website";
import Moment from "react-moment";
import c from "classnames";
import api from "../../api.js";

import style from "./style.module.css";

export default () => {
  const [match, params] = useRoute("/websites/:id");

  const [list, update] = useState([]);

  useEffect(() => {
    api.request("/websites").then(update);
  }, []);

  return (
    <div className={style.container}>
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
                match && params.id == website.id ? style.selected : null
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
