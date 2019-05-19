import React from "react";
import c from "classnames";

import style from "./style.module.css";

export default ({ status }) => {
    return (
        <svg role="img" width="8" height="24" viewBox="0 0 8 24" className={c(style.indicator, style[status])}>
            <rect height="24" width="8" rx="2" ry="2" />
        </svg>
    );
};
