import React, { createContext, useContext, useState, useEffect } from "react";

const context = createContext(null);

export const BreakpointProvider = ({ children }) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const onResize = e => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return <context.Provider value={{ width, height }}>{children}</context.Provider>;
};

const Breakpoint = ({ children, minWidth, maxWidth, minHeight, maxHeight }) => {
    const { width, height } = useContext(context);
    if (width > maxWidth || width < minWidth || height > maxHeight || height < minHeight) {
        return null;
    }
    return <>{children}</>;
};

Breakpoint.defaultProps = {
    maxHeight: Infinity,
    maxWidth: Infinity,
    minHeight: 0,
    minWidth: 0
};

export default Breakpoint;
