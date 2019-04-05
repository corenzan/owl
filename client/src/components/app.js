import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Website from "./website";
import { Table } from "./table";
import { request } from "../api.js";

const StyledMain = styled.main`
  color: #3c342a;
  padding: 3rem 1.5rem;
`;

export default () => {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    request("/websites").then(setWebsites);
  }, []);

  return (
    <StyledMain>
      <Table>
        {websites.map(website => (
          <Website key={website.id} website={website} />
        ))}
      </Table>
    </StyledMain>
  );
};
