import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "./Login";
import Register from "./Register";
import RootFolder from "./RootFolder";
import AddFolder from "./AddFolder";
import AddFile from "./AddFile";

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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
