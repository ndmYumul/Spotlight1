import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Button, Row, Col, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { register } from '../actions/userActions'

function RegisterScreen() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const redirect = location.search ? location.search.split('=')[1] : '/'

    const userRegister = useSelector(state => state.userRegister)
    const { error, loading, userInfo } = userRegister

    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    useEffect(() => {
        if (userInfo) {
            navigate(redirect)
        }
    }, [navigate, userInfo, redirect])

    const submitHandler = (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
        } else {
            dispatch(register(name, email, password))
        }
    }

    return (
        <Row className="justify-content-md-center mt-5">
            <Col xs={12} md={5}>
                <Card className="shadow border-0 p-4 rounded-4">
                    <h1 className="text-center fw-bold">Register</h1>
                    <p className="text-center text-muted mb-4">Join the SpotLight Community</p>
                    
                    {message && <Message variant='danger'>{message}</Message>}
                    {error && <Message variant='danger'>{error}</Message>}
                    {loading && <Loader />}
                    
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId='name'>
                            <Form.Label className="small fw-bold">Full Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='email' className="mt-3">
                            <Form.Label className="small fw-bold">Email Address</Form.Label>
                            <Form.Control
                                type='email'
                                placeholder='Enter Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='password' style={{ marginTop: '15px' }}>
                            <Form.Label className="small fw-bold">Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Enter Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={togglePasswordVisibility}
                                    style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                                >
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group controlId='confirmPassword' style={{ marginTop: '15px' }}>
                            <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Confirm Password'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={togglePasswordVisibility}
                                    style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                                >
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </Button>
                            </div>
                        </Form.Group>

                        <Button type='submit' variant='warning' className='mt-4 w-100 fw-bold shadow-sm py-2'>
                            Register
                        </Button>
                    </Form>

                    <Row className='py-3'>
                        <Col className="text-center small">
                            Have an account? <Link className="fw-bold text-warning" to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                                Sign In
                            </Link>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    )
}

export default RegisterScreen