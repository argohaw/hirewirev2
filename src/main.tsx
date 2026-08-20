import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { JobsProvider } from './context/JobsContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('HireWire failed to mount: #root is missing.');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <JobsProvider>
        <App />
      </JobsProvider>
    </ThemeProvider>
  </StrictMode>,
);
