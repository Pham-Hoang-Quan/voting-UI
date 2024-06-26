
// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
// import Notifications from "layouts/notifications";

// import Profile from "layouts/profile";
// import SignIn from "layouts/authentication/sign-in";
// import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import AdminDashboard from "views/admin/AdminDashboard";
import { Home } from "@mui/icons-material";
import { Group } from "@mui/icons-material";
import { HowToVote } from "@mui/icons-material";
const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Home fontSize="small">dashboard</Home>,
    route: "/adminDashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Users",
    key: "dashboard",
    icon: <Group fontSize="small">dashboard</Group>,
    route: "/users",
    // component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Votings",
    key: "dashboard",
    icon: <HowToVote fontSize="small">dashboard</HowToVote>,
    route: "/votings",
    // component: <Dashboard />,
  },
  
];

export default routes;
