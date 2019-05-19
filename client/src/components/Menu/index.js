import React, { useState, useEffect, useContext } from "react";
import { Link, useRoute } from "wouter";
import Moment from "react-moment";
import c from "classnames";
import Website from "../Website";
import api from "../../api.js";
import { appContext } from "../App";

import style from "./style.module.css";

const isSelected = (website, params) => {
    return params && Number(params.id) === website.id;
};

export default () => {
    const [, params] = useRoute("/websites/:id");
    const [list, update] = useState([]);
    const { period } = useContext(appContext);

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
                    <Moment value={period[0]} format="MMM Y" />
                </span>
            </div>
            <div className={style.list}>
                {list.map(website => (
                    <Link key={website.id} href={"/websites/" + website.id}>
                        <a className={c(style.row, isSelected(website, params) ? style.selected : null)} href="/">
                            <Website website={website} />
                        </a>
                    </Link>
                ))}
            </div>
        </div>
    );
};
