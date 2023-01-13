import axios from "axios";
import React from "react";
import "./App.css";
import Detail from "./components/Detail";
import LandingPage from "./components/LandingPage";

function App() {
  const [refresh, setRefresh] = React.useState(true);
  const BASE_URL = "http://localhost:8000/api";
  const user_loggedIn_uid = localStorage.getItem("uid");
  const user_loggedIn_email = localStorage.getItem("email");
  const [user, setUser] = React.useState({
    email: "",
    uid: "",
    phone_number: "",
    name: "",
  });

  // console.log(user);

  React.useEffect(() => {
    axios
      .post(BASE_URL + "/get_info/", {
        uid: user_loggedIn_uid,
        email: user_loggedIn_email,
      })
      .then(function (response) {
        // console.log(response);
        if (response.status === 200) {
          setUser(response.data.data);
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }, [user_loggedIn_email, user_loggedIn_uid, refresh]);

  React.useEffect(() => {}, [refresh]);

  const doRefresh = () => {
    window.location.reload();
    setRefresh(!refresh);
  };

  console.log(user);
  return (
    <>
      <div>
        {user["email"] === "" ? (
          <LandingPage doRefresh={doRefresh} />
        ) : (
          <Detail userInfo={user} doRefresh={doRefresh} />
        )}
      </div>
    </>
  );
}

export default App;
