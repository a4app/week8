import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin/add_vehicle.css'

function AddVehicle() {

	const history = useNavigate();

    const location  = useLocation();
    const adminID = location.state;

    const [loader, setLoader] = useState(false);

	const [name, setName] = useState('');
	const [desc, setDesc] = useState('');
	const [price, setPrice] = useState('');
	const [quantity, setQuantity] = useState('');
	const [image, setImage] = useState('');

	const [nameErrorMsg, setNameErrorMsg] = useState('');
	const [descErrorMsg, setDescErrorMsg] = useState('');
	const [priceErrorMsg, setPriceErrorMsg] = useState('');
	const [quantityErrorMsg, setQuantityErrorMsg] = useState('');
	const [imageErrorMsg, setImageErrorMsg] = useState('');

    useEffect(() => {
        // check session for authentication
        axios.get('/auth').then((res) => {
            if(!(res.data.auth === 'admin' && res.data.id === adminID)) {
                history('/signin')
            }
        })
        
    },[adminID, history])
    // button click to add new vehicle
    const addVehicleButton = () => {
        setLoader(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('name', name.trim());
        formData.append('desc', desc.trim());
        formData.append('price', price.trim());
        formData.append('quantity', quantity.trim());

        // API to add data
        axios.post('/add-vehicle', formData )
		.then((res) => {
			const data = res.data;
            
            // check if any field in invalid
            if(data.n || data.d || data.p || data.q || data.i) {
                setLoader(false)
                setNameErrorMsg(data.n);
                setDescErrorMsg(data.d);
                setPriceErrorMsg(data.p);
                setQuantityErrorMsg(data.q);
                setImageErrorMsg(data.i);
            }
            // check for error flag
            else if(data.error) {
                setLoader(false)
                toast.error('Error occured', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            // condition for success
            else if(data.status) {
                setLoader(false);
                toast.success('Vehicle added', {
                    autoClose: 1000,
                    pauseOnHover: false
                });
                history('/admin/vehicles', {state: adminID});
            }
		}).catch((err) => {
			console.log(err);
            setLoader(false)
			toast.error('Something went wrong', {
                autoClose: 2000,
                pauseOnHover: false
            });
		});
    }

	return (
		<div className='add-vehicle-main'> {/* Main full screen */}
			{
                (!loader) ? (
                    <div className="add-vehicle-form"> {/* Form div */}
                    <button className="admin-edit-add-vehicle-back-button" onClick={()=>{history(`/admin/vehicles`, {state: adminID})}}>Back</button>
                        <div className="add-vehicle-head">Add Vehicle</div>
                        <div className="add-vehicle-field-div"> {/* div with label, error message, input field */}
                            <div className='required-div'>
                                <label className='add-vehicle-labels'>Name</label>
                                <span className='required-star'> {nameErrorMsg} </span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Name . . ." 
                                value={name} 
                                onChange={(e)=>{ setName(e.target.value) }} 
                                autoFocus={true}
                            />
                        </div>
                        <div className="add-vehicle-field-div"> {/* div with label, error message, input field */}
                            <div className='required-div'>
                                <label className='add-vehicle-labels'>Description</label>
                                <span className='required-star'> {descErrorMsg} </span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Description . . ." 
                                onChange={(e)=>{ setDesc(e.target.value) }} 
                                value={desc} 
                            />
                        </div>
                        <div className="add-vehicle-field-div"> {/* div with label, error message, input field */}
                            <div className='required-div'>
                                <label className='add-vehicle-labels'>Price</label>
                                <span className='required-star'> {priceErrorMsg} </span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Price . . ."  
                                onChange={(e)=>{ setPrice(e.target.value) }} 
                                value={price} 
                            />
                        </div>
                        <div className="add-vehicle-field-div"> {/* div with label, error message, input field */}
                            <div className='required-div'>
                                <label className='add-vehicle-labels'>Quantity</label>
                                <span className='required-star'> {quantityErrorMsg} </span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Quantity . . ." 
                                onChange={(e)=>{ setQuantity(e.target.value) }} 
                                value={quantity} 
                            />
                        </div>
                        <div className="add-vehicle-field-div"> {/* div with label, error message, input field */}
                            <div className='required-div'>
                                <label className='add-vehicle-labels'>Image</label>
                                <span className='required-star'> {imageErrorMsg} </span>
                            </div>
                            <input 
                                type="file" 
                                accept='image/*'
                                onChange={(e)=>{ setImage(e.target.files[0]) }}
                                name='image'
                            />
                        </div>
                        <div className="next-button-div"> {/* Submit button */}
                            <button className="add-vehicle-button" onClick={addVehicleButton} >Add</button>
                        </div>
                    </div>
                ) : (
                    <div className="loader"> {/* loader element */}
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                    </div>
                )
            }
		</div>
	)
}

export default AddVehicle