import {
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_LIST_FAIL,
    NOTIFICATION_READ_REQUEST,
    NOTIFICATION_READ_SUCCESS,
    NOTIFICATION_READ_FAIL,
} from '../constants/notificationConstants'

export const notificationListReducer = (state = { notifications: [] }, action) => {
    switch (action.type) {
        case NOTIFICATION_LIST_REQUEST:
            return { loading: true, notifications: [] }
        case NOTIFICATION_LIST_SUCCESS:
            return { loading: false, notifications: action.payload }
        case NOTIFICATION_LIST_FAIL:
            return { loading: false, error: action.payload }
        default:
            return state
    }
}

export const notificationReadReducer = (state = {}, action) => {
    switch (action.type) {
        case NOTIFICATION_READ_REQUEST:
            return { loading: true }
        case NOTIFICATION_READ_SUCCESS:
            return { loading: false, success: true }
        case NOTIFICATION_READ_FAIL:
            return { loading: false, error: action.payload }
        default:
            return state
    }
}