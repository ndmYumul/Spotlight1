import React, { useState, useEffect } from 'react'
import { Badge } from 'react-bootstrap'

function LiveClock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const hours = time.getHours()
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()

    // Formatting for 24h display
    const format = (num) => (num < 10 ? `0${num}` : num)

    return (
        <div className="text-center p-3 my-2 border rounded bg-light shadow-sm">
            <h5 className="text-muted mb-1">Current Campus Time</h5>
            <h2 className="fw-bold text-dark">
                {format(hours)}:{format(minutes)}:{format(seconds)}
            </h2>
            <Badge bg="warning" text="dark">
                Active Slot: {format(hours)}:00
            </Badge>
        </div>
    )
}

export default LiveClock