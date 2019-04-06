export const request = path => {
  const options = {
    headers: {
      Authorization: "Bearer " + process.env.REACT_APP_API_KEY
    }
  };
  return fetch(process.env.REACT_APP_API_URL + path, options)
    .then(response => {
      if (!response.ok) {
        throw Error(response.status);
      }
      return response.json();
    })
    .catch(console.error);
};
