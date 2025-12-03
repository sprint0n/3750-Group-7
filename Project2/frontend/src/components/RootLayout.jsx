import { Outlet, useNavigation } from "react-router-dom";
import MainNavigation from "./MainNavigation";
import classes from "./RootLayout.module.css";

function RootLayout() {
  const navigation = useNavigation();

  return (
    <div className={classes["root-layout"]}>
      <MainNavigation />
      <main className={classes["main-content"]}>
        {navigation.state === "loading" && (
          <p className={classes["loading"]}>Loading...</p>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
