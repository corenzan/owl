import moment from "moment";

const request = path => {
    return fetch(process.env.REACT_APP_API_URL + path)
        .then(response => {
            if (!response.ok) {
                throw Error(response.status);
            }
            return response.json();
        })
        .catch(console.error);
};

export default {
    websites() {
        return request("/websites");
    },

    website(id) {
        return request(`/websites/${id}`);
    },

    stats(id, after, before) {
        return request(`/websites/${id}/stats?after=${moment(after).toISOString()}&before=${moment(before).toISOString()}`);
    },

    checks(id, after, before) {
        return request(`/websites/${id}/checks?after=${moment(after).toISOString()}&before=${moment(before).toISOString()}`);
    },

    history(id, after, before) {
        return request(`/websites/${id}/history?after=${moment(after).toISOString()}&before=${moment(before).toISOString()}`);
    }
};
