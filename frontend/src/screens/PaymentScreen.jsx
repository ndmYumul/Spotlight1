import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap'
import { upgradeToPro } from '../actions/userActions'
import { USER_UPDATE_PRO_RESET } from '../constants/userConstants'
import Loader from '../components/Loader'
import Message from '../components/Message'

function PaymentScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const userUpdateToPro = useSelector(state => state.userUpdateToPro)
    const { loading, success, error } = userUpdateToPro

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        }
        
        if (success) {
            dispatch({ type: USER_UPDATE_PRO_RESET })
            navigate('/profile')
        }
    }, [dispatch, navigate, userInfo, success])

    const paypalOptions = {
        "client-id": "AVRhcatNF4Z8aAzZ9mdUVf3BZcz8H6JdYw2CjTdJonM0oX5GLvHyOGimD3QVu4JRzGPgrvvMrCQgKbVJ", 
        currency: "USD",
        intent: "capture",
    }

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: "9.99", 
                    },
                    description: "SpotLight Priority Parking Upgrade",
                },
            ],
        })
    }

    const onApprove = (data, actions) => {
        return actions.order.capture().then((details) => {
            if (details.status === 'COMPLETED') {
                dispatch(upgradeToPro())
            }
        })
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm border-0 rounded-4 p-4">
                        <Card.Body>
                            <h2 className="text-center fw-bold mb-3">Upgrade to Priority</h2>
                            <p className="text-center text-muted mb-4">
                                Get exclusive access to premium parking spots at HAU.
                            </p>

                            {loading && <Loader />}
                            {error && <Message variant='danger'>{error}</Message>}

                            <ListGroup variant="flush" className="mb-4">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <span>Standard Fee</span>
                                    <span className="text-muted text-decoration-line-through">$0.00</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center fw-bold">
                                    <span>Priority Access</span>
                                    <span className="text-warning">$9.99</span>
                                </ListGroup.Item>
                            </ListGroup>

                            <div className="paypal-button-container">
                                <PayPalScriptProvider options={paypalOptions}>
                                    <PayPalButtons 
                                        style={{ layout: "vertical", shape: "pill" }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                    />
                                </PayPalScriptProvider>
                            </div>

                            <p className="text-center small text-muted mt-3">
                                Secure payment processed via PayPal Sandbox.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default PaymentScreen