import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../App.context";
import urls, { LAST_ROUTE_KEY } from "../urls";

// Redirects the user to the last route they visited,
// and handles any context changes that should happen before entering the new route
export const Redirect = () => {
  const { toolStates } = useContext(AppContext);
  const [route, setRoute] = useState<string>();

  useEffect(() => {
    const lastRoute = localStorage.getItem(LAST_ROUTE_KEY) ?? "/chip";

    for (const { href, tool } of Object.values(urls)) {
      if (href == lastRoute && tool) {
        toolStates.setTool(tool);
      }
    }

    setRoute(lastRoute);
  }, []);

  return route ? <Navigate to={route} /> : <></>;
};
