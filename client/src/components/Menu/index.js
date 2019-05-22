import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import c from "classnames";

import Website from "../Website";
import api from "../../api.js";

import style from "./style.module.css";

export default () => {
    const [match, params] = useRoute("/websites/:id");
    const [websites, update] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        api.websites().then(update);
    }, []);

    const onKeyDown = e => {
        if (e.code === "Escape") {
            setQuery("");
        }
    };

    return (
        <div className={style.menu}>
            <header className={style.search}>
                <input
                    type="search"
                    value={query}
                    placeholder="Search…"
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => onKeyDown(e)}
                />
            </header>
            {websites
                .filter(website => website.url.indexOf(query.toLowerCase()) > -1)
                .map(website => (
                    <Link key={website.id} href={`/websites/${website.id}`}>
                        <a href="/" className={c(style.row, { [style.selected]: match && params.id === String(website.id) })}>
                            <Website website={website} />
                        </a>
                    </Link>
                ))}
        </div>
    );
};
