import React from "react";
import "./LandingPage.css";
import { Row } from "reactstrap";
import axios from "axios";

function LandingPage({ doRefresh }) {
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
          alert("login succesful");
          localStorage.setItem("email", loginDetails["email"]);
          localStorage.setItem("uid", response.data.uid);
          setLoginDetails({ email: "", phone_number: "" });
          doRefresh();
        }
      })
      .catch(function (error) {
        alert("please check your credentials");
        console.log(error);
      });
  };

  const handleSignUp = () => {
    axios
      .post(BASE_URL + "/register/", {
        email: signUpDetails.email,
        name: signUpDetails.name,
        phone_number: signUpDetails.phone_number,
      })
      .then((res) => {
        alert("registration successful");
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
              <h3 className="login__heading">WELCOME BACK</h3>
              <h3 className="login__title" style={{ marginBottom: "20px" }}>
                Log into your account
              </h3>
              <label className="input__label">Email or Username</label>
              <input
                className="form__input"
                type="email"
                placeholder="Enter your email or username"
                value={loginDetails.email}
                onChange={(e) => {
                  setLoginDetails((old_state) => ({
                    ...old_state,
                    email: e.target.value,
                  }));
                }}
              />
              <label className="input__label">Password</label>
              <input
                className="form__input"
                type="password"
                placeholder="Enter your password"
                value={loginDetails.phone_number}
                onChange={(e) => {
                  setLoginDetails((old_state) => ({
                    ...old_state,
                    phone_number: e.target.value,
                  }));
                }}
              />

              <div
                className="submit__button"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                Submit
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: Row,
                  color: "rgba(127, 128, 132, 1)",
                }}
              >
                Not registered yet ?&nbsp;&nbsp;
                <p
                  className="form__link"
                  onClick={(e) => {
                    e.preventDefault();
                    setLogin(false);
                  }}
                  style={{
                    color: "rgba(197, 199, 202, 1)",
                    cursor: "pointer",
                  }}
                >
                  Register
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="signup__box">
            <h3 className="login__heading">SIGN UP</h3>
            <h3 className="login__title" style={{ marginBottom: "20px" }}>
              Create an account to continue
            </h3>
            <form className="signUp__form">
              <label className="input__label">Name</label>
              <input
                className="form__input"
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
              <label className="input__label">Email</label>
              <input
                className="form__input"
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
              <label className="input__label">Phone number</label>
              <input
                className="form__input"
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
              <label className="input__label">Password</label>
              <input
                className="form__input"
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

              <div
                className="submit__button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
              >
                Submit
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: Row,
                  color: "rgba(127, 128, 132, 1)",
                }}
              >
                Already have an account ?&nbsp;&nbsp;
                <p
                  className="form__link"
                  onClick={(e) => {
                    e.preventDefault();
                    setLogin(true);
                  }}
                  style={{
                    color: "rgba(197, 199, 202, 1)",
                    cursor: "pointer",
                  }}
                >
                  Login
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default LandingPage;
