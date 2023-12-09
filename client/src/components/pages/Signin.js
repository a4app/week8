import React, {useState} from 'react'
import '../css/login.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const Signin = () => {

	const history = useNavigate();

	const [usernameError, setUsernameError] = useState('');
	const [buttonErrorMessage, setButtonError] = useState('incorrect username or password');
	const [passwordError, setPasswordError] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [buttonState, changeButton] = useState(1)

	const onSubmit = () => {
		changeButton(2);
		axios.post('/signin', {username, password}).then((res) => {
			const out = res.data;
			if(out.status) {
				changeButton(1);
				history(`/admin/profile`, {state: out.id});
			}
			else {
				if(out.pass && out.username) {
					setPasswordError('');
					setUsernameError('');
					setButtonError("incorrect username or password");
					changeButton(3);
				}
				else {
					if(out.pass) setPasswordError('');
					else setPasswordError('! required');

					if(out.username) setUsernameError('');
					else setUsernameError('! required');
					changeButton(1);
				}

			}
			if(out.error) {
				if(out.pass) setPasswordError('');
				else setPasswordError('! required');

				if(out.username) setUsernameError('');
				else setUsernameError('! required');
				changeButton(1);
				console.log(out.error);
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
			<button className="signin-button" onClick={()=>{history('/login')}}>Login</button>
			<div className="login-form">
				<div className="login-head">Signin Here</div>
				<div className="field-div">
					<div className='required-div'>
						<label className='login-labels'>Username</label>
						<span className='required'>{usernameError}</span>
					</div>
					<input type="text" placeholder="Username" onChange={(e)=>{setUsername(e.target.value);changeButton(1)}} />
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
						<button type='submit' className='login-button' onClick={onSubmit}>Sign In</button> 
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
			</div>
		</div>
	)
};

export default Signin;
