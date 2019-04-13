import React, { useState, useEffect } from "react";
import c from "classnames";
import Sidebar from "../sidebar";
import Welcome from "../welcome";
import History from "../history";

import style from "./style.module.css";

export default () => {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const onHashChange = e => {
      setPath(window.location.hash.slice(1));
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <div className={style.container}>
      <div
        className={c(style.sidebar, {
          [style.open]: path === "/"
        })}
      >
        <Sidebar />
      </div>
      <div className={style.content}>
        <Welcome path={path} />
        <History path={path} />
      </div>
    </div>
  );
};
