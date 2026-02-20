import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../../components/App';
import { ErrorBoundary } from '../../lib/errorHandler';
import '../../styles/base.css';
import '../../styles/layout.css';
import '../../styles/header.css';
import '../../styles/components.css';
import '../../styles/refresh.css';
import '../../styles/notification.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
