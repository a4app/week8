import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../css/admin/profile.css'
import '../../css/spinner.css'
import axios from 'axios';
import { toast } from 'react-toastify';

function AdminProfile() {

    const location = useLocation();
    const id = location.state;
    
    const history = useNavigate();

    const [loader, setLoader] = useState(true);

    const [editPanel, setEditPanel] = useState(false);
    
    const [adminData, setAdminData] = useState({id: '', username: '..', image: '?'})
    
    const [profilePicture, setProfilePicture] = useState('');

    // convert Image in Buffer to Base64String
    const arrayBufferToBase64 = (buffer) => {
		var binary = '';
		var bytes = [].slice.call(new Uint8Array(buffer));
		bytes.forEach((b) => binary += String.fromCharCode(b));
		return window.btoa(binary);
	};

    useEffect(() => {
        setLoader(false);
        axios.get('/auth').then((res) => {
            // check session data
            if(res.data.auth === 'admin' && res.data.id === id) {
                // set admin data from session data
                setAdminData({
                    id: res.data.id,
                    username: res.data.username,
                    image: (res.data.image.data) ? arrayBufferToBase64(res.data.image.data.data) : ''
                });
            }
            else {
                history('/signin')
            }
        })
    },[id, history])

    // update button for profile picture
    const editProfile = () => {
        // check for picked file
        if(profilePicture) {
            setLoader(true);
            const formData = new FormData();
            formData.append('image', profilePicture);
            formData.append('id', adminData.id);
            axios.post('/edit-profile', formData ).then((res) => {
                
                // succesfull profile updation
                if(res.data) {
                    setAdminData({
                        id: res.data._id,
                        username: res.data.username,
                        password: res.data.password,
                        image: (res.data.image.data) ? arrayBufferToBase64(res.data.image.data.data) : ''
                    });
                    toast.success('Updation succesfull', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
                // failed updation
                else {
                    toast.error('Updation failed', {
                        autoClose: 2000,
                        pauseOnHover: false
                    });
                }
                setLoader(false);
                setProfilePicture(); // assign picked file as empty
                setEditPanel(false);
            })
        }
        // if no file picked
        else {
            toast.warning('Pick a file', {
                autoClose: 2000,
                pauseOnHover: false
            })
        }
    }

    // logout button
    const logoutButton = () => {
        // destroy session data
		axios.get('/logout').then((res) => {
            // logout succesfull
			if(res.data) {
				history('/signin')
			}
            // failed logout
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
        <div className='profile-page-main'>
            {
                (loader) ? (
                    <div className="loader admin-loader">
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
					</div>
                ) : (
                    (!editPanel) ? (
                        <div className="profile-page-container">
                            <button className="admin-profile-logout-button" onClick={logoutButton}>Logout</button>
                            <div className="profile-picture-div">
                                <img className='profile-edit-button' src="/edit.png" alt="edit" onClick={()=>{setEditPanel(true)}} />
                                {
                                    // if no profile pic found
                                    (adminData.image === '') ? (
                                        <div className="profile-picture-not-found">Not found</div>
                                    ) : 
                                    
                                    // initial state
                                    (adminData.image === '?') ? (
                                        <div className="image-loading-div">
                                            <div className="spinner">
                                                <div className="white"></div>
                                                <div className="white"></div>
                                                <div className="white"></div>
                                                <div className="white"></div>
                                            </div>
                                        </div>
                                        
                                    ) : 
                                    
                                    // display admin profile picture
                                    (
                                        <img className="profile-picture" src={`data:${adminData.image.contentType};base64,${adminData.image}`} alt='dp' />
                                    )
                                }
                            </div>
                            <div className="user-name">{adminData.username}</div>
                            <div className="profile-page-options-div">
                                <div className="hyper-links" onClick={()=>{history('/admin/customers', {state: id})}}>Customers</div>
                                <div className="hyper-links" onClick={()=>{history('/admin/booking', {state: id})}}>Bookings</div>
                                <div className="hyper-links" onClick={()=>{history('/admin/vehicles', {state: id})}}>Vehicles</div>
                                <div className="hyper-links" onClick={()=>{history('/admin/payments', {state: id})}}>Payments</div>
                            </div>
                        </div>
                    ) : (
                        <div className="edit-panel"> {/* profile updation container */}
                            <label htmlFor="image" className='choose-file-button'>Choose File</label>
                            <input 
                                type="file" 
                                accept='image/*' 
                                onChange={(e)=>{ setProfilePicture(e.target.files[0])}}
                                name='image' 
                                id='image'
                                style={{display: 'none'}}
                            />
                            
                            {
                                // if file picked
                                profilePicture ? (
                                    <div className="upload-div">
                                        <div className="selected-file-name">
                                            {profilePicture.name}
                                        </div>
                                        <button className="selected-file-upload-button" onClick={editProfile}>Update</button>
                                    </div>
                                ) : ( <></> )
                            }
                        </div>
                    )
                )
            }
        </div>
    )
}

export default AdminProfile