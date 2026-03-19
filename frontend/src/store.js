import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk' 
import { composeWithDevTools } from '@redux-devtools/extension'

import { 
    userLoginReducer, 
    userListReducer, 
    userDeleteReducer, 
    userDetailsReducer, 
    userUpdateReducer,
    userUpdateProfileReducer,
    userCreateReducer ,
    userRegisterReducer,
    userScheduleUpdateReducer,
    userUpdateToProReducer,
} from './reducers/userReducers'

import {
    buildingListReducer,
    buildingDetailsReducer,
    buildingCreateReducer,
    buildingUpdateReducer,
    buildingDeleteReducer
} from './reducers/buildingReducers'

import {
    reservationListReducer,
    reservationCreateReducer,
    reservationDeleteReducer,
    reservationUpdateReducer,
    reservationListMyReducer,
} from './reducers/reservationReducers'

import {
    notificationListReducer,
    notificationReadReducer,
} from './reducers/notificationReducers'

const reducer = combineReducers({
    // User state
    userLogin: userLoginReducer,
    userList: userListReducer,
    userDelete: userDeleteReducer,
    userDetails: userDetailsReducer,
    userUpdate: userUpdateReducer,
    userUpdateProfile: userUpdateProfileReducer,
    userCreate: userCreateReducer,
    userRegister: userRegisterReducer,
    userScheduleUpdate: userScheduleUpdateReducer,
    userUpdateToPro: userUpdateToProReducer,

    // Building state
    buildingList: buildingListReducer,
    buildingDetails: buildingDetailsReducer,
    buildingCreate: buildingCreateReducer,
    buildingUpdate: buildingUpdateReducer,
    buildingDelete: buildingDeleteReducer,

    // Reservation state
    reservationList: reservationListReducer,
    reservationCreate: reservationCreateReducer,
    reservationDelete: reservationDeleteReducer,
    reservationUpdate: reservationUpdateReducer,
    reservationListMy: reservationListMyReducer,

    // Notification state
    notificationList: notificationListReducer,
    notificationRead: notificationReadReducer,
})

// Pull data from Storage if it exists
const userInfoFromStorage = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null

const initialState = {
    userLogin: { userInfo: userInfoFromStorage }
}

const middleware = [thunk]

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
)

export default store