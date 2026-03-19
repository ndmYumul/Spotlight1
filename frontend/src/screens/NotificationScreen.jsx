import React, { useEffect } from 'react'
import { Container, ListGroup, Badge, Card, Button, Row, Col, Stack } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { listNotifications, readNotification } from '../actions/notificationActions'
import Loader from '../components/Loader'
import Message from '../components/Message'

function NotificationScreen() {
    const dispatch = useDispatch()

    const notificationList = useSelector(state => state.notificationList)
    const { loading, error, notifications } = notificationList

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        if (userInfo) {
            dispatch(listNotifications())
        }
    }, [dispatch, userInfo])

    const markReadHandler = (id) => {
        dispatch(readNotification(id))
    }

    // Helper to determine icon and color based on the message content or type
    const getNotificationStyle = (n) => {
        const type = n.notification_type?.toLowerCase();
        const msg = n.message?.toLowerCase();

        if (type === 'ai' || msg.includes('sync') || msg.includes('automated')) {
            return { icon: 'fa-robot', color: 'text-info', bg: 'bg-info-subtle' };
        }
        if (type === 'warning' || msg.includes('pro') || msg.includes('subscribe')) {
            return { icon: 'fa-crown', color: 'text-warning', bg: 'bg-warning-subtle' };
        }
        if (msg.includes('delete') || msg.includes('clear') || msg.includes('cancel')) {
            return { icon: 'fa-trash-alt', color: 'text-danger', bg: 'bg-danger-subtle' };
        }
        return { icon: 'fa-calendar-check', color: 'text-primary', bg: 'bg-primary-subtle' };
    };

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col md={8}>
                    <h2 className="fw-bold mb-1">Activity Center</h2>
                    <p className="text-muted">Tracking your reservations, AI syncs, and account status.</p>
                </Col>
                <Col md={4} className="text-md-end">
                    <Stack direction="horizontal" gap={2} className="justify-content-md-end">
                        <Badge bg="dark" className="px-3 py-2">
                            {notifications?.length} Total
                        </Badge>
                        <Badge bg="primary" className="px-3 py-2">
                            {notifications?.filter(n => !n.is_read).length} New
                        </Badge>
                    </Stack>
                </Col>
            </Row>

            {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                    <ListGroup variant="flush">
                        {notifications.length === 0 && (
                            <ListGroup.Item className="p-5 text-center text-muted">
                                <i className="fas fa-history fa-3x mb-3 opacity-25"></i>
                                <p className="fw-bold">No activity recorded yet.</p>
                                <small>Your history will appear here once you start reserving spots.</small>
                            </ListGroup.Item>
                        )}
                        
                        {notifications.map((n) => {
                            const style = getNotificationStyle(n);
                            return (
                                <ListGroup.Item 
                                    key={n.id} 
                                    className={`p-4 border-bottom transition-all ${!n.is_read ? 'bg-white' : 'bg-light opacity-75'}`}
                                    style={{ borderLeft: !n.is_read ? '5px solid #0d6efd' : '5px solid transparent' }}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-start">
                                            <div className={`${style.bg} ${style.color} p-3 rounded-circle me-3 d-flex align-items-center justify-content-center`} style={{ width: '50px', height: '50px' }}>
                                                <i className={`fas ${style.icon} fs-5`}></i>
                                            </div>
                                            <div>
                                                <h6 className={`fw-bold mb-1 ${!n.is_read ? 'text-dark' : 'text-secondary'}`}>
                                                    {n.title}
                                                </h6>
                                                <p className="mb-1 text-muted small">{n.message}</p>
                                                <div className="d-flex align-items-center">
                                                    <i className="far fa-clock text-muted me-1" style={{ fontSize: '10px' }}></i>
                                                    <small className="text-muted" style={{fontSize: '11px'}}>
                                                        {new Date(n.created_at).toLocaleString('en-PH')}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {!n.is_read && (
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="rounded-pill px-3 fw-bold"
                                                onClick={() => markReadHandler(n.id)}
                                            >
                                                Dismiss
                                            </Button>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </Card>
            )}

            {/* Suggestion: Added a Footer for System Health */}
            <div className="mt-4 p-3 bg-light rounded-4 d-flex justify-content-between align-items-center border">
                <span className="small text-muted">
                    <i className="fas fa-shield-alt me-2 text-success"></i>
                    AI Reservation Engine: <strong>Active</strong>
                </span>
                <Button variant="link" className="text-decoration-none p-0 small fw-bold" onClick={() => dispatch(listNotifications())}>
                    Refresh Feed
                </Button>
            </div>
        </Container>
    )
}

export default NotificationScreen;