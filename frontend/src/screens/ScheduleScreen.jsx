<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Message from '../components/Message'
import { updateUserSchedule, getUserDetails } from '../actions/userActions'

function ScheduleScreen() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [buildings, setBuildings] = useState([])
    const [syncLoading, setSyncLoading] = useState(false)
    const [clearLoading, setClearLoading] = useState(false)
    const [syncMessage, setSyncMessage] = useState(null)

    const [days, setDays] = useState([
        { id: 1, day: 'Monday', arrival: '08:00', departure: '17:00', active: true, building: '' },
        { id: 2, day: 'Tuesday', arrival: '08:00', departure: '17:00', active: true, building: '' },
        { id: 3, day: 'Wednesday', arrival: '08:00', departure: '17:00', active: true, building: '' },
        { id: 4, day: 'Thursday', arrival: '08:00', departure: '17:00', active: true, building: '' },
        { id: 5, day: 'Friday', arrival: '08:00', departure: '17:00', active: true, building: '' },
        { id: 6, day: 'Saturday', arrival: '08:00', departure: '12:00', active: false, building: '' },
        { id: 7, day: 'Sunday', arrival: '08:00', departure: '12:00', active: false, building: '' },
    ])

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const userScheduleUpdate = useSelector(state => state.userScheduleUpdate)
    const { loading, error, success } = userScheduleUpdate

    const refreshScreenData = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/buildings/')
            setBuildings(data)
            dispatch(getUserDetails('profile'))
        } catch (err) {
            console.error("Data refresh failed:", err)
        }
    }, [dispatch])

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        } else {
            refreshScreenData()
            if (userInfo?.schedule?.weekly_schedule) {
                setDays(userInfo.schedule.weekly_schedule)
            }
        }
    }, [userInfo, navigate, refreshScreenData])

    const handleToggle = (id) => {
        if (!userInfo?.isPro && !userInfo?.isAdmin) return
        setDays(days.map(d => d.id === id ? { ...d, active: !d.active } : d))
    }

    const handleFieldChange = (id, field, value) => {
        if (!userInfo?.isPro && !userInfo?.isAdmin) return
        setDays(days.map(d => d.id === id ? { ...d, [field]: value } : d))
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        await dispatch(updateUserSchedule({ weekly_schedule: days }))
        refreshScreenData()
    }

    // UPDATED: Fixed URL path to /api/users/schedule/weekly-sync/
    const handleReserveAll = async () => {
        setSyncLoading(true)
        setSyncMessage(null)
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.post('/api/users/schedule/weekly-sync/', {}, config)
            setSyncMessage({ variant: 'success', text: data.message })
            refreshScreenData()
        } catch (err) {
            setSyncMessage({ 
                variant: 'danger', 
                text: err.response?.data?.error || 'Reservation Sync Failed' 
            })
        }
        setSyncLoading(false)
    }

    // UPDATED: Fixed URL path to /api/users/schedule/clear-weekly/
    const handleClearAll = async () => {
        if (!window.confirm("This will delete all your upcoming reservations. Continue?")) return
        setClearLoading(true)
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.post('/api/users/schedule/clear-weekly/', {}, config)
            setSyncMessage({ variant: 'info', text: data.message })
            refreshScreenData()
        } catch (err) {
            setSyncMessage({ variant: 'danger', text: 'Failed to clear reservations' })
        }
        setClearLoading(false)
    }

    const applyToAllActive = (buildingName) => {
        if (!buildingName) return;
        setDays(days.map(d => d.active ? { ...d, building: buildingName } : d));
    }

    return (
        <Container className="py-4">
            <Row>
                <Col md={12}>
                    <div className="d-flex align-items-center mb-4 p-3 rounded-4 shadow-sm bg-white border-start border-5 border-warning">
                        <div className="me-3">
                            <i className={`fas ${userInfo?.isPro || userInfo?.isAdmin ? 'fa-crown text-warning' : 'fa-user text-secondary'} fa-2x`}></i>
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="mb-0 fw-bold">{userInfo?.isPro || userInfo?.isAdmin ? 'Spotlight Pro Member' : 'Basic Student Plan'}</h5>
                            <small className="text-muted">
                                {userInfo?.isPro || userInfo?.isAdmin ? 'AI Automation Active.' : 'Upgrade to unlock automated scheduling.'}
                            </small>
                        </div>
                    </div>

                    {success && <Message variant="success">AI Engine Updated Successfully!</Message>}
                    {syncMessage && <Alert variant={syncMessage.variant} onClose={() => setSyncMessage(null)} dismissible>{syncMessage.text}</Alert>}
                    {error && <Message variant="danger">{error}</Message>}

                    <Card className="shadow-sm border-0 rounded-4 p-4 mb-4 position-relative">
                        {!userInfo?.isPro && !userInfo?.isAdmin && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-4" 
                                 style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 10, backdropFilter: 'blur(5px)' }}>
                                <i className="fas fa-lock fa-3x text-warning mb-3"></i>
                                <h3 className="fw-bold">Pro Feature</h3>
                                <Button variant="warning" className="fw-bold px-4 shadow" onClick={() => navigate('/subscription')}>Upgrade to Unlock</Button>
                            </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold mb-0">Weekly AI Schedule</h2>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="outline-danger" 
                                    className="fw-bold shadow-sm" 
                                    onClick={handleClearAll}
                                    disabled={clearLoading || syncLoading}
                                >
                                    {clearLoading ? <Spinner size="sm" /> : 'Clear All'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="fw-bold shadow-sm text-white" 
                                    onClick={handleReserveAll}
                                    disabled={syncLoading || clearLoading || (!userInfo?.isPro && !userInfo?.isAdmin)}
                                >
                                    {syncLoading ? <Spinner size="sm" /> : 'Reserve All'}
                                </Button>
                                <Button 
                                    variant="warning" 
                                    className="fw-bold shadow-sm" 
                                    onClick={submitHandler} 
                                    disabled={loading || (!userInfo?.isPro && !userInfo?.isAdmin)}
                                >
                                    {loading ? <Spinner size="sm" /> : 'Update AI Engine'}
                                </Button>
                            </div>
                        </div>

                        {(userInfo?.isPro || userInfo?.isAdmin) && (
                            <div className="mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between border">
                                <div className="small fw-bold text-muted text-uppercase">Quick Fill:</div>
                                <Form.Select size="sm" className="w-auto border-warning" onChange={(e) => applyToAllActive(e.target.value)}>
                                    <option value="">Apply Building to all active days...</option>
                                    {buildings.map(b => (
                                        <option key={b._id} value={b.name}>{b.name} ({b.slots} left)</option>
                                    ))}
                                </Form.Select>
                            </div>
                        )}

                        <Table responsive hover className="align-middle">
                            <thead>
                                <tr>
                                    <th>Active</th>
                                    <th>Day</th>
                                    <th>Building</th>
                                    <th>Arrival</th>
                                    <th>Departure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((d) => (
                                    <tr key={d.id} className={!d.active ? 'opacity-50' : ''}>
                                        <td><Form.Check type="switch" checked={d.active} onChange={() => handleToggle(d.id)} /></td>
                                        <td className="fw-bold">{d.day}</td>
                                        <td>
                                            <Form.Select 
                                                value={d.building} 
                                                disabled={!d.active} 
                                                onChange={(e) => handleFieldChange(d.id, 'building', e.target.value)}
                                            >
                                                <option value="">Select Building...</option>
                                                {buildings.map(b => (
                                                    <option key={b._id} value={b.name}>{b.name} ({b.slots} left)</option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                        <td><Form.Control type="time" value={d.arrival} disabled={!d.active} onChange={(e) => handleFieldChange(d.id, 'arrival', e.target.value)} /></td>
                                        <td><Form.Control type="time" value={d.departure} disabled={!d.active} onChange={(e) => handleFieldChange(d.id, 'departure', e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-4 p-4 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold mb-0">Full AI Schedule Overview</h4>
                            {userInfo?.schedule?.updated_at && (
                                <Badge bg="info" className="text-dark">
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Last Synced: {new Date(userInfo.schedule.updated_at).toLocaleString('en-PH')}
                                </Badge>
                            )}
                        </div>
                        <Row>
                            {days.map(d => (
                                <Col key={d.id} sm={6} lg={4} className="mb-3">
                                    <div className={`p-3 rounded-3 border ${d.active ? 'bg-white border-warning' : 'bg-transparent border-secondary opacity-50'}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-uppercase small">{d.day}</span>
                                            <Badge bg={d.active ? 'success' : 'secondary'}>{d.active ? 'Active' : 'Off'}</Badge>
                                        </div>
                                        {d.active ? (
                                            <>
                                                <p className="mb-0 small fw-bold text-primary">{d.building || 'Not Set'}</p>
                                                <p className="mb-0 small font-monospace">{d.arrival} — {d.departure}</p>
                                            </>
                                        ) : <p className="mb-0 small text-muted italic">No Parking Sync</p>}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ScheduleScreen;
=======
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { listSchedules } from '../actions/scheduleActions';
import '../styles/schedule.css';

function ScheduleScreen() {
  const dispatch = useDispatch();
  
  const scheduleList = useSelector(state => state.scheduleList);
  const { loading, error, schedules } = scheduleList;

  const [selectedDays, setSelectedDays] = useState({
    Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    recurring: true,
    notifications: true,
    public: true
  });

  useEffect(() => {
    dispatch(listSchedules());
  }, [dispatch]);

  const toggleDay = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleOptionChange = (e) => {
    setOptions(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSaveSchedule = (e) => {
    e.preventDefault();

    console.log({
      location,
      selectedDays,
      startTime,
      endTime,
      options,
      file
    });
  };

  return (
    <div className="schedule-container py-4">
      <div className="mb-5">
        <h1 className="display-4 fw-bold">SpotLight</h1>
        <p className="text-muted">Academic Schedule Builder</p>
      </div>

      {/* Main two-column layout */}
      <Row className="mb-4">
        {/* kaliwa column: Create New Schedule */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="fs-5 fw-semibold mb-2">Create New Schedule</Card.Title>
              <Card.Text className="text-muted mb-3">Build and upload academic schedules for campus buildings and venues</Card.Text>
              <ul className="list-unstyled space-y-2">
                <li className="d-flex align-items-center">
                  <span className="badge bg-success rounded-circle me-2">✓</span>
                  Easy to use
                </li>
                <li className="d-flex align-items-center">
                  <span className="badge bg-success rounded-circle me-2">✓</span>
                  Auto-validation
                </li>
                <li className="d-flex align-items-center">
                  <span className="badge bg-success rounded-circle me-2">✓</span>
                  Instant upload
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* kanan column: Schedule Details */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-5 fw-semibold mb-4">Schedule Details</Card.Title>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Building Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Science Hall, Room 101"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium mb-2">Day of the Week</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <Button
                      key={day}
                      variant={selectedDays[day] ? 'primary' : 'light'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                      className="rounded-pill"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Row>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">End Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* iba pa Options */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="fs-5 fw-semibold mb-3">Additional Options</Card.Title>
          <Form>
            <Form.Check
              type="checkbox"
              name="recurring"
              label="Recurring weekly schedule"
              checked={options.recurring}
              onChange={handleOptionChange}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              name="notifications"
              label="Send notifications to students"
              checked={options.notifications}
              onChange={handleOptionChange}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              name="public"
              label="Make schedule public"
              checked={options.public}
              onChange={handleOptionChange}
            />
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="fs-5 fw-semibold mb-3">Upload Schedule File</Card.Title>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border border-2 border-dashed rounded p-5 text-center schedule-drop-zone"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <p className="text-muted mb-1">Drop files here or click to browse</p>
            <p className="small text-muted">PDF, CSV, or Excel (Max 10MB)</p>
            <Form.Control
              id="fileInput"
              type="file"
              accept=".pdf,.csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="d-none"
            />
          </div>
          {file && (
            <p className="mt-2 small text-muted">Selected: {file.name}</p>
          )}
          <div className="mt-3">
            <a href="#" className="small">schedule-template.pdf</a>
          </div>
        </Card.Body>
      </Card>


      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="fs-5 fw-semibold mb-3">Quick Actions</Card.Title>
          <div className="d-flex flex-wrap gap-3">
            <Button variant="light" className="border">Download Template</Button>
            <Button variant="light" className="border">View Recent Schedules</Button>
            <Button variant="light" className="border">Get Help</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button variant="light" className="border">Cancel</Button>
        <Button variant="primary" onClick={handleSaveSchedule}>Save Schedule</Button>
      </div>
    </div>
  );
}

export default ScheduleScreen;
>>>>>>> ae012e1e78b8ce661f68b26cecb523ad42969e57
