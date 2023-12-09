import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../css/admin/vehicles.css'
import axios from 'axios';
import { toast } from 'react-toastify';

const Vehicles = () => {

	const history = useNavigate();

	const location = useLocation();
	const  id  = location.state;

	const [tableData, setTableData] = useState([]);
	const [filterData, setFilterData] = useState([]);

	const [loader, setLoader] = useState(true);

	// get vehicles data
	const getVehiclesData = () => {
		setLoader(true);
		axios.get('/vehicles')
		.then((res) => {
			setTableData(res.data);
			setFilterData(res.data);
			setTimeout(()=>{setLoader(false);}, 100)
		}).catch((err) => {
			console.log(err);
			setTableData([]);
			setLoader(false);
		});
	}

	useEffect(() => {
		axios.get('/auth').then((res) => {
			// check session for authentication
            if(res.data.auth === 'admin' && res.data.id === id) {
                getVehiclesData();
				onSortChange('asc');
            }
            else {
                history('/signin')
            }
        })
	},[id, history])

	// delete a vehicle
	const deleteData = (id) => {
		axios.post('/delete-vehicle', { id })
		.then((res) => {
			// succesfull deletion
			if(res.data.status) {
				// remove deleted document from vehicles table manually without fetching again from database
				setTableData(tableData.filter(vehicle => vehicle._id !== id));
				setFilterData(tableData);
				// getVehiclesData();
			}
			else {
				// if any error
				if(res.data.error)
					toast.error('Something went wrong', {
						autoClose: 2000,
						pauseOnHover: false
					})
				else
					toast.error('Operation failed', {
						autoClose: 2000,
						pauseOnHover: false
					})
			}
		}).catch((err) => {
			console.log(err);
			toast.error('Error occured', {
				autoClose: 2000,
				pauseOnHover: false
			})
		});
	}

	// convert buffer to base64string
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

	return (
		<div className="admin-page-main">
			<div className="top-nav-bar">
				<input type="text" className='search-bar' placeholder='Search . . .' onChange={onSearchChange}/>
				<button className="new-logout-button" onClick={()=>{history(`/admin/profile`, {state: id})}}>Back</button>
			</div>
			<div className="sort-div">
				<select className="sorting-dropdown" onChange={ e => onSortChange(e.target.value)} >
					<option value='asc'>Price low to high</option>
					<option value='desc'>Price high to low</option>
				</select>
			</div>
			{
				(loader) ? (
					<div className="loader admin-loader">
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
					</div>
				) : (
					<div className="admin-page-body">
					{
						(filterData.length !== 0) ? (
							filterData.map( (v) => {
								const base64String = arrayBufferToBase64(v.image.data.data);
								return <div className="vehicle-tile" key={v._id}>
									<img className='vehicle-img' src={`data:${v.image.contentType};base64,${base64String}`} alt='vehicle' />
									<div className="vehicle-name"> {v.name} </div>
									<div className="vehicle-price"> ₹{v.price} </div>
									<div className="vehicle-desc"> {v.desc} </div>
									<div className="vehicle-quantity"> {v.quantity} &nbsp; left</div>
									<img src="/delete.png" alt="delete" className='delete-vehicle-icon' onClick={ ()=>{deleteData(v._id)}} />
									<img 
										src="/edit.png" 
										alt="edit" 
										className='edit-vehicle-icon' 
										onClick={()=>{history(`/admin/edit-vehicle`, {state: {id: id, data: v}})}} 
									/> {/* profile edit button */}
								</div>
							})
						) : 
						
						// no vehicles data found
						(
							<div className="vehicle-tile no-data" key='not-found' style={{height: '223px'}}>
								No data found
							</div>
						)
					}
						{/* add new vehicle button */}
						<div className="vehicle-tile add-new-vehicle" onClick={() => {history('/admin/add-vehicle', {state: id})}} style={{minHeight: '223px'}} >
							<img src="/plus.jpg" alt="plus"/>
						</div>
					</div>
				)
			}
					
		</div>
	)
}

export default Vehicles;