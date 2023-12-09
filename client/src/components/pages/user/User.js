import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import '../../css/user/user.css';
import { toast } from 'react-toastify';

function User() {

    const history = useNavigate();
    const location = useLocation();
    
    const { id } = useParams();

    const [loader, setLoader] = useState(true);

    const [userData, setUserData] = useState({})

    const [tableData, setTableData] = useState([]);
    const [filterData, setFilterData] = useState([]);

    // get vehicles data
    const getVehiclesData = () => {
        setLoader(true);
        axios.get('/vehicles')
		.then((res) => {
			setTableData(res.data);
            const itemsAscending = res.data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
			setFilterData(itemsAscending);
            setLoader(false);
		}).catch((err) => {
			console.log(err);
			setTableData([]);
            setLoader(false);
		});
    }

    useEffect(() => {
        axios.get('/auth').then((res) => {
            // check session data
            if(res.data.auth === 'user' && res.data.id === id ) {
                getVehiclesData();
                onSortChange('asc');
                
                // set userdata with session details
                setUserData({name: res.data.username, _id: res.data.id})

                const queryParams = new URLSearchParams(location.search);
                const status = queryParams.get('status');

                // redirected to user page after succesful booking
                if(status === 'success') {
                    toast.success('Booking succesfull', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
                // redirected to user page after failed booking
                else if(status === 'failed') {
                    toast.success('Booking failed', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
            }
            else {
                history('/login');
            }
        }).catch((err) => {
            console.log(err);
            toast.error('Error occured', {
                autoClose: 2000,
                pauseOnHover: false
            });
        })

        
    },[id, location, history])

    // handle change of search input field
    const onSearchChange = (e) => {
        const searchText = e.target.value;
    
        // filter vehicles data corresponds to search text and vehicle name
        const filteredResults = tableData.filter((vehicle) =>
            vehicle.name.toLowerCase().includes(searchText.toLowerCase())
        );

        // const filteredResults = tableData.filter((item) => {
        //     for (const key in item) {
        //         if (typeof item[key] === 'string' && item[key].toLowerCase().includes(searchText.toLowerCase())) {
        //             return true;
        //         }
        //     }
        //     return false;
        // });;
    
        setFilterData(filteredResults);
    }

    const HandleBooking = (vehicle_id, vehicle_name, price, quantity) => {
        const user_name = userData.name;
        const user_id = userData._id;
        
        // Making an HTTP POST request to create a checkout session
        axios.post('/create-checkout-session', { user_id, vehicle_id, user_name, vehicle_name, price, quantity })
        .then(res => {
            // If a 'url' property exists in the response data, redirect the user to that URL
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        })
        .catch(err => {
            // If there's an error during the request, display an error toast notification
            console.log(err);
        })
    }

    // convert buffer image to Base64String
    const arrayBufferToBase64 = (buffer) => {
		var binary = '';
		var bytes = [].slice.call(new Uint8Array(buffer));
		bytes.forEach((b) => binary += String.fromCharCode(b));
		return window.btoa(binary);
	};

    // handle sorting change
    const onSortChange = (order) => {
        if(order === 'asc') {
            const itemsAscending = [...filterData].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            setFilterData(itemsAscending);
        }
        else {
            const itemsDescending = [...filterData].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            setFilterData(itemsDescending);
        }
    }

    // handle logout button
    const logoutButton = () => {
        // destroy session data
		axios.get('/logout').then((res) => {
			if(res.data) {
				history('/login')
			}
			else {
				toast.error('Something went wrong', {
                    autoClose: 2000,
                    pauseOnHover: false
                })
			}
		}).catch((err) => {
			console.log('Eror occured', err);
		})
	}

    return (
        <div className='user-page-main'>

            <div className="user-top-nav-bar"> {/* Navigation bar */}
                <input type="text" className='search-bar' placeholder='Search . . .' onChange={onSearchChange}/>
                <div className="nav-bar-options">
                    <button className='my-bookings-button' onClick={()=>{history(`/user/booking`, {state: id})}}>Bookings</button>
                    <button className='new-logout-button' onClick={logoutButton}>Logout</button>
                </div>
            </div>
            {
                (loader) ? (
                    <div className="user-loader loader">
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                    </div>
                ) : (
                    <div className="user-body">
                        <div className="sort-div">
                            <select className="sorting-dropdown" onChange={ e => onSortChange(e.target.value)} >
                                <option value='asc'>Price low to high</option>
                                <option value='desc'>Price high to low</option>
                            </select>
                        </div>
                        <div className="user-page-vehicles">
                        {
                            (filterData.length !== 0) ? (
                                filterData.map( (v) => {
                                    const base64String = arrayBufferToBase64(v.image.data.data);
                                    return <div className="vehicle-tile" key={v._id}>
                                        <img className='vehicle-img' src={`data:${v.image.contentType};base64,${base64String}`} alt='vehicle' />
                                        <div className="vehicle-name"> {v.name} </div>
                                        <div className="vehicle-price"> ₹{v.price} </div>
                                        <div className="vehicle-quantity"> {v.quantity} &nbsp; left</div>
                                        <div className="vehicle-desc"> {v.desc} </div>
                                        <button className='order-now' onClick={()=>{HandleBooking(v._id, v.name, v.price, v.quantity)}} disabled={v.quantity === '0'}>
                                            Order Now
                                        </button>
                                    </div>
                                })
							) : (
								<div className="vehicle-tile no-data" key='not-found' style={{height: '223px'}}>
									No data found
								</div>
							)
						}
					    </div>
                    </div>
                )
            }
        </div>
    )
}

export default User