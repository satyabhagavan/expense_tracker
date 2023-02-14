import axios from "axios";
import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";

function Transactions({
  userInfo,
  friends,
  closeTheModel,
  doRefresh,
  txnDetails,
  setTxnSettle,
}) {
  const [activeState, setActiveState] = useState([]);
  const [userInvolved, setUserInvolved] = useState(false);
  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState();
  const [discription, setDiscription] = useState("");
  const [settleTxn, setSettleTxn] = useState(false);

  const handleClick = (i) => {
    let temp = { ...activeState };
    temp[i] = !temp[i];
    setActiveState(temp);
  };

  const submitTxn = () => {
    let usersInvolved = [];

    if (settleTxn) {
      usersInvolved.push(txnDetails.email);
    } else {
      if (userInvolved) usersInvolved.push(userInfo.email);

      for (let i = 0; i < friends.length; i++) {
        if (activeState[i] === true) {
          console.log(friends[i]);
          usersInvolved.push(friends[i].email);
        }
      }
    }

    axios
      .post("http://localhost:8000/api/transaction/", {
        uid: userInfo.uid,
        amount: parseFloat(amount),
        users_involved: usersInvolved,
        payed_by: email,
        discription: discription,
      })
      .then((res) => {
        doRefresh();
        closeTheModel();
      })
      .catch((err) => {
        console.log(err);
      });

    setTxnSettle({});
    closeTheModel();
  };

  useEffect(() => {
    //create a map
    let temp = {};
    for (let i = 0; i < friends.length; i++) {
      temp[i] = false;
    }

    setActiveState(temp);
  }, [friends]);

  useEffect(() => {
    //for rendering
  }, [activeState]);

  useEffect(() => {
    if ("amount" in txnDetails) {
      setEmail(userInfo.email); //as the user is paying to the other
      setAmount(txnDetails.amount * -1);
      setSettleTxn(true);
      setDiscription(`settle up with ${txnDetails.email}`);
    }
  }, [txnDetails, userInfo]);

  return (
    <>
      <div className="transaction_form">
        <div className="transaction_form_details">
          <div className="txn__detials">
            <div className="txn__details__row">
              <p>User Id</p>
              <p>{userInfo.uid}</p>
            </div>
            <div className="txn__details__row">
              <p>Payed By</p>
              <Input
                placeholder="please enter the email of the user payed"
                type="email"
                style={{
                  width: "70%",
                }}
                readOnly={settleTxn}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="txn__details__row">
              <p>Amount Payed</p>
              <Input
                placeholder="please enter the amount"
                type="number"
                style={{
                  width: "70%",
                }}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
            </div>
            <div className="txn__details__row">
              <p>Discription</p>
              <Input
                placeholder="please enter discription"
                type="text"
                style={{
                  width: "70%",
                }}
                readOnly={settleTxn}
                value={discription}
                onChange={(e) => {
                  setDiscription(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {!settleTxn && (
          <div className="txn__emails">
            {/* email id of the user */}
            <div
              className="email"
              onClick={() => {
                setUserInvolved(!userInvolved);
              }}
              style={{ background: userInvolved ? "#0ac415" : "#7dd8c1" }}
            >
              {userInfo.email}
            </div>

            {/* email id's of friends of the user */}
            {friends.map((each, ind) => {
              return (
                <div
                  className="email"
                  key={each.email}
                  onClick={() => handleClick(ind)}
                  style={{
                    background: activeState[ind] ? "#0ac415" : "#7dd8c1",
                  }}
                >
                  {each.email}
                </div>
              );
            })}
          </div>
        )}
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
