import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    //Logout the user here in the useEffect then proceed to take them to login screen
    //This is a timer for the logout screen
    const timer = setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <h1>Successfully Logged out!</h1>
      <p>Redirecting to login screen...</p>
    </>
  );
}

export default LogoutPage;
