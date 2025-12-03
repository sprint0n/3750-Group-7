import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import LogoutPage from "./pages/LogoutPage";
import TransferPage from "./pages/TransferPage";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./components/RootLayout";
import CreatePage from "./pages/CreatePage";
import ExchangePage from "./pages/ExchangePage";
//This allows us to login after checking in the login status
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage onLogin={() => setIsLoggedIn(true)} />,
      errorElement: <ErrorPage />,
    },
    { path: "/create", element: <CreatePage /> },
    {
      path: "/app",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <RootLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "home", element: <HomePage /> },
        { path: "transfer", element: <TransferPage /> },
        { path: "logout", element: <LogoutPage /> },
        { path: "history", element: <HistoryPage /> },
        { path: "exchange", element: <ExchangePage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
