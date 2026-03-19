import React, { useEffect, useState, useMemo } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Container, Row, Col, Alert, Form, InputGroup, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { listUsers, deleteUser, createUser } from '../actions/userActions'
import { USER_CREATE_RESET } from '../constants/userConstants'
import Loader from '../components/Loader'
import Message from '../components/Message'

function AdminUserListScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState('')

    const userList = useSelector(state => state.userList)
    const { loading, error, users = [] } = userList || {}

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const userDelete = useSelector(state => state.userDelete)
    const { success: successDelete } = userDelete || {}

    const userCreate = useSelector(state => state.userCreate)
    const { 
        loading: loadingCreate, 
        error: errorCreate, 
        success: successCreate, 
        user: createdUser 
    } = userCreate || {}

    useEffect(() => {
        dispatch({ type: USER_CREATE_RESET })
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login')
        }
        if (successCreate) {
            navigate(`/admin/user/${createdUser._id}/edit`)
        } else {
            dispatch(listUsers())
        }
    }, [dispatch, navigate, userInfo, successDelete, successCreate, createdUser])

    const stats = useMemo(() => {
        if (!users.length) return { peak: null, total: 0 }
        
        const hourCounts = {}
        users.forEach(u => {
            const hr = u.arrival_hour || 7
            hourCounts[hr] = (hourCounts[hr] || 0) + 1
        })
        const peak = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b)
        return { peak, total: users.length }
    }, [users])

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const deleteHandler = (id) => {
        if (window.confirm('Confirm student removal? This action cannot be undone.')) {
            dispatch(deleteUser(id))
        }
    }

    const formatTime = (hour) => `${hour < 10 ? '0' + hour : hour}:00`

    return (
        <Container>
            <Row className="align-items-center mt-4 mb-3">
                <Col md={6}>
                    <h1 className="fw-bold text-dark">User Management</h1>
                    <p className="text-muted">Total Registered Users: {stats.total}</p>
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="warning" className="shadow-sm fw-bold px-4" onClick={() => dispatch(createUser())}>
                        <i className="fas fa-plus me-2"></i> Register New User
                    </Button>
                </Col>
            </Row>

            <Row className="mb-4 g-3">
                <Col md={8}>
                    <InputGroup className="shadow-sm">
                        <InputGroup.Text className="bg-white border-end-0">
                            <i className="fas fa-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name or email..."
                            className="border-start-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    {stats.peak && (
                        <Alert variant="dark" className="text-center py-2 mb-0 shadow-sm border-0 bg-dark text-white">
                            <i className="fas fa-chart-line text-warning me-2"></i>
                            <strong>Peak Arrival:</strong> {formatTime(stats.peak)}
                        </Alert>
                    )}
                </Col>
            </Row>

            {loadingCreate && <Loader />}
            {errorCreate && <Message variant='danger'>{errorCreate}</Message>}

            {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                <Card className="shadow-sm border-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="p-3">User Details</th>
                                <th className="p-3">Arrival</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td className="p-3">
                                        <div className="fw-bold">{user.name}</div>
                                        <div className="small text-muted">{user.email}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="badge rounded-pill bg-light text-dark border px-3">
                                            {formatTime(user.arrival_hour || 7)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {user.isPro ? (
                                            <span className="text-warning fw-bold"><i className="fas fa-crown me-1"></i>PRO</span>
                                        ) : "Standard"}
                                    </td>
                                    <td className="p-3">
                                        {user.isAdmin ? (
                                            <i className="fas fa-shield-alt text-success" title="Admin"></i>
                                        ) : (
                                            <i className="fas fa-user text-muted" title="User"></i>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <LinkContainer to={`/admin/user/${user._id}/edit`}>
                                            <Button variant="light" className="btn-sm border me-2 shadow-sm">
                                                <i className="fas fa-edit text-primary"></i>
                                            </Button>
                                        </LinkContainer>
                                        <Button variant="light" className="btn-sm border shadow-sm" onClick={() => deleteHandler(user._id)}>
                                            <i className="fas fa-trash text-danger"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}
        </Container>
    )
}

export default AdminUserListScreen