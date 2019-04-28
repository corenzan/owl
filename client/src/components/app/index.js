import React, { useState, useEffect } from "react";
import { Route, useLocation } from "wouter";
import c from "classnames";
import Websites from "../websites";
import Welcome from "../welcome";
import History from "../history";

import style from "./style.module.css";

export default () => {
  const [path] = useLocation();

  return (
    <div className={style.container}>
      <div className={c(style.sidebar, path === "/" ? style.open : null)}>
        <Websites />
      </div>
      <div className={style.content}>
        <Route path="/" component={Welcome} />
        <Route path="/websites/:id" component={History} />
      </div>
    </div>
  );
};
