import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Form, Button, Container, Row, Col, Toast, ToastContainer } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getBuildingDetails, updateBuilding } from '../actions/buildingActions'
import { BUILDING_UPDATE_RESET } from '../constants/buildingConstants'
import { uploadBuildingImage } from '../actions/buildingActions'

function BuildingEditScreen() {
    const { id: buildingId } = useParams()
    
    const [name, setName] = useState('')
    const [image, setImage] = useState('') 
    const [description, setDescription] = useState('')
    const [totalSlots, setTotalSlots] = useState(0)
    const [maxSlots, setMaxSlots] = useState(0)
    const [uploading, setUploading] = useState(false) 

    const [showToast, setShowToast] = useState(false)
    const [toastMsg, setToastMsg] = useState('')

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const buildingDetails = useSelector((state) => state.buildingDetails)
    const { loading, error, building } = buildingDetails

    const buildingUpdate = useSelector((state) => state.buildingUpdate)
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = buildingUpdate

    useEffect(() => {
        if (successUpdate) {
            dispatch({ type: BUILDING_UPDATE_RESET })
            setToastMsg('Building updated successfully!')
            setShowToast(true)
            setTimeout(() => navigate('/admin/buildinglist'), 2000)
        } else {
            if (buildingId && buildingId !== 'undefined') {
                if (!building || !building.name || String(building._id) !== String(buildingId)) {
                    dispatch(getBuildingDetails(buildingId))
                } else {
                    setName(building.name || '')
                    setImage(building.image || '')
                    setDescription(building.description || '')
                    setTotalSlots(building.totalSlots || 0)
                    setMaxSlots(building.maxSlots || 0) 
                }
            }
        }
    }, [dispatch, buildingId, building, successUpdate, navigate])

    const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    const formData = new FormData()

    formData.append('image', file)
    formData.append('building_id', buildingId)

    setUploading(true)

    try {
        const cloudinaryUrl = await dispatch(uploadBuildingImage(formData))
        
        setImage(cloudinaryUrl) 
        setUploading(false)
    } catch (error) {
        setUploading(false)
    }
}

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(updateBuilding({ 
            _id: buildingId,
            name, 
            image, 
            description, 
            totalSlots: Number(totalSlots),
            maxSlots: Number(maxSlots) 
        }))
    }

    return (
        <Container>
            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
                    <Toast.Header>
                        <strong className="me-auto">System Notification</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">{toastMsg}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Link to='/admin/buildinglist' className='btn btn-light my-3 border shadow-sm'>
                <i className='fas fa-arrow-left me-2'></i>Go Back
            </Link>

            <Row className="justify-content-md-center">
                <Col xs={12} md={6}>
                    <Form onSubmit={submitHandler} className="p-4 shadow rounded bg-white border-top border-warning border-4">
                        <h1 className="mb-4 text-center text-dark">Edit Building Specs</h1>

                        {loadingUpdate && <Loader />}
                        {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

                        {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                            <>
                                <Form.Group controlId='name' className="mb-3">
                                    <Form.Label className="fw-bold text-dark">Building Name</Form.Label>
                                    <Form.Control 
                                        type='text' 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                    />
                                </Form.Group>

                                <Form.Group controlId='image' className="mb-3">
                                    <Form.Label className="fw-bold text-dark">Building Image</Form.Label>
                                    <Form.Control 
                                        type='text' 
                                        value={image} 
                                        onChange={(e) => setImage(e.target.value)} 
                                        className="mb-2"
                                    />
                                    <Form.Control type="file" onChange={uploadFileHandler} />
                                    {uploading && <Loader />}
                                </Form.Group>

                                <Form.Group controlId='description' className="mb-3">
                                    <Form.Label className="fw-bold text-dark">Description</Form.Label>
                                    <Form.Control 
                                        as='textarea' 
                                        rows={3} 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                    />
                                </Form.Group>

                                <Row>
                                    <Col>
                                        <Form.Group controlId='totalSlots' className="mb-4">
                                            <Form.Label className="fw-bold text-success">Current Available</Form.Label>
                                            <Form.Control 
                                                type='number' 
                                                value={totalSlots} 
                                                onChange={(e) => setTotalSlots(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId='maxSlots' className="mb-4">
                                            <Form.Label className="fw-bold text-warning">Max Slots</Form.Label>
                                            <Form.Control 
                                                type='number' 
                                                value={maxSlots} 
                                                onChange={(e) => setMaxSlots(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid">
                                    <Button type='submit' variant='warning' className="fw-bold py-2 shadow-sm text-dark">
                                        <i className="fas fa-save me-2"></i> Update Building
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default BuildingEditScreen