import { createRoot } from 'react-dom/client';
import { Provider } from 'jotai';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initMonitors } from '@/utils/monitor';
import Main from '@/windows/Translate';
import Setting from '@/windows/Setting';
import About from './windows/About';

import './reset.css';
import './style.css';
import 'virtual:uno.css';

const container = document.getElementById('root');

const root = createRoot(container!);

const router = createHashRouter([
  {
    path: '/',
    element: <Main />,
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

initMonitors();

root.render(
  <Provider>
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
  </Provider>,
);
