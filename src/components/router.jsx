import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "./Login";
import Register from "./Register";
import RootFolder from "./RootFolder";
import SharedFileView from "./SharedFileView";

let router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "folders",
        element: <RootFolder />,
      },
      { path: "folders/:folderId/:fileId", element: <File /> },
    ],
  },
  {
    path: "/share/:token",
    element: <SharedFileView />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
