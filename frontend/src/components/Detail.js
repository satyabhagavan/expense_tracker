import axios from "axios";
import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
} from "reactstrap";
import "./Details.css";
import Transactions from "./Transactions";

function Detail({ userInfo, doRefresh }) {
  //   console.log(user.user.email);
  //   const [tab, setTab] = React.useState("friends")
  const BASE_URL = "http://localhost:8000/api";
  const [friends, setFriends] = useState([]);
  const [transactionsByMe, setTransactionsByMe] = useState([]);
  const [transationsInvolved, setTransactionsInvolved] = useState([]);
  const [modal, setModal] = useState(false);
  const [txn_modal, setTxn_modal] = useState(false);
  const [txnDeatils, setTxnDetails] = useState({ users: [] });
  const toggle = () => {
    setModal(!modal);
  };
  const toggleTxn = () => {
    setTxn_modal(!txn_modal);
  };
  // console.log(friends);
  const user = userInfo;
  // console.log(txnDeatils);

  React.useEffect(() => {
    axios
      .post(BASE_URL + "/transactions/", {
        uid: user.uid,
      })
      .then((res) => {
        // console.log(res.data);
        setTransactionsByMe(res.data.done_by_user);
        setTransactionsInvolved(res.data.involved_by_user);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user.uid]);

  React.useEffect(() => {
    axios
      .post(BASE_URL + "/friends/", {
        email: user.email,
      })
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          setFriends(res.data.data);
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user.email]);

  return (
    <>
      <h2>{user.email}</h2>
      {/* transactions */}
      {/* friends */}

      <h2>Friends</h2>
      <Table hover striped>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {friends.map((each, ind) => {
            return (
              <tr key={ind}>
                <th scope="row">{ind + 1}</th>
                <td>{each.email}</td>
                <td>{each.name}</td>
                <td style={{ color: each.amount >= 0 ? "green" : "red" }}>
                  ₹{each.amount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="transactions_heading">
        <h2>transactions</h2>
        <h2
          onClick={() => {
            toggleTxn();
          }}
        >
          Add Transaction
        </h2>
      </div>
      <h3>Done by me</h3>
      <div>
        <Table hover striped>
          <thead>
            <tr>
              <th>id</th>
              <th>Email done by</th>
              <th>Amount</th>
              <th>Among</th>
            </tr>
          </thead>
          <tbody>
            {transactionsByMe.map((each, ind) => {
              return (
                <tr
                  key={ind}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(transactionsByMe[ind]);
                  }}
                >
                  <th>{each.id}</th>
                  <th>{each.done_by}</th>
                  <th>{each.amount}</th>
                  <th>{each.no_of}</th>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <h3>Involved</h3>
      <div>
        <Table hover striped>
          <thead>
            <tr>
              <th>id</th>
              <th>Email done by</th>
              <th>Amount</th>
              <th>Among</th>
            </tr>
          </thead>
          <tbody>
            {transationsInvolved.map((each, ind) => {
              return (
                <tr
                  key={ind}
                  onClick={(e) => {
                    e.preventDefault();
                    // console.log(transationsInvolved[ind]);
                    setTxnDetails(transationsInvolved[ind]);
                    toggle();
                  }}
                >
                  <th>{each.id}</th>
                  <th>{each.done_by}</th>
                  <th>{each.amount}</th>
                  <th>{each.no_of}</th>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {/* log out */}
      <div
        className="logout_button"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem("email", "");
          localStorage.setItem("uid", "");
          doRefresh();
        }}
      >
        <h2>Logout</h2>
      </div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>txn # {}</ModalHeader>
        <ModalBody>
          <div className="txn__detials">
            <div className="txn__details__row">
              <p>Transaction Id</p>
              <p>{txnDeatils.id}</p>
            </div>
            <div className="txn__details__row">
              <p>Transaction Time</p>
              <p>{txnDeatils.time}</p>
            </div>
            <div className="txn__details__row">
              <p>Transaction amount</p>
              <p>{txnDeatils.amount}</p>
            </div>
            <div className="txn__details__row">
              <p>Transaction among</p>
              <p>{txnDeatils.no_of} people</p>
            </div>
            <div className="txn__emails">
              {txnDeatils.users.map((each, ind) => {
                return (
                  <div className="email" key={ind}>
                    {each}
                  </div>
                );
              })}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Ok
          </Button>{" "}
          <Button color="danger" onClick={toggle}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={txn_modal} toggle={toggleTxn} backdrop={false}>
        <div className="txn__modal">
          <Transactions
            friends={friends}
            closeTheModel={toggleTxn}
            userInfo={userInfo}
          />
        </div>
      </Modal>

      {/* for making transactions */}
      {/* <Transactions friends={friends} /> */}
    </>
  );
}

export default Detail;
