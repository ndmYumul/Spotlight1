import React, { useState } from 'react'
import { Row, Col, Card, Button, ListGroup, Container, Modal } from 'react-bootstrap'
import { PayPalButtons } from "@paypal/react-paypal-js"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUserProfile } from '../actions/userActions'
import Message from '../components/Message'

function SubscriptionScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [message, setMessage] = useState(null)

    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin
    
    const plans = [
        {
            name: 'Basic Student',
            price: 'Free',
            features: ['Standard Parking Slots', '24h Advance Booking', 'Email Support'],
            buttonText: 'Current Plan',
            variant: 'outline-dark',
            disabled: !userInfo?.isPro 
        },
        {
            name: 'Spotlight Pro',
            price: '$9.99/mo',
            features: ['Premium Reserved Slots', '7-Day Advance Booking', 'Priority Access', 'No Ads'],
            buttonText: 'Upgrade to Pro',
            variant: 'warning',
            disabled: false
        }
    ]

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: "9.99",
                    },
                },
            ],
        });
    };

    const onApprove = (data, actions) => {
        return actions.order.capture().then((details) => {
            dispatch(updateUserProfile({
                'id': userInfo.id,
                'isPro': true
            }))

            setTimeout(() => {
                navigate('/subscription/success')
            }, 500)
        }).catch(err => {
            console.error("PayPal Capture Error: ", err)
            setMessage("Payment was successful, but we had trouble updating your profile. Please refresh.")
        });
    };

    const handleCancelSubscription = () => {
        dispatch(updateUserProfile({
            'id': userInfo.id,
            'isPro': false
        }))
        setShowCancelModal(false)
        setMessage('Your subscription has been cancelled successfully.')
        
        setTimeout(() => {
            setMessage(null)
            navigate('/') 
        }, 3000)
    }

    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold">Choose Your Plan</h1>
                <p className="text-muted">Upgrade to get the best parking spots on campus.</p>
                {message && <Message variant="info">{message}</Message>}
            </div>

            <Row className="justify-content-center">
                {plans.map((plan, index) => (
                    <Col key={index} md={5} lg={4} className="mb-4">
                        <Card className={`shadow border-0 h-100 ${plan.name === 'Spotlight Pro' ? 'border-top border-warning border-5' : ''}`}>
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="text-center fw-bold fs-4">{plan.name}</Card.Title>
                                <div className="text-center my-4">
                                    <span className="display-6 fw-bold">{plan.price}</span>
                                </div>
                                <ListGroup variant="flush" className="mb-4">
                                    {plan.features.map((feature, i) => (
                                        <ListGroup.Item key={i} className="border-0 px-0">
                                            <i className="fas fa-check text-success me-2"></i> {feature}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>

                                <div className="mt-auto d-grid gap-2">
                                    {plan.name === 'Spotlight Pro' ? (
                                        userInfo?.isPro ? (
                                            <>
                                                <Button variant="outline-success" className="fw-bold py-2 shadow-sm" disabled>
                                                    <i className="fas fa-check-circle me-2"></i>Active Plan
                                                </Button>
                                                <Button 
                                                    variant="link" 
                                                    className="text-danger text-decoration-none small fw-bold mt-2"
                                                    onClick={() => setShowCancelModal(true)}
                                                >
                                                    Cancel Subscription
                                                </Button>
                                            </>
                                        ) : (
                                            <PayPalButtons 
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                style={{ layout: "vertical", color: "gold", shape: "pill" }}
                                            />
                                        )
                                    ) : (
                                        <Button 
                                            variant={plan.variant} 
                                            className="fw-bold py-2 shadow-sm"
                                            disabled={plan.disabled}
                                        >
                                            {plan.name === 'Basic Student' && !userInfo?.isPro ? 'Current Plan' : 'Basic Plan'}
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold text-danger">Cancel Subscription</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-muted">
                    Are you sure you want to cancel your Spotlight Pro subscription? You will lose access to premium slots and advance booking immediately.
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowCancelModal(false)} className="fw-bold">
                        Keep Pro
                    </Button>
                    <Button variant="danger" onClick={handleCancelSubscription} className="fw-bold">
                        Yes, Cancel My Plan
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default SubscriptionScreen