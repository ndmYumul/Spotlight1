import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Image, Card, Table, Badge, Modal, Tabs, Tab, Container } from 'react-bootstrap' 
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom' 
import axios from 'axios'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { updateUserProfile } from '../actions/userActions'
import { listMyReservations, deleteReservation } from '../actions/reservationActions'
import { BUILDING_LIST_RESET } from '../constants/buildingConstants'

function ProfileScreen() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState(null)
    const [uploading, setUploading] = useState(false)
    
    const [preview, setPreview] = useState(null)
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const [showModal, setShowModal] = useState(false);
    const [reservationIdToDelete, setReservationIdToDelete] = useState(null);

    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const userUpdateProfile = useSelector(state => state.userUpdateProfile)
    const { success, loading, error } = userUpdateProfile || {}

    const reservationListMy = useSelector(state => state.reservationListMy)
    const { loading: loadingOrders, error: errorOrders, reservations = [] } = reservationListMy

    const reservationDelete = useSelector(state => state.reservationDelete)
    const { success: successDelete } = reservationDelete

    const [image, setImage] = useState('') 
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const getImageUrl = (url) => {
        if (!url) return '/assets/default_user.png'
        if (url.startsWith('blob:') || url.startsWith('http')) return url
        return `${process.env.REACT_APP_API_URL}${url}`
    }

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name || '')
            setEmail(userInfo.email || '')
            setPreview(userInfo.image ? getImageUrl(userInfo.image) : '/assets/default_user.png')
        }

        if (successDelete) {
            setShowSuccessMessage(true)
            const timer = setTimeout(() => setShowSuccessMessage(false), 3000)
            dispatch(listMyReservations())
            dispatch({ type: BUILDING_LIST_RESET })
            return () => clearTimeout(timer)
        } else {
            dispatch(listMyReservations())
        }
    }, [userInfo, success, dispatch, successDelete])

    // RESTORED: Your original full upload logic
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        setMessage('')

        if (file.size > 2000000) {
            setMessage('File is too large (Max 2MB).')
            return
        }

        const formData = new FormData()
        formData.append('image', file)
        formData.append('user_id', userInfo.id)

        setUploading(true) 
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',  
                    Authorization: `Bearer ${userInfo.token}`
                }
            }
            const { data } = await axios.post('/api/users/upload/', formData, config)
            
            setImage(data) 

            const updatedUserInfo = { ...userInfo, image: data }
            dispatch({
                type: 'USER_LOGIN_SUCCESS',
                payload: updatedUserInfo
            })

            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
            
            setMessage('Image uploaded successfully!')
        } catch (error) {
            console.error('Image upload error:', error)
            setMessage("Image upload failed. Check your Django settings!")
            setPreview(userInfo.image ? getImageUrl(userInfo.image) : '/assets/default_user.png')
        } finally {
            setUploading(false) 
        }
    }

    const submitHandler = (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
        } else {
            dispatch(updateUserProfile({
                'id': userInfo.id,
                'name': name,
                'email': email,
                'password': password,
                'image': image,
                'isPro': userInfo.isPro
            }))
            setMessage('')
            setPassword('')
            setConfirmPassword('')
        }
    }

    const handleShowModal = (id) => {
        setReservationIdToDelete(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setReservationIdToDelete(null);
    };

    const confirmDeleteHandler = () => {
        if (reservationIdToDelete) {
            dispatch(deleteReservation(reservationIdToDelete));
            handleCloseModal();
        }
    };

    // Helper logic for history sync
    const activeReservations = reservations.filter(res => !res.is_completed);
    const pastReservations = reservations.filter(res => res.is_completed);

    return (
        <Container className="py-4">
            <Row className="mt-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 p-4 rounded-4 bg-white text-center">
                        <h2 className="fw-bold mb-4">User Profile</h2>
                        <div className="position-relative d-inline-block mx-auto mb-4">
                            <Image 
                                src={preview || '/assets/default_user.png'}
                                roundedCircle 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                className="border border-4 border-warning shadow"
                                onError={(e) => { e.target.src = '/assets/default_user.png' }}
                            />
                            {userInfo?.isPro && (
                                <div 
                                    className="position-absolute bottom-0 end-0 bg-dark text-warning rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: '40px', height: '40px', border: '3px solid white' }}
                                    title="Pro Member"
                                >
                                    <i className="fas fa-crown"></i>
                                </div>
                            )}
                            {uploading && <div className="position-absolute top-50 start-50 translate-middle"><Loader /></div>}
                        </div>

                        <div className="mb-3">
                            <Badge bg={userInfo?.isPro ? 'dark' : 'light'} className={userInfo?.isPro ? 'text-warning px-3 py-2' : 'text-secondary border px-3 py-2'}>
                                <i className={`fas ${userInfo?.isPro ? 'fa-gem me-1' : 'fa-user me-1'}`}></i>
                                {userInfo?.isPro ? 'PRO ACCOUNT' : 'BASIC ACCOUNT'}
                            </Badge>
                        </div>

                        <div className="mb-4 small text-muted">
                            <p className="mb-1">Member since: {userInfo?.createdAt?.substring(0, 10) || '2026-01-01'}</p>
                            <p>Last active: Just now</p>
                        </div>

                        {message && <Message variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Message>}
                        {error && <Message variant='danger'>{error}</Message>}
                        {success && <Message variant='success'>Profile updated successfully!</Message>}
                        
                        <Form onSubmit={submitHandler} className="text-start">
                            <Form.Group controlId='name' className="mb-3">
                                <Form.Label className="small fw-bold">Full Name</Form.Label>
                                <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId='email' className="mb-3">
                                <Form.Label className="small fw-bold">Email</Form.Label>
                                <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId='image' className="mb-3">
                                <Form.Label className="small fw-bold">Update Photo</Form.Label>
                                <Form.Control type='file' onChange={uploadFileHandler} />
                            </Form.Group>

                            <hr />

                            <Form.Group controlId='password' style={{ marginTop: '15px' }}>
                                <Form.Label className="small fw-bold">Enter Password</Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter Password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                            <Button type='submit' variant='warning' className='mt-4 w-100 fw-bold shadow-sm' disabled={loading}>
                                {loading ? 'Saving...' : 'Update Information'}
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col md={8}>
                    <Tabs defaultActiveKey="active" id="reservation-tabs" className="mb-4 custom-tabs">
                        <Tab eventKey="active" title={`Active (${activeReservations.length})`}>
                            {showSuccessMessage && (
                                <Message variant='success'>
                                    Reservation cancelled successfully.
                                </Message>
                            )}
                            
                            {loadingOrders ? <Loader /> : errorOrders ? <Message variant='danger'>{errorOrders}</Message> : (
                                activeReservations.length === 0 ? (
                                    <Message variant='info'>
                                        You have no active reservations. <Link to='/'>Find a building</Link>
                                    </Message>
                                ) : (
                                    <Table striped hover responsive className='table-sm shadow-sm align-middle'>
                                        <thead>
                                            <tr>
                                                <th>DATE</th>
                                                <th>TIME</th>
                                                <th>BUILDING</th>
                                                <th className="text-center">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeReservations.map(res => (
                                                <tr key={res._id}>
                                                    <td>{res.date.substring(0, 10)}</td>
                                                    <td>
                                                        <Badge bg="dark" pill>{res.start_hour}:00</Badge> - <Badge bg="dark" pill>{res.end_hour}:00</Badge>
                                                    </td>
                                                    <td className="fw-bold">{res.buildingName}</td> 
                                                    <td className="text-center">
                                                        <Button 
                                                            variant='danger'
                                                            className='btn-sm mx-1' 
                                                            onClick={() => handleShowModal(res._id)}
                                                        >
                                                            <i className='fas fa-trash me-1'></i> Cancel
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )
                            )}
                        </Tab>

                        <Tab eventKey="history" title="History">
                            {loadingOrders ? <Loader /> : errorOrders ? <Message variant='danger'>{errorOrders}</Message> : (
                                pastReservations.length === 0 ? (
                                    <Message variant='info'>No past reservation history found.</Message>
                                ) : (
                                    <Table striped hover responsive className='table-sm shadow-sm align-middle'>
                                        <thead>
                                            <tr>
                                                <th>DATE</th>
                                                <th>TIME</th>
                                                <th>BUILDING</th>
                                                <th className="text-center">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pastReservations.map(res => (
                                                <tr key={res._id}>
                                                    <td>{res.date.substring(0, 10)}</td>
                                                    <td>{res.start_hour}:00 - {res.end_hour}:00</td>
                                                    <td className="fw-bold">{res.buildingName}</td> 
                                                    <td className="text-center">
                                                        <Badge bg="secondary">Completed</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )
                            )}
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        <i className='fas fa-exclamation-triangle text-danger me-2'></i>
                        Confirm Cancellation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ lineHeight: '1.6' }}>
                        Are you sure you want to cancel this reservation? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" className="px-4" onClick={handleCloseModal}>
                        No, Keep Reservation
                    </Button>
                    <Button variant="danger" className="px-4 fw-bold" onClick={confirmDeleteHandler}>
                        Yes, Cancel Spot
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default ProfileScreen;