import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getUserDetails, updateUser } from '../actions/userActions'
import { USER_UPDATE_RESET } from '../constants/userConstants'
import { InputGroup } from 'react-bootstrap'

function UserEditScreen() {
    const { id: userId } = useParams()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [arrivalHour, setArrivalHour] = useState(0)
    const [password, setPassword] = useState('') 
    const [isPro, setIsPro] = useState(false)     
    const [showPassword, setShowPassword] = useState(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userDetails = useSelector((state) => state.userDetails)
    const { loading, error, user } = userDetails || {}

    const userUpdate = useSelector((state) => state.userUpdate)
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = userUpdate

    useEffect(() => {
    if (successUpdate) {
        dispatch({ type: USER_UPDATE_RESET })
        navigate('/admin/userlist')
    } else {
        if (!user || !user.name || String(user.id) !== String(userId)) {
            dispatch(getUserDetails(userId))
        } else {
            setName(user.name)
            setEmail(user.email)
            setIsAdmin(user.isAdmin)
            setIsPro(user.isPro)
            setArrivalHour(user.arrival_hour)
        }
    }
}, [dispatch, userId, user, successUpdate, navigate])

const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ 
        _id: userId,
        name, 
        email, 
        password, 
        isAdmin, 
        isPro, 
        arrival_hour: arrivalHour 
    }))
}

    return (
        <div>
            <Link to='/admin/userlist' className='btn btn-light my-3 shadow-sm'>
                <i className='fas fa-arrow-left me-2'></i>Go Back
            </Link>

            <Form onSubmit={submitHandler} className="shadow p-4 rounded bg-white">
                <h1 className="mb-4 text-center">Edit User Profile</h1>
                
                {loadingUpdate && <Loader />}
                {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
                
                {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                    <>
                        <Form.Group controlId='name' className="mb-3">
                            <Form.Label className="fw-bold">Full Name</Form.Label>
                            <Form.Control type='name' placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId='email' className="mb-3">
                            <Form.Label className="fw-bold">Email Address</Form.Label>
                            <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>
                        
                        <Form.Group controlId='password' style={{ borderLeft: '4px solid #ffc107', paddingLeft: '15px' }} className="mb-3 bg-light p-3 rounded">
                            <Form.Label className="fw-bold">Change Password</Form.Label>
                            <InputGroup>
                                <Form.Control 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder='Leave blank to keep current' 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="border"
                                >
                                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                </Button>
                            </InputGroup>
                            <Form.Text className="text-muted small">Security Tip: Use at least 8 characters.</Form.Text>
                        </Form.Group>

                        <Form.Group controlId='arrivalHour' className="mb-3">
                            <Form.Label className="fw-bold">Arrival Hour (24h Format: 0-23)</Form.Label>
                            <Form.Control type='number' min="0" max="23" value={arrivalHour} onChange={(e) => setArrivalHour(e.target.value)} />
                        </Form.Group>

                        <div className="d-flex justify-content-around bg-light p-3 rounded mb-4">
                            <Form.Check type='checkbox' label='Grant Admin Access' checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                            <Form.Check type='checkbox' label='SpotLight PRO Status' checked={isPro} onChange={(e) => setIsPro(e.target.checked)} />
                        </div>

                        <div className="d-grid">
                            <Button type='submit' variant='warning' className="fw-bold py-2 shadow-sm">
                                <i className='fas fa-save me-2'></i> Update Profile
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    )
}

export default UserEditScreen