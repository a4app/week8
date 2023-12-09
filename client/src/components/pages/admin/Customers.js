import React, { useEffect, useState } from 'react';
import '../../css/admin/customers.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Customers() {

    const [loader, setLoader] = useState(true);

    const [tableData, setTableData] = useState([]);
    const [filterData, setFilterData] = useState([]);

    const location = useLocation();
	const  id  = location.state;

    const history = useNavigate();

    useEffect(() => {
        axios.get('/auth').then((res) => {
            // check session data
            if(res.data.auth === 'admin' && res.data.id === id) {
                // get customers data
                axios.get('/customers').then((res) => {
                    setTableData(res.data);
                    setFilterData(res.data);
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

    const onFilterChange = (option) => {
        if(option === 'z2a') {
            const sortedData = [...tableData].sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
            setFilterData(sortedData);
        }
        else if(option === 'a2z') {
            const sortedData = [...tableData].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            setFilterData(sortedData);
        }
        else {
            setFilterData(tableData);
        }
    }

    return (
        <div className='customers-page-main'>
            <div className="customers-page-top-nav-bar">
                <div className="customers-nav-bar-options">
                    <input type="text" className='search-bar' placeholder='Search . . .' onChange={onSearchChange}/>
                    <div className="filter">
                        <label className="sort-customers-label">Sort : </label>
                        <select className='admin-customers-filter-drop-down' onChange={ e => onFilterChange(e.target.value)} >
                            <option value="sort">Default</option>
                            <option value="a2z">A - Z</option>
                            <option value="z2a">Z - A</option>
                        </select>
                    </div>
                </div>
                <button className="customer-page-back-button" onClick={()=>{history(`/admin/profile`, {state: id})}}>Back</button>
            </div>
            {
                (loader) ? (
                    <div className="loader">
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                        <div className="white"></div>
                    </div>
                ) : (
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>District</th>
                                <th>State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filterData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{textAlign: 'center'}}> No data ! </td>
                                    </tr>
                                ) : (
                                    filterData.map((value) => {
                                        return <tr key={value._id}>
                                            <td> { value.name } </td>
                                            <td> { value.phone } </td>
                                            <td> { value.district } </td>
                                            <td> { value.state } </td>
                                        </tr>
                                    })
                                )
                                
                            }
                        </tbody>
                    </table>
                )
            }
            </div>
        )
}

export default Customers