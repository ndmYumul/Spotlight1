import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, Row, Col, Container, Card, Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { listBuildings, createBuilding, deleteBuilding } from '../actions/buildingActions'
import { BUILDING_CREATE_RESET, BUILDING_UPDATE_RESET } from '../constants/buildingConstants'
import Loader from '../components/Loader'
import Message from '../components/Message'

function AdminBuildingListScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const buildingList = useSelector(state => state.buildingList)
    const { loading, error, buildings } = buildingList

    const buildingCreate = useSelector(state => state.buildingCreate)
    const { 
        loading: loadingCreate, 
        error: errorCreate, 
        success: successCreate, 
        building: createdBuilding 
    } = buildingCreate

    const buildingUpdate = useSelector(state => state.buildingUpdate)
    const { success: successUpdate } = buildingUpdate

    const buildingDelete = useSelector(state => state.buildingDelete)
    const { loading: loadingDelete, error: errorDelete, success: successDelete } = buildingDelete

    useEffect(() => {
        dispatch({ type: BUILDING_CREATE_RESET })

        if (successUpdate || successDelete) {
            dispatch({ type: BUILDING_UPDATE_RESET })
            dispatch(listBuildings())
        } 
        
        else if (successCreate && createdBuilding?._id) {
            navigate(`/admin/building/${createdBuilding._id}/edit`)
        } 
        
        else {
            dispatch(listBuildings())
        }
    }, [dispatch, navigate, successCreate, successUpdate, successDelete, createdBuilding])

    const createBuildingHandler = () => {
        dispatch(createBuilding())
    }

    const deleteHandler = (id) => {
        if (window.confirm('Are you sure you want to delete this building? This will remove all associated reservations.')) {
            dispatch(deleteBuilding(id))
        }
    }

    return (
        <Container>
            <Row className='align-items-center my-4'>
                <Col>
                    <h1 className="fw-bold text-dark">
                        <i className="fas fa-university me-2 text-warning"></i>Buildings
                    </h1>
                </Col>
                <Col className='text-end'>
                    <Button className='btn-warning fw-bold shadow-sm text-dark' onClick={createBuildingHandler}>
                        <i className='fas fa-plus me-2'></i> Create Building
                    </Button>
                </Col>
            </Row>

            {loadingCreate && <Loader />}
            {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
            
            {loadingDelete && <Loader />}
            {errorDelete && <Message variant='danger'>{errorDelete}</Message>}

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="p-0">
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <Message variant='danger'>{error}</Message>
                    ) : (
                        <Table hover responsive className='table-sm mb-0 align-middle'>
                            <thead className="bg-light">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">NAME</th>
                                    <th className="p-3">CAPACITY</th>
                                    <th className="p-3 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buildings && buildings.length > 0 ? (
                                    buildings.map(building => (
                                        <tr key={building._id}>
                                            <td className="p-3 text-muted">{building._id}</td>
                                            <td className="p-3 fw-bold">{building.name}</td>
                                            <td className="p-3">
                                                <Badge bg={building.totalSlots > 0 ? 'success' : 'danger'} className="px-3 py-2">
                                                    {building.totalSlots} / {building.maxSlots}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button 
                                                    variant='light' 
                                                    className='btn-sm border shadow-sm me-2'
                                                    onClick={() => navigate(`/admin/building/${building._id}/edit`)}
                                                >
                                                    <i className='fas fa-edit text-primary'></i>
                                                </Button>

                                                <Button 
                                                    variant='danger' 
                                                    className='btn-sm shadow-sm'
                                                    onClick={() => deleteHandler(building._id)}
                                                >
                                                    <i className='fas fa-trash'></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4">No buildings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    )
}

export default AdminBuildingListScreen;