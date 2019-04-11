import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import Indicator from "./indicator";
import { Table, Row, Cell } from "./table";
import { request } from "../api.js";

const Website = ({ isSelected, website, onClick }) => {
  return (
    <Row onClick={onClick} isSelected={isSelected}>
      <Cell width="1">
        <Indicator status={website.status} />
      </Cell>
      <Cell alignment="left" truncate>
        <span>{website.url}</span>
        <small>
          <Moment date={website.updated} fromNow />
        </small>
      </Cell>
      <Cell width="1" alignment="right">
        {website.uptime}%
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
