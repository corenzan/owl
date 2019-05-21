const pluralize = (n, single, plural) => {
    return n + " " + (n !== 1 ? plural || single + "s" : single);
};

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

export default ({ value }) => {
    if (value > day * 3) {
        return pluralize(Math.round(value / day), "day");
    }
    if (value > hour) {
        return pluralize(Math.round(value / hour), "hour");
    }
    return pluralize(Math.round(value / minute), "minute");
};
