import React, { useState, useEffect, useMemo } from 'react'
import { Card, Badge, Row, Col } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const getMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
}

function TodayScheduleCard() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const { schedule, todayName } = useMemo(() => {
        const name = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        
        const sched = userInfo?.schedule?.weekly_schedule?.find((d) => 
            d.day.toLowerCase().trim() === name.toLowerCase().trim()
        )
        
        return { schedule: sched, todayName: name }
    }, [userInfo])

    if (!schedule || !schedule.active) {
        return (
            <Card className="border-0 shadow-sm rounded-4 bg-light text-center p-3 mb-4">
                <p className="text-muted mb-0 small">No AI sync scheduled for {todayName}.</p>
            </Card>
        )
    }

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const arrivalMinutes = getMinutes(schedule.arrival)
    const graceMinutes = arrivalMinutes + 30
    const departureMinutes = getMinutes(schedule.departure)

    let status = { label: 'Upcoming', bg: 'secondary' }
    if (nowMinutes > departureMinutes) {
        status = { label: 'Shift Ended', bg: 'dark' }
    } else if (nowMinutes > graceMinutes) {
        status = { label: 'Late (Slot at Risk)', bg: 'danger' }
    } else if (nowMinutes > arrivalMinutes) {
        status = { label: 'Grace Period', bg: 'warning' }
    } else {
        status = { label: 'On Track', bg: 'success' }
    }

    const formatGrace = (timeStr) => {
        const total = getMinutes(timeStr) + 30
        const h = Math.floor(total / 60) % 24
        const m = total % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }

    return (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className={`bg-${status.bg} p-2 text-center text-white fw-bold small`}>
                {status.label.toUpperCase()} — {todayName.toUpperCase()}
            </div>
            <Card.Body className="p-4">
                <Row className="text-center">
                    <Col xs={6} className="border-end">
                        <div className="text-muted x-small text-uppercase fw-bold">Target</div>
                        <h4 className="fw-bold mb-0">{schedule.arrival}</h4>
                    </Col>
                    <Col xs={6}>
                        <div className="text-muted x-small text-uppercase fw-bold">Limit</div>
                        <h4 className="fw-bold mb-0 text-danger">{formatGrace(schedule.arrival)}</h4>
                    </Col>
                </Row>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Leaving at: <strong>{schedule.departure}</strong></span>
                    <Badge bg={status.bg}>{status.label}</Badge>
                </div>
                {userInfo?.schedule?.updated_at && (
                    <div className="text-center mt-2">
                        <span style={{ fontSize: '10px' }} className="text-muted italic">
                            AI Sync: {new Date(userInfo.schedule.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}

export default TodayScheduleCard