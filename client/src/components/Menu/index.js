import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import c from "classnames";

import Website from "../Website";
import api from "../../api.js";

import style from "./style.module.css";

export default () => {
    const [match, params] = useRoute("/websites/:id");
    const [websites, update] = useState([]);

    useEffect(() => {
        api.websites().then(update);
    }, []);

    return (
        <div className={style.menu}>
            {websites.map(website => (
                <Link key={website.id} href={`/websites/${website.id}`}>
                    <a href="/" className={c(style.row, { [style.selected]: match && params.id === String(website.id) })}>
                        <Website website={website} />
                    </a>
                </Link>
            ))}
        </div>
    );
};
