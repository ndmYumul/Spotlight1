import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Container, Badge, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listUsers } from '../actions/userActions' 

function AdminSubscriptionListScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userList = useSelector((state) => state.userList)
    const { loading, error, users } = userList

    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            dispatch(listUsers())
        } else {
            navigate('/login')
        }
    }, [dispatch, navigate, userInfo])

    const proUsers = users ? users.filter(user => user.isPro) : []

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold"><i className="fas fa-crown text-warning me-2"></i>Pro Subscribers</h1>
                <Badge bg="dark" className="fs-6 px-3 py-2">
                    Total Pro Users: {proUsers.length}
                </Badge>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>PLAN</th>
                                <th>STATUS</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="ps-4 text-muted small">{user.id}</td>
                                    <td className="fw-bold">{user.name}</td>
                                    <td><a href={`mailto:${user.email}`} className="text-decoration-none text-dark">{user.email}</a></td>
                                    <td>
                                        <Badge bg="warning" text="dark">Premium</Badge>
                                    </td>
                                    <td>
                                        <Badge bg="success">Active</Badge>
                                    </td>
                                    <td className="text-center">
                                        <LinkContainer to={`/admin/user/${user.id}/edit`}>
                                            <Button variant="light" size="sm" className="border shadow-sm">
                                                <i className="fas fa-edit me-1"></i> Edit User
                                            </Button>
                                        </LinkContainer>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {proUsers.length === 0 && (
                        <div className="text-center p-5">
                            <i className="fas fa-users-slash fa-3x text-light mb-3"></i>
                            <p className="text-muted">No active Pro subscriptions found.</p>
                        </div>
                    )}
                </Card>
            )}
        </Container>
    )
}

export default AdminSubscriptionListScreen