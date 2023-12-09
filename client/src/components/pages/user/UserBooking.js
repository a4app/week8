import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../css/user/user_booking.css'
import axios from 'axios';
import { toast } from 'react-toastify';

function UserBookings() {

    const location = useLocation();
    const id = location.state;
    const history = useNavigate();

    const [loader, setLoader] = useState(true);

    const [pageRefresh, setPageRefresh] = useState(true);

    const [tableData, setTableData] = useState([]);
    const [filterData, setFilterData] = useState([]);

    const [filterOption, setFilterOption] = useState('all');

    useEffect(() => {
        axios.get('/auth').then((res) => {
            if(res.data.auth === 'user' && res.data.id === id) {
                axios.post('/user-bookings', { id }).then((res) => {
                    setTableData(res.data);
                    setFilterData(res.data)
                    setLoader(false)
                }).catch((err) => {
                    console.log(err);
                    toast.error('Something went wrong !', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                    setLoader(false);
                })
            }
            else {
                history('/login')
            }
        })
        
    },[pageRefresh, id, history])

    const modifyBooking = (operation, data) => {
        setLoader(true);
        axios.post('/user/modify-booking', { operation, data }).then((res) => {
            if(!res.data.status) {
                toast.error('Operation failed..!', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            else {
                setPageRefresh((value) => !value);
                if(res.data.operation === 'request-cancel') {
                    toast.info('Cancellation requested', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
                else if(res.data.operation === 'abort') {
                    toast.info('Booking aborted', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
                else if(res.data.operation === 'retry') {
                    window.location.href = res.data.url;
                }
            }
            setFilterOption('all')
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
        <div className='user-booking-main'>
            <div className={ loader ? 'loader-visible' : 'loader-invisible'}>
                <div className="spinner">
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                </div>
            </div>
            <div className="user-booking-top-nav-bar">
                <div className="filter">
                    <select className='user-booking-filter-drop-down' onChange={ e => onFilterChange(e.target.value)} value={filterOption}>
                        <option value="all">All</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                        <option value="aborted">Aborted</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <button className="user-booking-back-button" onClick={()=>{history(`/user/${id}`)}}>Back</button>
            </div>
            <div className="user-booking-table-div">
                <table className='user-booking-table'>
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
                                        (value.booking_status === 'pending') && (value.payment_status === 'failed') ? (
                                            <td style={{color: '#F67E0E', fontWeight: '600'}}> Pending </td>
                                        ) : (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> Cancelled </td>
                                        ) : (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                            <td style={{color: '#00FF00', fontWeight: '600'}}> Completed </td>
                                        ) : (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> Rejected </td>
                                        ) : (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> Cancel requested </td>
                                        ) : (value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                            <td style={{color: '#FF00EE', fontWeight: '600'}}> Aborted </td>
                                        ) : (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> ? </td>
                                        )
                                    }{
                                        (value.booking_status === 'pending' || value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> Failed </td>
                                        ) : (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                            <td style={{color: '#62FF91', fontWeight: '600'}}> Refund completed </td>
                                        ) : (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                            <td style={{color: '#00FF00', fontWeight: '600'}}> Succesful </td>
                                        ) : (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                            <td style={{color: '#62FF91', fontWeight: '600'}}> Refund comleted </td>
                                        ) : (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                            <td style={{color: '#00FF00', fontWeight: '600'}}> Succesful </td>
                                        ) : (
                                            <td style={{color: '#FF0000', fontWeight: '600'}}> ? </td>
                                        )
                                    }
                                    {
                                        (value.booking_status === 'pending') && (value.payment_status === 'failed') ? (
                                            <td>
                                                <button className='retry-button' onClick={()=>{modifyBooking('retry', value)}}>Retry</button>
                                                <button className='cancel-button' onClick={()=>{modifyBooking('abort', value)}}>Abort</button>
                                            </td>
                                        ) : (value.booking_status === 'cancelled') && (value.payment_status === 'refund-completed') ? (
                                            <td><></></td>
                                        ) : (value.booking_status === 'completed') && (value.payment_status === 'succesful') ? (
                                            <td><button className='request-cancel-button' onClick={()=>{modifyBooking('request-cancel', value)}}>Request cancel</button></td>
                                        ) : (value.booking_status === 'rejected') && (value.payment_status === 'refund-completed') ? (
                                            <td><></></td>
                                        ) : (value.booking_status === 'cancel-requested') && (value.payment_status === 'succesful') ? (
                                            <td><></></td>
                                        ) : (value.booking_status === 'aborted') && (value.payment_status === 'failed') ? (
                                            <td><></></td>
                                        ) : (
                                            <td><button>?</button></td>
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

export default UserBookings