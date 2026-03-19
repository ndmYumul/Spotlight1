import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = ({ children }) => {
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    // If userInfo exists AND the user is an Admin, render the children (the screen)
    // Otherwise, redirect to login
    return userInfo && userInfo.isAdmin ? (
        children
    ) : (
        <Navigate to="/login" />
    )
}

export default AdminRoute