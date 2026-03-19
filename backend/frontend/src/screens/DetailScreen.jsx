import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Container, Form, Toast, ToastContainer, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getBuildingDetails } from '../actions/buildingActions';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { createReservation } from '../actions/reservationActions';
import { RESERVATION_CREATE_RESET } from '../constants/reservationConstants';
import axios from 'axios'; 

function DetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const buildingDetails = useSelector(state => state.buildingDetails);
    const { loading, error, building } = buildingDetails;

    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    const reservationCreate = useSelector(state => state.reservationCreate);
    const { success: successCreate, error: errorCreate } = reservationCreate;

    const isPro = userInfo?.isPro || userInfo?.isAdmin;

    // Helper for Manila Today - used for initial state and 'min' attribute
    const getManilaToday = () => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    };

    // Initialize state once. Do not reset this in a useEffect or it will snap back to the 19th.
    const [date, setDate] = useState(getManilaToday());
    const [arrivalHour, setArrivalHour] = useState(7);
    const [duration, setDuration] = useState(1); 
    const [showToast, setShowToast] = useState(false);
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        }

        if (successCreate) {
            dispatch({ type: RESERVATION_CREATE_RESET });
            setShowToast(true);
            dispatch(getBuildingDetails(id)); 
        } else {
            dispatch(getBuildingDetails(id));
        }
        // Removed setDate(getManilaToday()) from here to prevent state overwrite.
    }, [dispatch, id, successCreate, userInfo, navigate]);

    const fetchAIAdvice = async () => {
        setAiLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/buildings/${id}/ai-insight/`, config);
            setAiInsight(data.insight);
        } catch (err) {
            setAiInsight("Parking is looking busy! Grab a spot while you can. 🚗");
        }
        setAiLoading(false);
    };

    const reserveHandler = () => {
        const start = Number(arrivalHour);
        const dur = Number(duration);
        
        let finalEndHour = start + dur;
        if (finalEndHour > 24) finalEndHour = 24;

        // Sending the 'date' state directly ensures your choice (e.g., the 20th) is sent to the API.
        dispatch(createReservation({
            building_id: building._id,
            buildingName: building.name,
            date: date, 
            start_hour: start,
            end_hour: finalEndHour
        }));
    };

    if (loading) return <Container className="mt-5"><Loader /></Container>;
    if (error) return <Container className="mt-5"><Message variant="danger">{error}</Message></Container>;

    const currentAvailable = Number(building.totalSlots || 0);
    const capacity = Number(building.maxSlots || 0);

    return (
        <Container>
            <Link className='btn btn-light my-3 shadow-sm border px-4' to='/'>
                <i className='fas fa-arrow-left me-2'></i> Back to Buildings
            </Link>

            {errorCreate && <Message variant='danger'>{errorCreate}</Message>}

            <Row className="g-4">
                <Col md={7}>
                    <Card className="border-0 shadow mb-4">
                        <Image src={building.image} alt={building.name} fluid rounded className="main-building-img" />
                    </Card>

                    <Card className="border-0 shadow-sm bg-light p-3">
                        <div className="d-flex align-items-center mb-2">
                            <Badge bg={isPro ? "warning" : "info"} className="me-2 text-dark">
                                {isPro ? 'Pro Insight' : 'Spotlight AI'}
                            </Badge>
                            <small className="text-muted fw-bold text-uppercase">Smart Status</small>
                        </div>
                        {aiInsight ? (
                            <p className="mb-0 fst-italic text-dark">"{aiInsight}"</p>
                        ) : (
                            <Button 
                                variant="outline-info" 
                                size="sm" 
                                onClick={fetchAIAdvice}
                                disabled={aiLoading}
                            >
                                {aiLoading ? 'Analyzing Patterns...' : 'Get AI Parking Tip ✨'}
                            </Button>
                        )}
                    </Card>
                </Col>
                
                <Col md={5}>
                    <Card className="shadow-sm border-0 h-100">
                        <ListGroup variant='flush' className="p-2">
                            <ListGroup.Item className="border-0">
                                <h2 className="fw-bold text-dark mt-2">{building.name}</h2>
                                <hr />
                            </ListGroup.Item>
                            
                            <ListGroup.Item className="border-0">
                                <h5 className="text-secondary fw-bold mb-3">Occupancy Status</h5>
                                <StatusBadge slots={currentAvailable} totalSlots={capacity} />
                            </ListGroup.Item>

                            <ListGroup.Item className="border-0 text-muted">
                                <p style={{ lineHeight: '1.6' }}>{building.description}</p>
                            </ListGroup.Item>

                            <ListGroup.Item className="border-0">
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between">
                                        <Form.Label className="fw-bold">Select Date</Form.Label>
                                        {!isPro && <Badge bg="secondary" className="mb-2">Pro Feature: Advanced Booking</Badge>}
                                    </div>
                                    <Form.Control 
                                        type="date" 
                                        value={date} 
                                        readOnly={!isPro}
                                        style={!isPro ? { backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' } : {}}
                                        onChange={(e) => setDate(e.target.value)} 
                                        min={getManilaToday()}
                                    />
                                    {!isPro && <small className="text-muted mt-1 d-block">Basic users can only reserve for today.</small>}
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Arrival Time</Form.Label>
                                            <Form.Select 
                                                value={arrivalHour} 
                                                onChange={(e) => setArrivalHour(e.target.value)}
                                            >
                                                {[...Array(24).keys()].map((x) => (
                                                    <option key={x} value={x}>
                                                        {x < 10 ? `0${x}:00` : `${x}:00`}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Duration</Form.Label>
                                            <Form.Select 
                                                value={duration} 
                                                onChange={(e) => setDuration(e.target.value)}
                                            >
                                                {[...Array(24).keys()].map((x) => (
                                                    <option key={x} value={x + 1}>
                                                        {x + 1} {x + 1 === 1 ? 'Hour' : 'Hours'}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item className="border-0 mt-auto pt-4">
                                <div className="d-grid">
                                    <Button 
                                        onClick={reserveHandler} 
                                        size="lg"
                                        className='fw-bold shadow-sm' 
                                        disabled={currentAvailable === 0 || !userInfo} 
                                        variant={currentAvailable === 0 ? "secondary" : "warning"}
                                    >
                                        {currentAvailable === 0 ? (
                                            <span><i className="fas fa-ban me-2"></i>No Slots Left</span>
                                        ) : (
                                            <span><i className="fas fa-calendar-check me-2"></i>Reserve My Spot</span>
                                        )}
                                    </Button>
                                </div>
                                <div className="text-center mt-3 small text-muted">
                                    * Booking for <strong>{date}</strong>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>

            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1050 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide bg="success">
                    <Toast.Header>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white fst-italic">
                        Reserved at {building.name}! Check your profile for details.
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}

export default DetailScreen;