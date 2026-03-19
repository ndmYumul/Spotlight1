import axios from 'axios'
import {
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_LIST_FAIL,
    NOTIFICATION_READ_REQUEST,
    NOTIFICATION_READ_SUCCESS,
    NOTIFICATION_READ_FAIL,
} from '../constants/notificationConstants'

export const listNotifications = () => async (dispatch, getState) => {
    try {
        dispatch({ type: NOTIFICATION_LIST_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.get('/api/users/notifications/', config)

        dispatch({
            type: NOTIFICATION_LIST_SUCCESS,
            payload: data
        })

    } catch (error) {
        dispatch({
            type: NOTIFICATION_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const readNotification = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: NOTIFICATION_READ_REQUEST })

        const { userLogin: { userInfo } } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        await axios.put(`/api/users/notifications/${id}/read/`, {}, config)

        dispatch({ type: NOTIFICATION_READ_SUCCESS })
        
        dispatch(listNotifications())

    } catch (error) {
        dispatch({
            type: NOTIFICATION_READ_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}