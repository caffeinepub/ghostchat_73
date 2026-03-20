import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import ChatPage from "./pages/ChatPage";
import CreateChatPage from "./pages/CreateChatPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupChatPage from "./pages/GroupChatPage";
import GroupJoinPage from "./pages/GroupJoinPage";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground font-body text-sm",
            success: "border-border",
            error: "border-destructive/30",
          },
        }}
      />
    </>
  ),
});

// Routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const createChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateChatPage,
});

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$token",
  component: JoinPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$chatId",
  component: ChatPage,
});

const createGroupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-group",
  component: CreateGroupPage,
});

const groupJoinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/group-join/$token",
  component: GroupJoinPage,
});

const groupChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/group/$groupId",
  component: GroupChatPage,
});

// Router
const routeTree = rootRoute.addChildren([
  homeRoute,
  createChatRoute,
  joinRoute,
  chatRoute,
  createGroupRoute,
  groupJoinRoute,
  groupChatRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
