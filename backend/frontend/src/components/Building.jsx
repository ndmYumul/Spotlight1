import React from 'react'
import { Card } from 'react-bootstrap'
import StatusBadge from './StatusBadge'
import { Link } from 'react-router-dom'
import { Ratio } from 'react-bootstrap'

function Building({ building }) {
  return (
    <Card className="my-3 p-3 rounded shadow-sm h-100"> {/* h-100 keeps cards uniform in a grid */}
        <Link to={`/building/${building._id}`}>
            <Ratio aspectRatio="16x9">
                <Card.Img 
                    src={building.image}
                    variant="top" 
                    style={{ objectFit: 'cover' }} 
                />
            </Ratio>
        </Link>

        <Card.Body className="d-flex flex-column">
            <Link to={`/building/${building._id}`} className='text-decoration-none text-dark'>
                <Card.Title as="div" className="mb-3">
                    <strong>{building.name}</strong>
                </Card.Title>
            </Link>

            <Card.Text as="div" className="mt-auto">
                <StatusBadge slots={building.totalSlots} totalSlots={building.maxSlots} />
            </Card.Text>
        </Card.Body>
    </Card>
  )
}

export default Building
