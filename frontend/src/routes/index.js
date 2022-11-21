import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import LoggedInLayout from "../layout";
import Connections from "../pages/Connections/";
import Dashboard from "../pages/Dashboard/";
import Login from "../pages/Login/";
import ShippingReport from "../pages/ShippingReport";
import Signup from "../pages/Signup/";
import Users from "../pages/Users";
import Route from "./Route";
import docs from "../pages/docs/";
import tokens from "../pages/tokens/";




const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <WhatsAppsProvider>
            <LoggedInLayout>
              <Route exact path="/" component={Dashboard} isPrivate />              
              <Route
                exact
                path="/Connections"
                component={Connections}
                isPrivate
              />
              <Route exact path="/users" component={Users} isPrivate />
              <Route exact path="/docs" component={docs} isPrivate />
              <Route exact path="/tokens" component={tokens} isPrivate />
              <Route exact path="/ShippingReport" component={ShippingReport} isPrivate />
              
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
