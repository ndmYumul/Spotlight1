import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'

function SubscriptionSuccessScreen() {
    const navigate = useNavigate()
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight })

    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    const detectSize = () => {
        setWindowDimension({ width: window.innerWidth, height: window.innerHeight })
    }

    useEffect(() => {
        window.addEventListener('resize', detectSize)

        if (!userInfo || !userInfo.isPro) {
            navigate('/subscription')
        }

        return () => {
            window.removeEventListener('resize', detectSize)
        }
    }, [userInfo, navigate])

    return (
        <>
            <Confetti
                width={windowDimension.width}
                height={windowDimension.height}
                recycle={true}
                numberOfPieces={200}
                gravity={0.15}
                colors={['#ffc107', '#28a745', '#007bff', '#ffffff']} 
            />

            <Container className="py-5 text-center" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                <Row className="justify-content-md-center w-100">
                    <Col md={6}>
                        <Card className="shadow-lg border-0 rounded-4 p-5 bg-white position-relative" style={{ zIndex: 10 }}>
                            <div className="mb-4">
                                <i className="fas fa-check-circle text-success fa-5x animate__animated animate__bounceIn"></i>
                            </div>
                            <h1 className="fw-bold mb-3">Upgrade Successful!</h1>
                            <p className="text-muted mb-4 fs-5">
                                Welcome to <strong>Spotlight Pro</strong>, {userInfo?.name}. 
                                Your AI Engine is now fully synchronized with real-time campus data.
                            </p>
                            
                            <div className="d-grid gap-3">
                                <LinkContainer to="/schedule">
                                    <Button variant="warning" size="lg" className="fw-bold py-3 shadow-sm">
                                        <i className="fas fa-calendar-alt me-2"></i>Go to My Schedule
                                    </Button>
                                </LinkContainer>
                                
                                <LinkContainer to="/">
                                    <Button variant="light" className="text-muted fw-bold">
                                        Back to Dashboard
                                    </Button>
                                </LinkContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default SubscriptionSuccessScreen