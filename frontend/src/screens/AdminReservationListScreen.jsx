import React, { useEffect, useState } from 'react' 
import { Table, Button, Container, Row, Col, Card, Badge, Modal, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import LiveClock from '../components/LiveClock'
import { listReservations, deleteReservation, updateReservation } from '../actions/reservationActions'
import { RESERVATION_UPDATE_RESET } from '../constants/reservationConstants'

function AdminReservationListScreen() {
    const dispatch = useDispatch()

    const [show, setShow] = useState(false)
    const [selectedRes, setSelectedRes] = useState({})
    const [startHour, setStartHour] = useState(0)
    const [filter, setFilter] = useState('All')

    const reservationList = useSelector(state => state.reservationList)
    const { loading, error, reservations } = reservationList

    const reservationUpdate = useSelector(state => state.reservationUpdate)
    const { success: successUpdate } = reservationUpdate

    const reservationDelete = useSelector((state) => state.reservationDelete)
    const { success: successDelete } = reservationDelete

    useEffect(() => {
        if (successUpdate) {
            dispatch({ type: RESERVATION_UPDATE_RESET })
            setShow(false)
            dispatch(listReservations())
        } else if (successDelete) {
            dispatch(listReservations())
        } else {
            dispatch(listReservations())
        }
    }, [dispatch, successUpdate, successDelete])

    const handleEdit = (reservation) => {
        setSelectedRes(reservation)
        setStartHour(reservation.start_hour)
        setShow(true)
    }

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(updateReservation({
            _id: selectedRes._id,
            start_hour: startHour,
            end_hour: Number(startHour) + 1 
        }))
    }

    const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
        console.log("Deleting ID:", id) 
        dispatch(deleteReservation(id))
    }
}

    const format24h = (hour) => `${hour < 10 ? '0' + hour : hour}:00`

    const filteredReservations = reservations && reservations.filter(res => {
        const now = new Date()
        const resDate = new Date(res.date)
        const isPast = resDate.setHours(0,0,0,0) < now.setHours(0,0,0,0) || 
                      (resDate.setHours(0,0,0,0) === now.setHours(0,0,0,0) && res.end_hour <= now.getHours())

        if (filter === 'Active') return !isPast
        if (filter === 'Completed') return isPast
        return true
    })

    return (
        <Container>
            <Row className="align-items-center my-4">
                <Col md={5}>
                    <h1 className="fw-bold"><i className="fas fa-book-reader me-2 text-warning"></i>Reservations</h1>
                </Col>
                <Col md={3}>
                    <Form.Select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="shadow-sm border-0"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </Form.Select>
                </Col>
                <Col md={4} className="text-end">
                    <LiveClock />
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                        <Table hover responsive className='table-sm mb-0 align-middle'>
                            <thead className="bg-light">
                                <tr>
                                    <th className="p-3">USER</th>
                                    <th className="p-3">DATE</th>
                                    <th className="p-3">TIME SLOT</th>
                                    <th className="p-3 text-center">STATUS</th>
                                    <th className="p-3 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations && filteredReservations.map(reservation => {
                                    const now = new Date()
                                    const resDate = new Date(reservation.date)
                                    const isPast = resDate.setHours(0,0,0,0) < now.setHours(0,0,0,0) || 
                                                  (resDate.setHours(0,0,0,0) === now.setHours(0,0,0,0) && reservation.end_hour <= now.getHours())
                                    
                                    return (
                                        <tr key={reservation._id}>
                                            <td className="p-3 fw-bold">{reservation.name}</td>
                                            <td className="p-3">{reservation.date}</td>
                                            <td className="p-3">
                                                <Badge pill bg="dark">{format24h(reservation.start_hour)}</Badge> to <Badge pill bg="dark">{format24h(reservation.end_hour)}</Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge bg={isPast ? 'secondary' : 'success'}>
                                                    {isPast ? 'Completed' : 'Active'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button variant='light' className='btn-sm me-2' onClick={() => handleEdit(reservation)} disabled={isPast}>
                                                    <i className='fas fa-edit'></i>
                                                </Button>
                                                <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(reservation._id)}>
                                                    <i className='fas fa-trash'></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Reservation Time</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitHandler}>
                    <Modal.Body>
                        <Form.Group controlId='startHour'>
                            <Form.Label>New Arrival Hour (24h Format)</Form.Label>
                            <Form.Control 
                                type='number' 
                                min="0" 
                                max="23" 
                                value={startHour} 
                                onChange={(e) => setStartHour(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                        <Button variant="warning" type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    )
}

export default AdminReservationListScreen