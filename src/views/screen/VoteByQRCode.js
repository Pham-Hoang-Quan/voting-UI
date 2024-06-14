import React, { useContext, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import classnames from "classnames";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase.js";
import { Flex, Spin } from 'antd';
import { Button as AtndButton, Result } from 'antd';
import moment from "moment";

import {
    Button,
    FormGroup,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Container,
    Row,
    Col,
    Modal,
    Card, CardHeader, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Table, Label, FormText, ListGroup, ListGroupItem, CardFooter
} from "reactstrap";
import { AppContext } from "context/AppContext";

import { Link, useNavigate } from 'react-router-dom';
import PublicVotings from "components/home/PublicVotings";
import { message } from 'antd';
import axios from "axios";
import apiUrl from "api-url";
export default function VoteByQRCode() {
    const [tabs, setTabs] = React.useState(1);
    const [inputFocus, setInputFocus] = React.useState(false);
    const navigate = useNavigate();
    const [idSearch, setIdSearch] = React.useState("");
    const [formModal, setFormModal] = React.useState(false);
    const [votingInfo, setVotingInfo] = React.useState();
    const [candidateInfo, setCandidateInfo] = React.useState();
    const [errorSearch, setErrorSearch] = React.useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [voted, setVoted] = useState(false);
    const [ended, setEnded] = useState(false);

    // lấy candidateId ở url
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const candidateId = searchParams.get('candidateId');
    const { setAuthUser } = useContext(AppContext);

    const [messageApi, contextHolder] = message.useMessage();
    const warning = (message) => {
        messageApi.open({
            type: 'warning',
            content: message,
        });
    };
    const success = (message) => {
        messageApi.open({
            type: 'success',
            content: message,
        });
    };

    const [loading, setLoading] = React.useState(false);



    const signIn = async () => {
        try {
            // đăng nhập bằng firebase auth
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Đăng nhập thành công
                    const user = userCredential.user;
                    console.log("user logon", user);
                    console.log("user logon", user.uid);
                    signInWithMongodb();
                }) // bắt lỗi
                .catch((error) => {
                    const errorMessage = error.message;
                    console.log("error", error);
                    alert(errorMessage);
                    return;
                })
        } catch (e) {
            console.error(e);
        } finally {
        }

    }

    // const { setAuthUser } = useContext(AppContext);

    const signInWithMongodb = async () => {
        console.log("sign in", email, password)
        try {
            const res = await axios.post(`${apiUrl}/api/auth/login`, {
                email: email,
                password: password
            })
                .then((res) => {
                    console.log(res.data.user);

                    if (res.data.user.userId == "0") {
                        warning("This account is not available");
                        return
                    }
                    if (res.data.error) {
                        throw new Error(res.data.error);
                    }

                    localStorage.setItem("user-voting", JSON.stringify(res.data.user));
                    setAuthUser(res.data.user);
                    // navigate('/');
                    setFormModal(false);
                })
        } catch (error) {
            // toast.error(error.message);
        } finally {
            // setLoading(false);

        }
    };

    const signup = async () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
                const user = userCredential.user;
            }
            )
            .catch((error) => {
                console.error(error);
            });


        // thêm vào mongodb
        const res = await fetch(`${apiUrl}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: "123",
                avtUrl: "avatar",
                email,
                password,
                name,
                role: "user",
                userId: "0",
                address: "address"
            }),
        });

        if (res.ok) {
            const data = await res.json();
            console.log(data);
            localStorage.setItem("user-voting", JSON.stringify(data.newUser));
            setAuthUser(data.newUser);
            handleAddUseIdOnBC(data.newUser._id);
            // history.push('/');
            // navigate('/');
            setFormModal(false);
        }
    }

    const handleAddUseIdOnBC = async (userId) => {
        try {
            axios.post(`${apiUrl}/api/smartcontract/addUser`,
                { user: userId }).
                then(response => {
                    console.log(response.data);
                });
        } catch (error) {
            console.error(error);
        }
    }

    const userInfor = JSON.parse(localStorage.getItem("user-voting"));

    React.useEffect(() => {
        document.body.classList.toggle("index-page");
        // Specify how to clean up after this effect:
        return function cleanup() {
            document.body.classList.toggle("index-page");
        };
    }, []);
    React.useEffect(() => {
        // lấy thông tin của ứng viên từ candidateId ở url
        if (candidateId) {
            const getCandidate = async () => {
                try {
                    const res = await axios.get(`${apiUrl}/api/candidates/${candidateId}`)
                        .then(res => {
                            // console.log(res.data);
                            setCandidateInfo(res.data);
                        }).catch(err => {
                            console.log(err);
                            warning("This candidate is not available");
                        });
                } catch (e) {
                    console.error(e);
                }
            }
            getCandidate();
        }

    }, [candidateInfo]);
    React.useEffect(() => {
        if (candidateInfo) {
            const getVotingInfo = async () => {
                try {
                    const res2 = await axios.get(`${apiUrl}/api/votings/${candidateInfo.idVoting}`)
                        .then(res2 => {
                            console.log(res2.data);
                            if (moment(res2.data.endAt, 'YYYYMMDD').isBefore(moment())) {
                                setEnded(true);                            }
                        })
                } catch (e) {
                    console.error(e);
                }
            }
            getVotingInfo();
        }

    }, []);
    // nếu chưa đăng nhập thì hiển thị 2 tab đăng nhập và đăng kí.



    function generateRandomId() {
        return Date.now(); // Sử dụng thời gian hiện tại làm ID, có thể không đảm bảo tính duy nhất trong một số trường hợp.
    }

    const handleAddVoteTransOnBC = async () => {
        // kiểm tra đã đăng nhập chưa
        if (!userInfor) {
            warning("You need to login to vote");
            setFormModal(true);
            return;
        }
        try {
            setLoading(true);
            const canIdString = candidateId.toString()
            const id = generateRandomId().toString();
            const res = await axios.post(`${apiUrl}/api/smartcontract/addVote`, {
                _id: 'v' + id,
                _idUser: userInfor._id,
                _idCandidate: canIdString,
                _idVoting: candidateInfo.idVoting,
                _time: id
            }).then(result => {
                console.log(result.data);
                // setVotedModal(true);
                success("Voting added successfully");
                setLoading(false);
                // navigate(`/votingDetail?votingId=${candidateInfo.idVoting}`);

            })
        } catch (error) {
            // alert(error.reason);
            console.log(error.message);
            if (error.reason == 'execution reverted: User has already voted for this votingId') {
                alert("You have already voted for this voting");
            }
        } finally {
            setLoading(false);
            setVoted(true);
        }
    }
    if(ended) {
        return (
            <div style={{ margin: '20px', backgroundColor: 'white' }}>
                <Result
                    status="warning"
                    title="This voting has ended."
                    subTitle="Thank you for your interest."
                    extra={[
                        <AtndButton onClick={() => { navigate(`/votingDetail?votingId=${candidateInfo.idVoting}`) }} type="primary" key="console">
                            Go Voting Detail
                        </AtndButton>
                    ]}
                />
            </div>
        )
    }
    if (loading) {
        return (
            <Flex style={{ margin: 'auto' }} align="center" gap="middle">
                <Spin />
            </Flex>
        )
    }
    if (voted) {
        return (
            <div style={{ margin: '20px', backgroundColor: 'white' }}>
                <Result
                    status="success"
                    title="You have successfully voted."
                    subTitle="Thank you for your vote."
                    extra={[
                        <AtndButton onClick={() => { navigate(`/votingDetail?votingId=${candidateInfo.idVoting}`) }} type="primary" key="console">
                            Go Voting Detail
                        </AtndButton>
                    ]}
                />
            </div>

        )
    }
    return (
        <>
            {contextHolder}
            <IndexNavbar />
            <Col style={{ marginTop: '200px' }} className="ml-auto mr-auto" lg="4" md="6">
                {(candidateInfo) ? (
                    <Card className="card-coin card-plain">
                        <CardHeader>
                            <img
                                alt="..."
                                className="img-center img-fluid rounded-circle"
                                //   src={require("assets/img/mike.jpg")}
                                src={candidateInfo.imgUrl}
                            />
                            <h4 className="title"></h4>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col className="text-center" md="12">
                                    <h4 className="text-uppercase">{candidateInfo.name}</h4>
                                    {/* <span>
                                        <span className="btn-link" style={{ color: 'white' }}>{candidateInfo.countVote}</span>
                                        votes
                                    </span> */}
                                    <hr className="line-primary" />
                                </Col>
                            </Row>
                            <Row>
                                <ListGroup>
                                    <ListGroupItem>{candidateInfo.description.slice(0, 190) + ' ...'}</ListGroupItem>
                                </ListGroup>
                            </Row>
                        </CardBody>
                        <CardFooter className="text-center">
                            <Button className="btn-simple" color="primary" onClick={() => { handleAddVoteTransOnBC(candidateInfo._id) }}>
                                Vote
                            </Button>
                        </CardFooter>
                    </Card>
                ) :
                    (<div>Candidate not found!</div>)
                }
            </Col>
            <Modal
                modalClassName="modal-black"
                isOpen={formModal}
                toggle={() => setFormModal(false)}
            >
                <div>
                    <Col style={{ margin: '50px' }} className="ml-auto mr-auto" lg="12" md="12">
                        <Card className="card-coin card-plain">
                            <CardBody>
                                <Nav
                                    className="nav-tabs-primary justify-content-center"
                                    tabs
                                >
                                    <NavItem>
                                        <NavLink
                                            className={classnames({
                                                active: tabs === 1,
                                            })}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTabs(1);
                                            }}
                                            href="#pablo"
                                        >
                                            Đăng nhập
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({
                                                active: tabs === 2,
                                            })}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTabs(2);
                                            }}
                                            href="#pablo"
                                        >
                                            Đăng kí
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent
                                    className="tab-subcategories"
                                    activeTab={"tab" + tabs}
                                >
                                    {/* // nội dung tab đăng nhập */}
                                    <TabPane tabId="tab1">
                                        <Row>
                                            <Label sm="3">Email</Label>
                                            <Col sm="9">
                                                <FormGroup>
                                                    <Input placeholder="Email" type="text" onChange={(e) => setEmail(e.target.value)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Label sm="3">Password</Label>
                                            <Col sm="9">
                                                <FormGroup>
                                                    <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Button
                                            className="btn-simple btn-round "
                                            color="primary"
                                            type="submit"
                                            onClick={signIn}
                                        >
                                            Đăng nhập

                                        </Button>
                                    </TabPane>
                                    {/* // nội dung tab đăng kí */}
                                    <TabPane tabId="tab2">
                                        <Row>
                                            <Label sm="3">Full name</Label>
                                            <Col sm="9">
                                                <FormGroup>
                                                    <Input placeholder="Full name" type="text" onChange={(e) => setName(e.target.value)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Label sm="3">Email</Label>
                                            <Col sm="9">
                                                <FormGroup>
                                                    <Input placeholder="Email" type="text" onChange={(e) => setEmail(e.target.value)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Label sm="3">Password</Label>
                                            <Col sm="9">
                                                <FormGroup>
                                                    <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Button
                                            className="btn-simple btn-round "
                                            color="primary"
                                            type="submit"
                                            onClick={signup}
                                        >
                                            Đăng kí
                                        </Button>
                                    </TabPane>

                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>

                </div>
            </Modal>
        </>
    );

}
