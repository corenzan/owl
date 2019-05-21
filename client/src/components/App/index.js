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
    const [period] = useState([moment().startOf("month"), moment().endOf("month")]);
    const [path] = useLocation();

    return (
        <appContext.Provider value={{ period }}>
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
