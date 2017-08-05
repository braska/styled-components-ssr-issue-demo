import React from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { renderToString } from 'react-dom/server';
import App from './app';

export default () => {
  const sheet = new ServerStyleSheet();
  const content = renderToString(
    <StyleSheetManager sheet={sheet.instance}>
      <App />
    </StyleSheetManager>,
  );
  return {
    content,
    sheet,
  };
};
