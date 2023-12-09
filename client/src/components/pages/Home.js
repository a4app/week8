import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/home.css'
import '../css/loader.css'
import axios from 'axios';

function Home() {

    const history = useNavigate();
    
    useEffect(() => {
        axios.get('/auth').then((res) => {
            if(res.data) {
                if(res.data.auth === 'user') {
                    setTimeout( () => { history(`/user/${res.data.id}`) }, 1000)
                }
                else if(res.data.auth === 'admin') {
                    setTimeout( () => { history('/admin/profile', {state: res.data.id}) }, 1000)
                }
                else {
                    setTimeout( () => { history('/login') }, 200)
                }
            } else {
                setTimeout( () => { history('/login') }, 200)
            }
        })
        // connectDatabase();
    }, [history]);

    return (
        <div className='home-main'>
            <div className="loader">
                <div className='white'></div>
                <div className='white'></div>
                <div className='white'></div>
                <div className='white'></div>
            </div>
        </div>
    )
}

export default Home