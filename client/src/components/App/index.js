import React, { useState, createContext } from "react";
import { Route, Link, useLocation } from "wouter";
import c from "classnames";
import Moment from "react-moment";
import moment from "moment";

import Menu from "../Menu";
import Welcome from "../Welcome";
import History from "../History";

import style from "./style.module.css";

export const appContext = createContext();

export default () => {
    const [period] = useState([moment().startOf("month"), moment()]);
    const [path] = useLocation();

    return (
        <appContext.Provider value={{ period }}>
            <div className={style.container}>
                <header className={style.topbar}>
                    <h1 className={style.brand}>
                        <Link href="/">Owl</Link>
                    </h1>
                    <div className={style.period}>
                        <Moment date={period[0]} format="MMM D" />
                        {" – "}
                        <Moment date={period[1]} format="MMM D" />
                    </div>
                </header>
                <main className={style.main}>
                    <aside className={c(style.aside, path === "/" && style.open)}>
                        <Menu />
                    </aside>
                    <div className={style.content}>
                        <Route path="/" component={Welcome} />
                        <Route path="/websites/:id" component={History} />
                    </div>
                </main>
            </div>
        </appContext.Provider>
    );
};
