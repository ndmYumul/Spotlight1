import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Button, Row, Col, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { login } from '../actions/userActions'
import { InputGroup } from 'react-bootstrap'

function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false) // Toggle state

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const redirect = location.search ? location.search.split('=')[1] : '/'

    const userLogin = useSelector(state => state.userLogin)
    const { error, loading, userInfo } = userLogin

    useEffect(() => {
        if (userInfo && userInfo.token) {
            navigate(redirect)
        }
    }, [navigate, userInfo, redirect])

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(login(email, password))
    }

    return (
        <Row className="justify-content-md-center mt-5">
            <Col xs={12} md={5}>
                <Card className="shadow border-0 p-4 rounded-4">
                    <h1 className="text-center fw-bold">Sign In</h1>
                    <p className="text-center text-muted mb-4">Access your SpotLight account</p>
                    
                    {error && <Message variant='danger'>{error}</Message>}
                    {loading && <Loader />}
                    
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId='email'>
                            <Form.Label className="small fw-bold">Email Address</Form.Label>
                            <Form.Control
                                type='email' 
                                placeholder='Enter Email Address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='password' style={{ marginTop: '15px' }}>
                            <Form.Label className="small fw-bold">Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Button type='submit' variant='warning' className='mt-4 w-100 fw-bold shadow-sm py-2'>
                            Sign In
                        </Button>
                    </Form>

                    <Row className='py-3'>
                        <Col className="text-center small">
                            New Student? <Link className="fw-bold text-warning" to={redirect ? `/register?redirect=${redirect}` : '/register'}>
                                Create an Account
                            </Link>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    )
}

export default LoginScreen