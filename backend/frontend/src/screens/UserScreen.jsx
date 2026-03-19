import React from 'react'
import { Container, Card } from 'react-bootstrap'

function UserScreen() {
  // Sample user data
  const sampleUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'User',
    gradeLevel: '10'
  }

  return (
    <Container className="py-5">
      <h1>User Profile</h1>
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>User Information</Card.Title>
          <Card.Text>
            <strong>Name:</strong> {sampleUser.name}
          </Card.Text>
          <Card.Text>
            <strong>Email:</strong> {sampleUser.email}
          </Card.Text>
          <Card.Text>
            <strong>Role:</strong> {sampleUser.role}
          </Card.Text>
          <Card.Text>
            <strong>Grade Level:</strong> {sampleUser.gradeLevel}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default UserScreen
