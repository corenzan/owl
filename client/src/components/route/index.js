import React, { createContext, useContext, useState, useEffect } from "react";
import Route from "route-parser";

const Context = createContext({});

export const useRoute = () => {
  return useContext(Context);
};

export const navigate = path => (window.location.hash = "#" + path);

export default ({ to, children }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const onHashChange = e => {
      setPath(window.location.hash.slice(1));
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const match = new Route(to).match(path);

  if (!match) {
    return null;
  }
  return (
    <Context.Provider value={{ path, match }}>{children}</Context.Provider>
  );
};
