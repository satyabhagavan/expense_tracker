import React from "react";
import "./LandingPage.css";
import { Button, Input, FormGroup } from "reactstrap";
// const axios = require("axios").default;
import axios from "axios";

function LandingPage({ doRefresh }) {
  //   const login = true;

  const BASE_URL = "http://localhost:8000/api";

  const [login, setLogin] = React.useState(true);
  const [loginDetails, setLoginDetails] = React.useState({});
  const [signUpDetails, setSignUpDetails] = React.useState({});

  const handleLogin = () => {
    console.log(loginDetails);

    axios
      .post(BASE_URL + "/get_uid/", {
        email: loginDetails["email"],
      })
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          localStorage.setItem("email", loginDetails["email"]);
          localStorage.setItem("uid", response.data.uid);
          setLoginDetails({ email: "", phone_number: "" });
          doRefresh();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleSignUp = () => {
    // console.log(signUpDetails);
    axios
      .post(BASE_URL + "/register/", {
        email: signUpDetails.email,
        name: signUpDetails.name,
        phone_number: signUpDetails.phone_number,
      })
      .then((res) => {
        // console.log(res);
        alert("registeration successful");
        setLogin(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="landing__page">
        {login === true ? (
          <div className="login__box">
            <form className="login__form">
              <h3>Login</h3>
              <Input
                type="email"
                placeholder="email"
                value={loginDetails.email}
                onChange={(e) => {
                  setLoginDetails((old_state) => ({
                    ...old_state,
                    email: e.target.value,
                  }));
                }}
              />
              <Input
                type="number"
                placeholder="phone number"
                value={loginDetails.phone_number}
                onChange={(e) => {
                  setLoginDetails((old_state) => ({
                    ...old_state,
                    phone_number: e.target.value,
                  }));
                }}
              />

              <Button
                className="submit__button"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                Submit
              </Button>
              <p
                className="form__link"
                onClick={(e) => {
                  e.preventDefault();
                  setLogin(false);
                }}
              >
                Register Instead
              </p>
            </form>
          </div>
        ) : (
          <div className="signup__box">
            <FormGroup>
              <form className="signUp__form">
                <Input
                  type="name"
                  placeholder="name"
                  value={signUpDetails.name}
                  onChange={(e) => {
                    setSignUpDetails((old_state) => ({
                      ...old_state,
                      name: e.target.value,
                    }));
                  }}
                />
                <Input
                  type="email"
                  placeholder="email"
                  value={signUpDetails.email}
                  onChange={(e) => {
                    setSignUpDetails((old_state) => ({
                      ...old_state,
                      email: e.target.value,
                    }));
                  }}
                />
                <Input
                  type="number"
                  placeholder="phone number"
                  value={signUpDetails.phone_number}
                  onChange={(e) => {
                    setSignUpDetails((old_state) => ({
                      ...old_state,
                      phone_number: e.target.value,
                    }));
                  }}
                />
                <Input
                  type="password"
                  placeholder="password"
                  value={signUpDetails.password}
                  onChange={(e) => {
                    setSignUpDetails((old_state) => ({
                      ...old_state,
                      password: e.target.value,
                    }));
                  }}
                />

                <Button
                  className="submit__button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignUp();
                  }}
                >
                  Submit
                </Button>
                <p
                  className="form__link"
                  onClick={(e) => {
                    e.preventDefault();
                    setLogin(true);
                  }}
                >
                  Login Instead
                </p>
              </form>
            </FormGroup>
          </div>
        )}
      </div>
    </>
  );
}

export default LandingPage;
