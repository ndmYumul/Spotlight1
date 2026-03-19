import axios from 'axios'
import {
    BUILDING_LIST_REQUEST, BUILDING_LIST_SUCCESS, BUILDING_LIST_FAIL,
    BUILDING_CREATE_REQUEST, BUILDING_CREATE_SUCCESS, BUILDING_CREATE_FAIL,
    BUILDING_DELETE_REQUEST, BUILDING_DELETE_SUCCESS, BUILDING_DELETE_FAIL,
} from '../constants/buildingConstants'
import {
    BUILDING_DETAILS_REQUEST, BUILDING_DETAILS_SUCCESS, BUILDING_DETAILS_FAIL,
    BUILDING_UPDATE_REQUEST, BUILDING_UPDATE_SUCCESS, BUILDING_UPDATE_FAIL,
} from '../constants/buildingConstants'

export const listBuildings = () => async (dispatch) => {
    try {
        dispatch({ type: BUILDING_LIST_REQUEST })
        const { data } = await axios.get('/api/buildings/')
        dispatch({ type: BUILDING_LIST_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: BUILDING_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const getBuildingDetails = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: BUILDING_DETAILS_REQUEST })
        const { userLogin: { userInfo } } = getState()
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
        
        const { data } = await axios.get(`/api/buildings/${id}/`, config)
        dispatch({ type: BUILDING_DETAILS_SUCCESS, payload: data })
    } catch (error) {
        dispatch({
            type: BUILDING_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const createBuilding = () => async (dispatch, getState) => {
    try {
        dispatch({ type: BUILDING_CREATE_REQUEST })
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.post(`/api/buildings/create/`, {}, config)
        dispatch({ type: BUILDING_CREATE_SUCCESS, payload: data })

    } catch (error) {
        dispatch({
            type: BUILDING_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const updateBuilding = (building) => async (dispatch, getState) => {
    try {
        dispatch({ type: BUILDING_UPDATE_REQUEST })
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.put(`/api/buildings/update/${building._id}/`, building, config)
        
        dispatch({ type: BUILDING_UPDATE_SUCCESS, payload: data })
        dispatch({ type: BUILDING_DETAILS_SUCCESS, payload: data })
        dispatch(listBuildings())

    } catch (error) {
        dispatch({
            type: BUILDING_UPDATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const deleteBuilding = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: BUILDING_DELETE_REQUEST })
        const { userLogin: { userInfo } } = getState()
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
        
        await axios.delete(`/api/buildings/delete/${id}/`, config)
        dispatch({ type: BUILDING_DELETE_SUCCESS })
        dispatch(listBuildings())

    } catch (error) {
        dispatch({
            type: BUILDING_DELETE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const uploadBuildingImage = (formData) => async (dispatch, getState) => {
    try {
        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.post('/api/buildings/upload/', formData, config)

        return data 

    } catch (error) {
        console.error("Upload failed:", error.response ? error.response.data : error.message)
    }
}