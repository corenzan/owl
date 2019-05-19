const pluralize = (n, single, plural) => {
    return n + " " + (n !== 1 ? plural || single + "s" : single);
};

export default ({ value }) => {
    if (value > 3600 * 24 * 2) {
        return pluralize(Math.round(value / (3600 * 24)), "day");
    }
    if (value > 3600) {
        return pluralize(Math.round(value / 3600), "hour");
    }
    return pluralize(Math.round(value / 60), "minute");
};
