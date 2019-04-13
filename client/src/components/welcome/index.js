import React from "react";
import style from "./style.module.css";

export default ({ path }) => {
  if (path !== "/") {
    return null;
  }

  return (
    <p className={style.message}>Select a website to display its history.</p>
  );
};
