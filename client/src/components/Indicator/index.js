import React from "react";
import c from "classnames";

import style from "./style.module.css";

export default ({ lastCheck }) => {
  const { statusCode } = lastCheck || {};
  return (
    <div className={c(style.indicator, { [style.green]: statusCode === 200, [style.gray]: statusCode === undefined })} />
  );
};