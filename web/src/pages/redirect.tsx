import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { LAST_ROUTE_KEY } from "../urls";

// Redirects the user to the last route they visited,
// and handles any context changes that should happen before entering the new route
export const Redirect = () => {
  const [route, setRoute] = useState<string>();

  useEffect(() => {
    const lastRoute = localStorage.getItem(LAST_ROUTE_KEY) ?? "/chip";
    setRoute(lastRoute);
  }, []);

  return route ? <Navigate to={route} /> : <></>;
};
