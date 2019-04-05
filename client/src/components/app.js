import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Website from "./website";
import { Table } from "./table";

const request = path => {
  const options = {
    headers: {
      Authorization: "Bearer 123"
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

const StyledMain = styled.main`
  color: #3c342a;
  padding: 3rem 1.5rem;
`;

export default () => {
  const [websites, setWebsites] = useState([]);

  console.log("websites", websites);

  useEffect(() => {
    request("/websites").then(websites => {
      setWebsites(websites);

      for (let i = 0, l = websites.length; i < l; i++) {
        request(`/websites/${websites[i].id}/checks`).then(checks => {
          websites[i].checks = checks;
          setWebsites(websites);
        });
      }
    });
  }, []);

  return (
    <StyledMain>
      <Table>
        {websites.map(website => (
          <Website
            key={website.id}
            website={website}
            checks={website.checks || []}
          />
        ))}
      </Table>
    </StyledMain>
  );
};
