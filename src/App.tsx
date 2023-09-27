import { createRoot } from 'react-dom/client';
import { Provider } from 'jotai';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Main from '@/windows/Main';
import Setting from '@/windows/Setting';

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
]);

root.render(
  <Provider>
    <RouterProvider router={router} />
  </Provider>,
);
