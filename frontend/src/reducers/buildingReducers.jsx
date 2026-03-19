import {
    BUILDING_LIST_REQUEST, BUILDING_LIST_SUCCESS, BUILDING_LIST_FAIL,
    BUILDING_CREATE_REQUEST, BUILDING_CREATE_SUCCESS, BUILDING_CREATE_FAIL, BUILDING_CREATE_RESET,
    BUILDING_DELETE_REQUEST, BUILDING_DELETE_SUCCESS, BUILDING_DELETE_FAIL,
    BUILDING_DETAILS_REQUEST, BUILDING_DETAILS_SUCCESS, BUILDING_DETAILS_FAIL,
    BUILDING_UPDATE_REQUEST, BUILDING_UPDATE_SUCCESS, BUILDING_UPDATE_FAIL, BUILDING_UPDATE_RESET,
} from '../constants/buildingConstants'

export const buildingListReducer = (state = { buildings: [] }, action) => {
    switch (action.type) {
        case BUILDING_LIST_REQUEST: return { loading: true, buildings: [] }
        case BUILDING_LIST_SUCCESS: return { loading: false, buildings: action.payload }
        case BUILDING_LIST_FAIL: return { loading: false, error: action.payload }
        default: return state
    }
}

export const buildingCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case BUILDING_CREATE_REQUEST: return { loading: true }
        case BUILDING_CREATE_SUCCESS: return { loading: false, success: true, building: action.payload }
        case BUILDING_CREATE_FAIL: return { loading: false, error: action.payload }
        case BUILDING_CREATE_RESET: return {}
        default: return state
    }
}

export const buildingDeleteReducer = (state = {}, action) => {
    switch (action.type) {
        case BUILDING_DELETE_REQUEST: return { loading: true }
        case BUILDING_DELETE_SUCCESS: return { loading: false, success: true }
        case BUILDING_DELETE_FAIL: return { loading: false, error: action.payload }
        default: return state
    }
}

export const buildingDetailsReducer = (state = { building: {} }, action) => {
    switch (action.type) {
        case BUILDING_DETAILS_REQUEST: return { ...state, loading: true }
        case BUILDING_DETAILS_SUCCESS: return { loading: false, building: action.payload }
        case BUILDING_DETAILS_FAIL: return { loading: false, error: action.payload }
        default: return state
    }
}

export const buildingUpdateReducer = (state = { building: {} }, action) => {
    switch (action.type) {
        case BUILDING_UPDATE_REQUEST: return { loading: true }
        case BUILDING_UPDATE_SUCCESS: return { loading: false, success: true, building: action.payload }
        case BUILDING_UPDATE_FAIL: return { loading: false, error: action.payload }
        case BUILDING_UPDATE_RESET: return { building: {} }
        default: return state
    }
}