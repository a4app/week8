import React, { useEffect, useState } from 'react'
import '../../css/admin/admin_booking.css'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminBooking() {

	const location = useLocation();
	const  id  = location.state;

    const [pageRefresh, setPageRefresh] = useState(true);

    const history = useNavigate();

    const [loader, setLoader] = useState(true);

    const [tableData, setTableData] = useState([]);
    const [filterData, setFilterData] = useState([]);

    const [filterOption, setFilterOption] = useState('All')

    useEffect(() => {
        // check session authentication
        axios.get('/auth').then((res) => {
            // check if session data matches
            if(res.data.auth === 'admin' && res.data.id === id) {
                axios.get('/admin-booking').then((res) => {
                    setFilterData(res.data);
                    setTableData(res.data);
                    setLoader(false);
                }).catch((err) => {
                    console.log(err);
                    toast.error('Something went wrong', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                    setLoader(false);
                })
            }
            // no session data available
            else {
                // redirect to login
                history('/signin')
            }
        })
        
    },[pageRefresh, id])

    // handle modifications on booking table
    const modifyBooking = (operation, data) => {
        setLoader(true);
        axios.post('/admin/modify-booking', { operation, data }).then((res) => {
            
            // accept cancellation request
            if(res.data.operation === 'accept') {
                toast.info('Booking cancelled', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            // decline cancellation request
            else if(res.data.operation === 'decline') {
                toast.info('Request declined', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            // reject completed booking
            else if(res.data.operation === 'reject') {
                toast.info('Booking rejected', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }

            setFilterOption('All');

            // refresh the page content
            setPageRefresh((value) => !value);
            setLoader(false);
        }).catch((err) => {
            setLoader(false);
            console.log(err);
        })
    }

    const onFilterChange = (option) => {
        setFilterOption(option);
        if(option === 'all') {
            setFilterData(tableData);
        }
        else {
            const filteredResults = tableData.filter( (bookings) => bookings.booking_status.toLowerCase().includes(option));
            setFilterData(filteredResults);
        }
    }

    return (
        <div className='admin-booking-main'>
            <div className={ loader ? 'loader-visible' : 'loader-invisible'}>
                <div className="spinner">
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                </div>
            </div>
            <div className="admin-booking-top-nav-bar">
                <div className="filter">
                    <select className='admin-booking-filter-drop-down' onChange={ e => onFilterChange(e.target.value)} value={filterOption}>
                        <option value="all">All</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                        <option value="aborted">Aborted</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <button className="admin-booking-back-button" onClick={()=>{history(`/admin/profile`, {state: id})}}>Back</button>
            </div>
            <div className="admin-booking-table-div">
                <table className='admin-booking-table'>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Vehicle</th>
                            <th>Booking status</th>
                            <th>Payment status</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            // if no data found in table
                            (filterData.length === 0) ? (
                                <tr>
                                    <td colSpan={5}>No data found..!</td>
                                </tr>
                            ) : (
                                filterData.map( (value) => {
                                    return <tr key={value._id}>
                                        <td>{value.user_name}</td>
                                        <td>{value.vehicle_name}</td>
                                        {
                                            // failed payment, status pending
                                            (value.booking_status === 'pending') && (value.payment_status === 'failed') ? (
                                                <td style={{color: '#F67E0E', fontWeight: '600'}}> Pending </td>
                                            ) : 

                                            // cancelled booking with completed refund
                                            (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> Cancelled </td>
                                            ) : 
                                            
                                            // succesfull booking and payment
                                            (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                                <td style={{color: '#00FF00', fontWeight: '600'}}> Completed </td>
                                            ) : 
                                            
                                            // booking rejected by admin, refund completed
                                            (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> Rejected </td>
                                            ) : 
                                            
                                            // cancellation requested by user
                                            (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> Cancel requested </td>
                                            ) : 
                                            
                                            // aborted and failed booking without retry
                                            (value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                                <td style={{color: '#FF00EE', fontWeight: '600'}}> Aborted </td>
                                            ) : 
                                            
                                            // exception case ... if any
                                            (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> ? </td>
                                            )
                                        }{
                                            // failed payment
                                            (value.booking_status === 'pending' || value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> Failed </td>
                                            ) : 
                                            
                                            // refund completed after cancellation
                                            (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                                <td style={{color: '#62FF91', fontWeight: '600'}}> Refund completed </td>
                                            ) : 
                                            
                                            // completed booking
                                            (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                                <td style={{color: '#00FF00', fontWeight: '600'}}> Succesful </td>
                                            ) : 
                                            
                                            // refund completed after rejection by admin
                                            (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                                <td style={{color: '#62FF91', fontWeight: '600'}}> Refund comleted </td>
                                            ) : 
                                            
                                            // cancellation rqeuested by user
                                            (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                                <td style={{color: '#00FF00', fontWeight: '600'}}> Succesful </td>
                                            ) : 
                                            
                                            // exception case ... if any
                                            (
                                                <td style={{color: '#FF0000', fontWeight: '600'}}> ? </td>
                                            )
                                        }{
                                            // failed payment, pending booking
                                            (value.booking_status === 'pending') && (value.payment_status === 'failed') ? (
                                                <td><></></td>
                                            ) : 
                                            
                                            // cancelled booking, accepted cancellation request
                                            (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                                <td><></></td>
                                            ) : 
                                            
                                            // completed succesfull booking
                                            (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                                <td>
                                                    <button className='reject-button' onClick={()=>{modifyBooking('reject', value)}}>Reject</button>
                                                </td>
                                            ) : 
                                            
                                            // rejected booking by admin
                                            (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                                <td><></></td>
                                            ) : 
                                            
                                            // user requested cancellation
                                            (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                                <td>
                                                    <button className='approve-button' onClick={()=>{modifyBooking('accept', value)}}>Accept</button>
                                                    <button className='reject-button' onClick={()=>{modifyBooking('decline', value)}}>Decline</button>
                                                </td>
                                            ) : 
                                            
                                            // user aborted pending payment
                                            (value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                                <td> <></> </td>
                                            ) : 
                                            
                                            // exceptional case... if any
                                            (
                                                <td>?</td>
                                            )
                                        }
                                    </tr>
                                } )
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminBooking