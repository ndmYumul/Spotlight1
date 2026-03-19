import axios from 'axios'
import {
    RESERVATION_CREATE_REQUEST,
    RESERVATION_CREATE_SUCCESS,
    RESERVATION_CREATE_FAIL,
    RESERVATION_LIST_REQUEST,
    RESERVATION_LIST_SUCCESS,
    RESERVATION_LIST_FAIL,
    RESERVATION_DELETE_REQUEST,
    RESERVATION_DELETE_SUCCESS,
    RESERVATION_DELETE_FAIL,
    RESERVATION_UPDATE_REQUEST,
    RESERVATION_UPDATE_SUCCESS,
    RESERVATION_UPDATE_FAIL,
} from '../constants/reservationConstants'

export const createReservation = (reservation) => async (dispatch, getState) => {
    try {
        dispatch({ type: RESERVATION_CREATE_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.post(
            `/api/reservations/create/`,
            reservation,
            config
        )

        dispatch({ type: RESERVATION_CREATE_SUCCESS, payload: data })
        dispatch(listMyReservations())

    } catch (error) {
        dispatch({
            type: RESERVATION_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const listReservations = () => async (dispatch, getState) => {
    try {
        dispatch({ type: RESERVATION_LIST_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.get(`/api/reservations/`, config)

        dispatch({ type: RESERVATION_LIST_SUCCESS, payload: data })

    } catch (error) {
        dispatch({
            type: RESERVATION_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const deleteReservation = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: RESERVATION_DELETE_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        await axios.delete(`/api/reservations/delete/${id}/`, config)

        dispatch({ type: RESERVATION_DELETE_SUCCESS })

        dispatch(listMyReservations())
        dispatch(listReservations())

    } catch (error) {
        dispatch({
            type: RESERVATION_DELETE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const updateReservation = (reservation) => async (dispatch, getState) => {
    try {
        dispatch({ type: RESERVATION_UPDATE_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.put(
            `/api/reservations/update/${reservation._id}/`,
            reservation,
            config
        )

        dispatch({ type: RESERVATION_UPDATE_SUCCESS, payload: data })
        
        dispatch(listMyReservations())

    } catch (error) {
        dispatch({
            type: RESERVATION_UPDATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const listMyReservations = () => async (dispatch, getState) => {
    try {
        dispatch({ type: 'RESERVATION_LIST_MY_REQUEST' })

        const { userLogin: { userInfo } } = getState()
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }

        const { data } = await axios.get(`/api/reservations/myreservations/`, config)

        dispatch({ type: 'RESERVATION_LIST_MY_SUCCESS', payload: data })
    } catch (error) {
        dispatch({
            type: 'RESERVATION_LIST_MY_FAIL',
            payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
        })
    }
}