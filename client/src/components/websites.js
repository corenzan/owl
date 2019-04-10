import React, { useState, useEffect } from "react";
// import styled from "styled-components";
import Time from "react-time";
import Indicator from "./indicator";
import { Table, Row, Cell } from "./table";
import { request } from "../api.js";

const Website = ({ isSelected, website, onClick }) => {
  return (
    <Row onClick={onClick} isSelected={isSelected}>
      <Cell width="3.25rem">
        <Indicator status={website.status} />
      </Cell>
      <Cell alignment="left">
        <span>{website.url}</span>
        <small>
          <Time value={website.timestamp} relative />
        </small>
      </Cell>
      <Cell width="5.25rem" alignment="right">
        0%
      </Cell>
    </Row>
  );
};

export default ({ selectedWebsite, onWebsiteSelect }) => {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    request("/websites").then(setWebsites);
  }, []);

  return (
    <Table theme="negative">
      {websites.map(website => (
        <Website
          key={website.id}
          isSelected={website === selectedWebsite}
          website={website}
          onClick={e => onWebsiteSelect(website)}
        />
      ))}
    </Table>
  );
};
