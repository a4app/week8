import React, { useEffect, useState } from 'react';
import '../../css/admin/payments.css'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Payments() {

    const location = useLocation();
    const  id  = location.state;

    const history = useNavigate();

    const [loader, setLoader] = useState(true);

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        axios.get('/auth').then((res) => {
            // check session data
            if(res.data.auth === 'admin' && res.data.id === id) {
                axios.get('/admin-booking').then((res) => {
                    setTableData(res.data);
                    setLoader(false);
                }).catch((err) => {
                    console.log(err);
                    setLoader(false);
                })
            }
            else {
                history('/signin')
            }
        })
        
    },[history, id])

    return (
        <div className='admin-payments-page-main'>
            <div className={ loader ? 'loader-visible' : 'loader-invisible'}>
                <div className="spinner">
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                </div>
            </div>
            <button className="user-booking-back-button" onClick={()=>{history(`/admin/profile`, {state: id})}}>Back</button>
            <div className='admin-payments-table-div'>
                <table className="admin-payments-table">
                    <thead> {/* Table headings */}
                        <tr>
                            <th>Customre</th>
                            <th>Vehicle</th>
                            <th>Payment status</th>
                        </tr>
                    </thead>
                    <tbody> {/* Table body */}
                    {
                        tableData.map((value) => {
                            return <tr>
                                <td> {value.user_name} </td>
                                <td> {value.vehicle_name} </td>
                                {
                                    // failed payment
                                    (value.payment_status === 'failed') ? (
                                        <td style={{color: '#FF0000', fontWeight: '600'}}> Failed </td>
                                    ) : 
                                    
                                    // completed refund
                                    (value.payment_status === 'refund-completed') ? (
                                        <td style={{color: '#62FF91', fontWeight: '600'}}> Refund completed </td>
                                    ) : 
                                    
                                    // Succesfull payment
                                    (value.payment_status === 'succesful') ? (
                                        <td style={{color: '#00FF00', fontWeight: '600'}}> Succesful </td>
                                    ) : 
                                    
                                    // exception if any
                                    (
                                        <td style={{color: '#FF0000', fontWeight: '600'}}> ? </td>
                                    )
                                }
                            </tr>
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Payments