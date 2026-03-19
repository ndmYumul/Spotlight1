import React, { useContext } from 'react'
import { Container, Row, Col, ListGroup, Card, Form } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector } from 'react-redux'
import { ThemeContext } from '../ThemeContext'

function SettingsScreen() {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext)
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    return (
        <Container className="py-4">
            <h1 className="mb-4 fw-bold">Settings</h1>
            
            <Row>
                <Col md={8} className="mx-auto">
                    <h5 className="text-muted mb-3 text-uppercase small fw-bold">Display</h5>
                    <Card className="shadow-sm border-0 mb-4 rounded-3 p-3">
                        <Form.Group className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0 fw-bold">Dark Mode</h6>
                                <small className="text-muted">Easier on the eyes during night sessions.</small>
                            </div>
                            <Form.Check 
                                type="switch"
                                id="dark-mode-toggle"
                                checked={isDarkMode}
                                onChange={toggleTheme}
                                style={{ transform: 'scale(1.5)' }}
                            />
                        </Form.Group>
                    </Card>

                    <h5 className="text-muted mb-3 text-uppercase small fw-bold">Account</h5>
                    <Card className="shadow-sm border-0 mb-4 rounded-3">
                        <ListGroup variant="flush">
                            <LinkContainer to="/profile">
                                <ListGroup.Item action className="d-flex justify-content-between align-items-center py-3">
                                    <span><i className="fas fa-user-circle me-3 text-warning"></i>Profile Information</span>
                                    <i className="fas fa-chevron-right text-muted small"></i>
                                </ListGroup.Item>
                            </LinkContainer>
                            <LinkContainer to="/subscription">
                                <ListGroup.Item action className="d-flex justify-content-between align-items-center py-3">
                                    <span><i className="fas fa-star me-3 text-warning"></i>Subscription Status</span>
                                    <i className="fas fa-chevron-right text-muted small"></i>
                                </ListGroup.Item>
                            </LinkContainer>
                        </ListGroup>
                    </Card>

                    <h5 className="text-danger mb-3 text-uppercase small fw-bold">Danger Zone</h5>
                    <Card className="shadow-sm border-0 rounded-3 border-start border-danger border-4">
                        <ListGroup variant="flush">
                            <ListGroup.Item action className="text-danger py-3">
                                <i className="fas fa-trash-alt me-3"></i> Deactivate My Account
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default SettingsScreen