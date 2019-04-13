import React, { useState } from "react";
import c from "classnames";
import Route, { navigate } from "../route";
import Sidebar from "../sidebar";
import History from "../history";

import style from "./style.module.css";

export default () => {
  const [isSidebarOpen, setSidebarOpen] = useState(
    window.location.hash === "#/"
  );

  return (
    <div className={style.container}>
      <div
        className={c(style.panel, style.sidebar, {
          [style.open]: isSidebarOpen
        })}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>
      <div className={c(style.panel, style.content)}>
        <Route to="/">
          <p>Select a website to display its history.</p>
        </Route>
        <Route to="/websites/:id">
          <History openSidebar={() => setSidebarOpen(true)} />
        </Route>
      </div>
    </div>
  );
};
