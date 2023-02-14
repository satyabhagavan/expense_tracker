import axios from "axios";
import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
  Input,
} from "reactstrap";
import "./Details.css";
import Transactions from "./Transactions";

function Detail({ userInfo, doRefresh }) {
  const BASE_URL = "http://localhost:8000/api";
  const [friends, setFriends] = useState([]);
  const [transactionsByMe, setTransactionsByMe] = useState([]);
  const [transationsInvolved, setTransactionsInvolved] = useState([]);
  const [txnDeatils, setTxnDetails] = useState({ users: [] });
  const [refresh, setRefresh] = useState(true);
  const [email, setEmail] = useState("");
  const [modal, setModal] = useState(false);
  const [txn_modal, setTxn_modal] = useState(false);
  const [friendModal, setFriendModal] = useState(false);
  const [txnSettle, setTxnSettle] = useState({});

  const toggle = () => {
    setModal(!modal);
  };

  const toggleTxn = () => {
    setTxn_modal(!txn_modal);
  };

  const friendToggle = () => {
    setFriendModal(!friendModal);
  };

  const do_Refresh = () => {
    setRefresh(!refresh);
  };

  const deleteTxn = (id) => {
    console.log(id);
    axios
      .delete(`http://localhost:8000/api/transaction/${id}`)
      .then((res) => {
        console.log(res);
        do_Refresh();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const submitFrReq = () => {
    axios
      .post("http://localhost:8000/api/add_friend/", {
        friend_email: email,
        email: userInfo.email,
      })
      .then((res) => {
        console.log(res);
        do_Refresh();
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response.status === 400) {
          console.log(err);
          alert(err.response.data.message);
        }
      });

    setEmail(""); //as it will be the placeholder again
    friendToggle();
  };

  const handleSettleUp = (each) => {
    // console.log(each);
    setTxnSettle(each);
    toggleTxn();
  };
  // console.log(txnSettle);

  const user = userInfo;

  React.useEffect(() => {
    axios
      .post(BASE_URL + "/transactions/", {
        uid: user.uid,
      })
      .then((res) => {
        setTransactionsByMe(res.data.done_by_user);
        setTransactionsInvolved(res.data.involved_by_user);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user.uid, refresh]);

  React.useEffect(() => {
    axios
      .post(BASE_URL + "/friends/", {
        email: user.email,
      })
      .then((res) => {
        if (res.status === 200) {
          setFriends(res.data.data);
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user.email, refresh]);

  return (
    <>
      <h2>{user.email}</h2>
      {/* transactions */}
      {/* friends */}

      <div className="friends__heading">
        <h2>Friends</h2>
        <h2
          onClick={() => {
            friendToggle();
          }}
          className="button_styled"
          style={{ backgroundColor: "navy", color: "red" }}
        >
          Add Friends
        </h2>
      </div>
      <Table hover striped className="friends__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Action</th>
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
                {Math.floor(each.amount) === 0 ? (
                  <td className="settled__up__button">Settled up</td>
                ) : each.amount < 0 ? (
                  <td
                    className="settle__up__button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSettleUp(each);
                    }}
                  >
                    {" "}
                    Settle up{" "}
                  </td>
                ) : (
                  <td className="remaind__button"> Remaind </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="transactions_heading">
        <h2>transactions</h2>
        <h2
          onClick={() => {
            setTxnSettle({});
            toggleTxn();
          }}
          className="button_styled"
          style={{ backgroundColor: "navy", color: "red" }}
        >
          Add Transaction
        </h2>
      </div>

      <h3>My payments</h3>
      <div>
        <Table hover striped className="transactions__table">
          <thead>
            <tr>
              <th>id</th>
              <th>Email done by</th>
              <th>Amount</th>
              <th>Among</th>
              <th>Discription</th>
            </tr>
          </thead>
          <tbody>
            {transactionsByMe.map((each, ind) => {
              return (
                <tr
                  key={ind}
                  onClick={(e) => {
                    e.preventDefault();
                    setTxnDetails(transactionsByMe[ind]);
                    toggle();
                  }}
                >
                  <td>{each.id}</td>
                  <td>{each.done_by}</td>
                  <td>₹{each.amount}</td>
                  <td>{each.no_of}</td>
                  <td>{each.discription}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <h3>Involved</h3>
      <div>
        <Table hover striped className="transactions__table">
          <thead>
            <tr>
              <th>id</th>
              <th>Email done by</th>
              <th>Amount</th>
              <th>Among</th>
              <th>Discription</th>
            </tr>
          </thead>
          <tbody>
            {transationsInvolved.map((each, ind) => {
              return (
                <tr
                  key={ind}
                  onClick={(e) => {
                    e.preventDefault();
                    setTxnDetails(transationsInvolved[ind]);
                    toggle();
                  }}
                >
                  <td>{each.id}</td>
                  <td>{each.done_by}</td>
                  <td>₹{each.amount}</td>
                  <td>{each.no_of}</td>
                  <td>{each.discription}</td>
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
        <h2
          className="button_styled"
          style={{ backgroundColor: "navy", color: "red" }}
        >
          Logout
        </h2>
      </div>
      {/* viewing a transaction */}
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
            <div className="txn__details__row">
              <p>discription</p>
              <p>{txnDeatils.discription}</p>
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
          <Button
            color="danger"
            onClick={() => {
              toggle();
              deleteTxn(txnDeatils.id);
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* creating transaction modal */}
      <Modal isOpen={txn_modal} toggle={toggleTxn} backdrop={false}>
        <div className="txn__modal">
          <Transactions
            friends={friends}
            closeTheModel={toggleTxn}
            userInfo={userInfo}
            doRefresh={do_Refresh}
            txnDetails={txnSettle}
            setTxnSettle={setTxnSettle}
          />
        </div>
      </Modal>

      {/* creating a friend modal */}
      <Modal isOpen={friendModal} toggle={friendToggle} backdrop={false}>
        <div className="txn__detials">
          <div className="txn__details__row">
            <p>Payed By</p>
            <Input
              placeholder="please enter the email of the user"
              type="email"
              style={{
                width: "70%",
              }}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="model__footer__buttons">
          <div
            className="button_styled"
            onClick={() => friendToggle()}
            style={{ backgroundColor: "red" }}
          >
            close
          </div>
          <div
            className="button_styled"
            onClick={() => {
              submitFrReq();
            }}
            style={{ backgroundColor: "blue" }}
          >
            Add friend
          </div>
        </div>
      </Modal>

      {/* for making transactions */}
      {/* <Transactions friends={friends} /> */}
    </>
  );
}

export default Detail;
