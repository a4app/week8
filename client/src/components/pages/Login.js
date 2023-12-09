import React, {useState} from 'react'
import '../css/login.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const Login = () => {

	const history = useNavigate();

	const [phoneError, setPhoneError] = useState('');
	const [buttonErrorMessage, setButtonError] = useState('incorrect username or password');
	const [passwordError, setPasswordError] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [buttonState, changeButton] = useState(1)

	const onSubmit = () => {
		changeButton(2);
		axios.post('/login', {phone, password}).then((res) => {
			const out = res.data;
			if(out.status) {
				changeButton(1);
				history(`/user/${out.id}`)
			}
			else {
				if(out.pass && out.phone) {
					setPasswordError('');
					setPhoneError('');
					setButtonError("incorrect number or password");
					changeButton(3);
				}
				else {
					if(out.pass) setPasswordError('');
					else setPasswordError('! required');

					if(out.phone) setPhoneError('');
					else setPhoneError('! required');
					changeButton(1);
				}
			}
			if(out.error) {
				if(out.pass) setPasswordError('');
				else setPasswordError('! required');

				if(out.phone) setPhoneError('');
				else setPhoneError('! required');
				changeButton(1);
				setButtonError('Error occured.. ! Try again');
				changeButton(3);
			}
		})
		.catch((error) => {
			setButtonError('error occured.. !');
			changeButton(3);
			console.error(error);
		});
	};

	return (
		<div className='login-main'>
			<button className="signin-button" onClick={()=>{history('/signin')}}>Signin</button>
			<div className="login-form">
				<div className="login-head">Login Here</div>
				<div className="field-div">
					<div className='required-div'>
						<label className='login-labels'>Phone</label>
						<span className='required'>{phoneError}</span>
					</div>
					<input type="text" placeholder="Phone" onChange={(e)=>{setPhone(e.target.value);changeButton(1)}} />
				</div>
				
				<div className="field-div">
					<div className='required-div'>
						<label className='login-labels'>Password</label>
						<span className='required'>{passwordError}</span>
					</div>
					<input type="password" placeholder="Password" onChange={(e)=>{setPassword(e.target.value);changeButton(1)}} />
				</div>
				{ 
					buttonState === 1 ? ( 
						<button type='submit' className='login-button' onClick={onSubmit}>Log In</button> 
					) :
					buttonState === 2 ? ( 
						<div className='loading'>
							<div className="loader">
								<div className='black'></div>
								<div className='black'></div>
								<div className='black'></div>
								<div className='black'></div>
							</div>
						</div>
					) :
					buttonState === 3 ? ( <button className='error' onClick={onSubmit}>{buttonErrorMessage}</button> ) :
					(<></>)
				}
				<div className="register-button-div">
					Don't have an account ? 
					<span className='login-signup-button' onClick={()=>{history('/signup')}}>&nbsp;Signup</span>
				</div>
			</div>
		</div>
	)
};

export default Login;
