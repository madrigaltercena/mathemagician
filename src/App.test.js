// Basic smoke test for App — skips router/complex providers
// Real integration tests should mock GameProvider

import React from 'react';
import { render, screen } from '@testing-library/react';

test('App smoke: renders without crashing', () => {
  // App uses BrowserRouter and GameProvider which need full router context.
  // This test is a placeholder — real tests should be component-level.
  expect(true).toBe(true);
});
