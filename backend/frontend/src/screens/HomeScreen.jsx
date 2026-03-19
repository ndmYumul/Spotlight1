import React, { useEffect } from 'react'
import { Row, Col, Container, Badge, Card, ProgressBar } from 'react-bootstrap' 
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { listBuildings } from '../actions/buildingActions'
import { listMyReservations } from '../actions/reservationActions' 
import Building from '../components/Building'
import Loader from '../components/Loader'
import Message from '../components/Message'
import TodayScheduleCard from '../components/TodayScheduleCard'

function HomeScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const buildingList = useSelector((state) => state.buildingList);
  const { loading, error, buildings } = buildingList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const reservationListMy = useSelector((state) => state.reservationListMy) || { reservations: [] };
  const { reservations } = reservationListMy;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      dispatch(listBuildings());
      dispatch(listMyReservations()); 
    }
  }, [dispatch, userInfo, navigate]);

  const getLiveStatus = (res) => {
    const currentHour = new Date().getHours();
    const start = parseInt(res.start_hour);
    const end = parseInt(res.end_hour);
    
    if (currentHour >= start && currentHour < end) {
       if (end - 1 === currentHour) {
          return { label: "Ending Soon", color: "warning", pulse: true };
       }
       return { label: "Active Now", color: "success", pulse: false };
    }
    return { label: "Upcoming Today", color: "info", pulse: false };
  };

  // IMPROVED DATE MATCHING
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); // Formats as YYYY-MM-DD reliably

  // Filter logic: Check if res.date contains today's date string
  const liveReservations = reservations?.filter(r => {
    // Debugging: uncomment the line below to see dates in the console
    // console.log(`Comparing Reservation Date: ${r.date} with Today: ${todayStr}`);
    return r.date && r.date.includes(todayStr) && !r.is_completed;
  }) || [];

  const getWeeklyStats = () => {
    // Simple count of any reservations that haven't happened yet
    const upcoming = reservations?.filter(r => !r.is_completed) || [];
    return {
      count: upcoming.length,
      percentage: Math.min((upcoming.length / 5) * 100, 100) // Assuming a 5-day school week
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4} xl={3}>
          <h2 className="fw-bold mb-3">Dashboard</h2>
          <TodayScheduleCard />

          <div className="mb-4 mt-4">
            <h6 className="fw-bold mb-2 text-muted small text-uppercase">Live Status</h6>
            {liveReservations.length > 0 ? (
              liveReservations.map(res => {
                const status = getLiveStatus(res);
                return (
                  <Card key={res._id || res.id} className="mb-2 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold small">{res.building?.name || res.buildingName || "Campus Spot"}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            {res.start_hour}:00 - {res.end_hour}:00
                          </div>
                        </div>
                        <Badge 
                          bg={status.color} 
                          className={status.pulse ? "pulse-animation" : ""}
                          text={status.color === 'warning' ? 'dark' : 'white'}
                        >
                          {status.label}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <Card className="border-0 shadow-sm bg-light" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-3 text-center">
                   <p className="text-muted small mb-0 italic">No spots found for {todayStr}.</p>
                </Card.Body>
              </Card>
            )}
          </div>

          <div className="mb-4">
            <h6 className="fw-bold mb-2 text-muted small text-uppercase">AI Sync Progress</h6>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', background: '#f8f9fa' }}>
                <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-dark">{weeklyStats.count} Reservations</span>
                        <Badge bg="primary" pill>{Math.round(weeklyStats.percentage)}%</Badge>
                    </div>
                    <ProgressBar 
                        variant="primary" 
                        now={weeklyStats.percentage} 
                        style={{ height: '8px', borderRadius: '10px' }} 
                    />
                </Card.Body>
            </Card>
          </div>
          
          <div className="p-3 bg-warning rounded-4 mb-4 shadow-sm">
            <h6 className="fw-bold mb-1"><i className="fas fa-bolt me-2"></i>Quick Tip</h6>
            <p className="small mb-0 text-dark">
              Check back here to see your active parking spot in real-time.
            </p>
          </div>
        </Col>

        <Col lg={8} xl={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Campus Buildings</h2>
            <Badge bg="dark" className="p-2 shadow-sm">Live Availability</Badge>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Row>
              {buildings && buildings.map((building) => (
                <Col key={building._id} sm={12} md={6} xl={4} className="mb-4 d-flex align-items-stretch">
                  <Building building={building} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default HomeScreen;