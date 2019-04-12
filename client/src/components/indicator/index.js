import React from "react";
import c from "classnames";

import style from "./style.module.css";

export default ({ status }) => (
  <div className={c(style.indicator, { [style.green]: status === 200 })} />
);
