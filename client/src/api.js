export const request = path => {
  return fetch(process.env.REACT_APP_API_URL + path)
    .then(response => {
      if (!response.ok) {
        throw Error(response.status);
      }
      return response.json();
    })
    .catch(console.error);
};
