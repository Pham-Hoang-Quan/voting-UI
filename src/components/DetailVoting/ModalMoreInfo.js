import React, { useContext, useState, useEffect } from "react";
import classnames from "classnames";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Label,
    FormGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
    CardFooter,
    Modal,
    InputGroup,

} from "reactstrap";

import { AppContext } from "context/AppContext";

import { database, storage } from "firebase.js";
import apiUrl from "api-url";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
let ps = null;

const ModalMoreInfo = ({ selectedCan }) => {

    return (
        <Row>
            <Col className="ml-auto" md="12">
                <h3 className="title">{selectedCan.name}</h3>
                <h3 className="title">
                    <QRCode style={{ marginRight: 'auto', marginLeft: 'auto' }}
                        value={`https://voting-ui-eight.vercel.app/voteByQRCode?candidateId=${selectedCan._id}`}
                        size={190}
                        level={"L"}
                        includeMargin={true}
                        imageSettings={
                            {
                                src: selectedCan.imgUrl,
                                x: null,
                                y: null,
                                // height: 20,
                                // width: 20,
                                excavate: true,
                            }
                        }
                    />
                </h3>

            </Col>
            <Col md="12">
                {/* <Button
                    className="btn-round float-right"
                    color="primary"
                    data-placement="right"
                    // id="tooltip341148792"
                    type="button"
                >
                    Vote
                </Button> */}
            </Col>
            {/* cột image */}


        </Row>
    );
};

export default ModalMoreInfo;