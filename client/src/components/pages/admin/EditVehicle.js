import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/admin/add_vehicle.css';
import { toast } from 'react-toastify';

function EditVehicle() {

	const history = useNavigate();

    const location  = useLocation();
    const id = location.state.id;
    const data = location.state.data;

    const v_id = data._id;
    const argname = data.name;
    const argdesc = data.desc;
    const argprice = data.price;
    const argquantity = data.quantity;

    const [loader, setLoader] = useState(false);

    const [nameErrorMsg, setNameErrorMsg] = useState('');
	const [descErrorMsg, setDescErrorMsg] = useState('');
	const [priceErrorMsg, setPriceErrorMsg] = useState('');
	const [quantityErrorMsg, setQuantityErrorMsg] = useState('');
	const [imageErrorMsg, setImageErrorMsg] = useState('');

	const [name, setName] = useState(argname);
	const [desc, setDesc] = useState(argdesc);
	const [price, setPrice] = useState(argprice);
	const [quantity, setQuantity] = useState(argquantity);
	const [image, setImage] = useState();

    useEffect(()=>{
        axios.get('/auth').then((res) => {
            // check session data
            if(!(res.data.auth === 'admin' && res.data.id === id)) {
                history('/signin')
            }
        })
    },[id, history])

    // handle update button click
    const updateVehicleButton = () => {
        setLoader(true);
        const formData = new FormData();
        formData.append('id', v_id);
        formData.append('name', name);
        formData.append('desc', desc);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('image', image);

        axios.post('/update-vehicle', formData ).then((res) => {
            const data = res.data;

            // if any field is invalid
            if(data.n || data.d || data.p || data.q || data.i) {
                // set error messages
                setNameErrorMsg(data.n);
                setDescErrorMsg(data.d);
                setPriceErrorMsg(data.p);
                setQuantityErrorMsg(data.q);
                setImageErrorMsg(data.i);
            }
            // error case
            else if(data.error) {
                toast.error('Error occured', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            // succesfull updation
            else if(data.status) {
                history('/admin/vehicles', {state: id});
            }
            // failed updation
            else {
                toast.error('Updation failed', {
                    autoClose: 2000,
                    pauseOnHover: false
                });
            }
            setLoader(false);
		}).catch((err) => {
            
            setLoader(false);
			console.log(err);
			toast.error('Something went wrong', {
                autoClose: 2000,
                pauseOnHover: false
            });
		});
    }

	return (
		<div className='add-vehicle-main'>
			{
                (loader) ? (
                    <div className="loader">
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                    </div>
                ) : (
                    <div className="add-vehicle-form">
                        <button className="admin-edit-add-vehicle-back-button" onClick={()=>{history(`/admin/vehicles`, {state: id})}}>Back</button>
                        <div className="add-vehicle-head">Edit Vehicle</div>
                        <div className="add-vehicle-field-div"> {/* Name */}
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
                        <div className="add-vehicle-field-div"> {/* Description */}
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
                        <div className="add-vehicle-field-div"> {/* Price */}
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
                        <div className="add-vehicle-field-div"> {/* Quantity */}
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
                        <div className="add-vehicle-field-div"> {/* Image */}
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
                        <div className="next-button-div"> {/* Update button container */}
                            <button className="add-vehicle-button" onClick={updateVehicleButton} >
                                Update
                            </button>
                        </div>
                    </div>
                )
            }
		</div>
	)
}

export default EditVehicle