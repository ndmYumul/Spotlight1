import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from 'react-bootstrap';
import HomeScreen from './screens/HomeScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DetailScreen from './screens/DetailScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminUserListScreen from './screens/AdminUserListScreen';
import AdminReservationListScreen from './screens/AdminReservationListScreen';
import UserEditScreen from './screens/UserEditScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import SubscriptionSuccessScreen from './screens/SubscriptionSuccessScreen'; 
import AdminSubscriptionListScreen from './screens/AdminSubscriptionListScreen'; 
import AdminBuildingListScreen from './screens/AdminBuildingListScreen';
import BuildingEditScreen from './screens/BuildingEditScreen';
import SettingsScreen from './screens/SettingsScreen';
import RegisterScreen from './screens/RegisterScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import NotificationScreen from './screens/NotificationScreen';
import { Navigate } from 'react-router-dom' 
import AdminRoute from './components/AdminRoute'
import { useSelector } from 'react-redux'
import { PayPalScriptProvider } from "@paypal/react-paypal-js" 
import Chat from './Chat';
import UserScreen from './screens/UserScreen';
import ScheduleScreen from './screens/ScheduleScreen';

function App() {

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  return (
    <PayPalScriptProvider options={{ "client-id": "AVRhcatNF4Z8aAzZ9mdUVf3BZcz8H6JdYw2CjTdJonM0oX5GLvHyOGimD3QVu4JRzGPgrvvMrCQgKbVJ", currency: "USD" }}>
      <Router>
          <Header />
          <main className="py-3">
            <Container>
              <Routes>
                <Route path='/' element={<HomeScreen />} exact />
                <Route path='/building/:id' element={<DetailScreen />} />
                <Route path='/login' element={<LoginScreen />} />
                <Route path='/profile' element={<ProfileScreen />} />
                <Route path='/notifications' element={<NotificationScreen />} />
                <Route path='/admin/userlist' element={<AdminRoute><AdminUserListScreen /></AdminRoute>} />
                <Route path='/admin/reservations' element={<AdminReservationListScreen />} />
                <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
                <Route path='/subscription' element={<SubscriptionScreen />} />
                <Route path='/subscription/success' element={<SubscriptionSuccessScreen />} /> 
                <Route path='/admin/subscriptions' element={<AdminRoute><AdminSubscriptionListScreen /></AdminRoute>} /> 
                <Route path='/admin/buildinglist' element={<AdminBuildingListScreen />} />
                <Route path='/admin/building/:id/edit' element={<BuildingEditScreen />} />
                <Route path='/settings' element={<SettingsScreen />} />
                <Route path='/register' element={<RegisterScreen />} />
                <Route path='/schedule' element={
                    userInfo
                        ? <ScheduleScreen /> 
                        : <Navigate to='/login' />
                } />
              </Routes>
            </Container>
        </main>
        <Footer />
        <Chat/>
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;