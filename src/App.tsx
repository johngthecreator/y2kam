import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./views/Home";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <div> Something went wrong!</div>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // {
      //   path: "test",
      //   action: todosAction,
      //   loader: todosLoader,
      //   Component: TodosList,
      //   ErrorBoundary: TodosBoundary,
      //   children: [
      //     {
      //       path: ":id",
      //       loader: todoLoader,
      //       Component: Todo,
      //     },
      //   ],
      // },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;