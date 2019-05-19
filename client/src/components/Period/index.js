const pluralize = (n, single, plural) => {
    return n + " " + (n !== 1 ? plural || single + "s" : single);
};

export default ({ value }) => {
    if (value > 60 * 24 * 2) {
        return pluralize(Math.round(value / (60 * 24)), "day");
    }
    if (value > 60) {
        return pluralize(Math.round(value / 60), "hour");
    }
    return pluralize(value, "minute");
};
