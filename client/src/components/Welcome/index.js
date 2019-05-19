import React from "react";

import { ReactComponent as Owl } from "../../owl-wire.svg";
import style from "./style.module.css";

export default () => {
    return (
        <div className={style.welcome}>
            <Owl className={style.owl} />
            <p className={style.message}>Owl sees all.</p>
        </div>
    );
};
