import React, { useEffect } from 'react'
import { Navbar, Nav, Container, Image, NavDropdown, Badge } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions'
import { listNotifications } from '../actions/notificationActions'

function Header() {
    const dispatch = useDispatch()
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    const notificationList = useSelector((state) => state.notificationList)
    const { notifications } = notificationList

    const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0

    const logoutHandler = () => {
        dispatch(logout())
    }

    useEffect(() => {
        if (userInfo) {
            dispatch(listNotifications())
            
            const interval = setInterval(() => {
                dispatch(listNotifications())
            }, 30000)

            return () => clearInterval(interval)
        }
    }, [dispatch, userInfo])

    const profile_pic = userInfo && userInfo.image 
        ? (userInfo.image.startsWith('http') 
            ? userInfo.image 
            : `${process.env.REACT_APP_API_URL}${userInfo.image}`)
        : "/assets/default_user.png"

    return (
        <Navbar expand="lg" bg="warning" variant="dark" collapseOnSelect className="shadow-sm">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand style={{ cursor: 'pointer' }}>
                        <img alt="" src="/spotlight_logo.png" width="30" height="30" className="d-inline-block align-top" />{' '}
                        <span className="fw-bold">Spotlight</span>
                    </Navbar.Brand>
                </LinkContainer>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {userInfo && (
                            <>
                                <LinkContainer to="/">
                                    <Nav.Link>Dashboard</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/schedule">
                                    <Nav.Link>
                                        Schedule {(!userInfo.isPro && !userInfo.isAdmin) && <i className="fas fa-lock ms-1 small"></i>}
                                    </Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/subscription">
                                    <Nav.Link className="fw-bold text-dark">
                                        Subscription {userInfo.isPro && <Badge bg="dark" className="ms-1">PRO</Badge>}
                                    </Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                    </Nav>

                    <Nav className="ms-auto align-items-center">
                        {userInfo ? (
                            <>
                                <LinkContainer to="/notifications">
                                    <Nav.Link className="me-2 position-relative">
                                        <i className="fas fa-bell fa-lg"></i>
                                        {unreadCount > 0 && (
                                            <Badge 
                                                pill 
                                                bg="danger" 
                                                className="position-absolute top-0 start-50 translate-middle shadow-sm"
                                                style={{ fontSize: '0.6rem' }}
                                            >
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </LinkContainer>

                                <Image
                                    src={profile_pic}
                                    roundedCircle
                                    width="35"
                                    height="35"
                                    style={{ objectFit: 'cover' }} 
                                    className="border border-2 border-light shadow-sm"
                                    alt="User Profile"
                                    onError={(e) => { e.target.src = "/assets/default_user.png" }}
                                />
                                
                                <NavDropdown 
                                    title={
                                        <span>
                                            {userInfo.username || userInfo.name}
                                            {userInfo.isPro && (
                                                <Badge bg="dark" className="ms-2 shadow-sm" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                                                    <i className="fas fa-crown me-1"></i>PRO
                                                </Badge>
                                            )}
                                        </span>
                                    } 
                                    id='username' 
                                    align="end"
                                >
                                    <LinkContainer to='/profile'>
                                        <NavDropdown.Item><i className="fas fa-user-circle me-2"></i>Profile</NavDropdown.Item>
                                    </LinkContainer>

                                    <LinkContainer to="/settings">
                                        <NavDropdown.Item><i className="fas fa-cog me-2"></i>Settings</NavDropdown.Item>
                                    </LinkContainer>

                                    {userInfo.isAdmin && (
                                        <>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Header className="text-dark fw-bold">Admin Management</NavDropdown.Header>
                                            
                                            <LinkContainer to='/admin/userlist'>
                                                <NavDropdown.Item><i className="fas fa-users me-2"></i>User List</NavDropdown.Item>
                                            </LinkContainer>

                                            <LinkContainer to='/admin/subscriptions'>
                                                <NavDropdown.Item><i className="fas fa-crown me-2"></i>Subscription List</NavDropdown.Item>
                                            </LinkContainer>

                                            <LinkContainer to='/admin/buildinglist'>
                                                <NavDropdown.Item><i className="fas fa-university me-2"></i>Building List</NavDropdown.Item>
                                            </LinkContainer>
                                            
                                            <LinkContainer to='/admin/reservations'>
                                                <NavDropdown.Item><i className="fas fa-calendar-check me-2"></i>Reservation List</NavDropdown.Item>
                                            </LinkContainer>
                                        </>
                                    )}

                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logoutHandler} className="text-danger">
                                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <LinkContainer to="/login">
                                <Nav.Link><i className="fas fa-user"></i> Login</Nav.Link>
                            </LinkContainer>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header