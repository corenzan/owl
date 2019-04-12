import React, { useState } from "react";
import c from "classnames";
import Sidebar from "../sidebar";
import History from "../history";

import style from "./style.module.css";

export default () => {
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  return (
    <div className={style.container}>
      <div className={c(style.panel, style.sidebar, style.open)}>
        <Sidebar
          isOpen
          selectedWebsite={selectedWebsite}
          onWebsiteChange={setSelectedWebsite}
        />
      </div>
      <div className={c(style.panel, style.content)}>
        <History website={selectedWebsite} />
      </div>
    </div>
  );
};
