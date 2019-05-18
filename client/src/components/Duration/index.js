
const pluralize = (n, single, plural) => {
    return n + " " + (n != 1 ? plural || single + "s" : single);
};

export default ({ duration }) => {
    if (duration > 3600 * 24 * 2) {
        return pluralize(Math.round(duration / (3600 * 24)), "day");
    }
    if (duration > 3600) {
        return pluralize(Math.round(duration / 3600), "hour");
    }
    return pluralize(Math.round(duration / 60), "minute");
};