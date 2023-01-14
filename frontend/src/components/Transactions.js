import React, { useEffect, useState } from "react";

function Transactions({ userInfo, friends, closeTheModel }) {
  //   console.log(friends);
  const [activeState, setActiveState] = useState([]);

  const handleClick = (i) => {
    // console.log("pressed");
    let temp = { ...activeState };
    temp[i] = !temp[i];
    setActiveState(temp);
  };

  const submitTxn = () => {
    let usersInvolved = [];
    for (let i = 0; i < friends.length; i++) {
      if (activeState[i] === true) {
        console.log(friends[i]);
        usersInvolved.push(friends[i].email);
      }
    }
    console.log(usersInvolved);
    alert(usersInvolved);
    closeTheModel();
  };

  // console.log(friends);
  useEffect(() => {
    //create a map
    let temp = {};
    for (let i = 0; i < friends.length; i++) {
      temp[i] = false;
    }

    setActiveState(temp);

    console.log("state", temp);
  }, [friends]);

  useEffect(() => {
    //for rendering
  }, [activeState]);

  return (
    <>
      <div className="transaction_form">
        <div className="transaction_form_details"></div>
        <div className="txn__emails">
          {/* email id's of users */}
          {friends.map((each, ind) => {
            return (
              <div
                className="email"
                key={ind}
                onClick={() => handleClick(ind)}
                style={{ background: activeState[ind] ? "#0ac415" : "#7dd8c1" }}
              >
                {each.email}
              </div>
            );
          })}
        </div>
      </div>
      <div className="model__footer__buttons">
        <div
          className="button_styled"
          onClick={() => closeTheModel()}
          style={{ backgroundColor: "red" }}
        >
          close
        </div>
        <div
          className="button_styled"
          onClick={() => {
            submitTxn();
          }}
          style={{ backgroundColor: "blue" }}
        >
          Record
        </div>
      </div>
    </>
  );
}

export default Transactions;
