import { NavLink } from "react-router-dom";
import classes from "./MainNavigation.module.css";

function MainNavigation() {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink
              to="/app/home"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/history"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              History
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/transfer"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Transfer
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/exchange"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Withdrawn/Deposit
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/Logout"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
