import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CustomerMenuPage from '../pages/CustomerMenuPage';
import CustomerOrderStatusPage from '../pages/CustomerOrderStatusPage';
import CustomerRouteErrorPage from '../pages/CustomerRouteErrorPage';
import HomePage from '../pages/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <CustomerRouteErrorPage />,
  },
  {
    path: '/r/:slug/:tableId',
    element: <CustomerMenuPage />,
    errorElement: <CustomerRouteErrorPage />,
  },
  {
    path: '/r/:slug/:tableId/order-status/:orderToken',
    element: <CustomerOrderStatusPage />,
    errorElement: <CustomerRouteErrorPage />,
  },
  {
    path: '/order-status/:orderToken',
    element: <CustomerOrderStatusPage />,
    errorElement: <CustomerRouteErrorPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}