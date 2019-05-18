import React, { useState, createContext } from "react";
import { Route, useLocation } from "wouter";
import moment from "moment";
import c from "classnames";
import Menu from "../Menu";
import Welcome from "../Welcome";
import History from "../History";

import style from "./style.module.css";

export const appContext = createContext();

export default () => {
    const [date, setDate] = useState(moment().format("MMM YYYY"));
    const [path] = useLocation();

    return (
        <appContext.Provider value={{ date }}>
            <div className={style.container}>
                <aside className={c(style.aside, path === "/" ? style.open : null)}>
                    <Menu />
                </aside>
                <main className={style.main}>
                    <Route path="/" component={Welcome} />
                    <Route path="/websites/:id" component={History} />
                </main>
            </div>
        </appContext.Provider>
    );
};
