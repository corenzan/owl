import React, { useState } from "react";
import Time from "react-time";
import styled from "styled-components";
import Websites from "./websites";
import Panel from "./panel";
import Topbar from "./topbar";
import History from "./history";

const Container = styled.main`
  display: flex;
  color: #61474c;
  font-family: Arimo, sans-serif;
`;

const Brand = styled.h1`
  font-size: 1.25em;
`;

export default () => {
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  return (
    <Container>
      <Panel theme="negative" sidebar>
        <Topbar theme="negative">
          <Brand>
            <a href="/">Owl</a>
          </Brand>
          <Time value={Date.now()} format="MMM D" />
        </Topbar>
        <Websites
          selectedWebsite={selectedWebsite}
          onWebsiteSelect={website => setSelectedWebsite(website)}
        />
      </Panel>
      <Panel>
        {selectedWebsite ? (
          <>
            <Topbar>
              <span>{selectedWebsite.url}</span>
              <Time value={Date.now()} format="MMM Y" />
            </Topbar>
            <History website={selectedWebsite} />
          </>
        ) : (
          <p>Select a website to see its history of status changes.</p>
        )}
      </Panel>
    </Container>
  );
};
