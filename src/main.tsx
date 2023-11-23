import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'jotai';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from './theme';

import './reset.css';
import './style.css';
import 'virtual:uno.css';

const container = document.getElementById('root');

const root = createRoot(container!);

const Translate = React.lazy(() => import('@/windows/Translate'));
const Setting = React.lazy(() => import('@/windows/Setting'));
const About = React.lazy(() => import('@/windows/About'));

const router = createHashRouter([
  {
    path: '/',
    element: <Translate />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/setting',
    element: <Setting />,
  },
  {
    path: '/about',
    element: <About />,
  },
]);

root.render(
  <Provider>
    <ThemeProvider>
      <React.Fragment>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          gutter={4}
          containerClassName="toast-panel"
          toastOptions={{
            className: 'toast',
            duration: 2000,
          }}
        />
      </React.Fragment>
    </ThemeProvider>
  </Provider>,
);
