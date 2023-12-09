import React, { useEffect, useState } from 'react'
import '../css/signup.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase/firebase'
import { toast } from 'react-toastify';

function Signup() {

	const history = useNavigate();

	const [loader, setLoader] = useState(false);

	const [otpDiv, setOtpDiv] = useState(false);

	const [phoneOTPResult, setPhoneOTPResult] = useState();
	const [captchaVerifier, setCaptchaVerifier] = useState();

	const [pincode, setPincode] = useState('');
	const [district, setDistrict] = useState('');
	const [state, setState] = useState('');

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [conPassword, setConPassword] = useState('');

	const [otp, setOtp] = useState('');

	const [nameValid, setNameValid] = useState('*');
	const [emailValid, setEmailValid] = useState('*');
	const [phoneValid, setPhoneValid] = useState('*');
	const [pincodeValid, setPincodeValid] = useState('*');
	const [passwordValid, setPasswordValid] = useState('*');
	const [conPasswordValid, setConPasswordValid] = useState('*');

	useEffect(() => {
		const setCaptcha = async () => {
			// set captcha vefifier if not already set
			if(!captchaVerifier) {
				const verifier = await new RecaptchaVerifier(auth, 'captcha', { size: "invisible" });
				setCaptchaVerifier(verifier);
			}
		}
		setCaptcha();
	},[captchaVerifier])

	// handle change of pincode field
	const onPincodeChange = (e) => {
		const value = e.target.value;
		setPincode(value);
		if(value.length === 6) {
			setLoader(true);
			// call api when pincode is having 6 digits
			axios.get(`https://api.postalpincode.in/pincode/${value}`)
			.then((res) => {
				// pincode data found
				if(res.data[0].Status === 'Success') {
					setPincodeValid('*');
					
					// set data to district , state field
					setDistrict(res.data[0].PostOffice[0].District);
					setState(res.data[0].PostOffice[0].State);
				}
				// no data found
				else {
					setPincodeValid('Pincode not found ..!')
					setDistrict('');
					setState('');
				}
				setLoader(false);
			}).catch((err) => {
				setLoader(false);
				console.log(err);
			});
		}
	}

	// handle submit button
	const submitData = async () => {
		setLoader(true);
		// validate pincode data
		if(pincode.length !== 6 && pincodeValid === '*') 
			setPincodeValid('Invalid !');

		// call api for validation
		axios.post('/register', { name, email, phone, district, state, pincode, password, conPassword, phoneOtp: false }).then( async (res) => {
			setNameValid(res.data.name);
			setEmailValid(res.data.email);
			setPhoneValid(res.data.phone);

			// validate pincode
			if(pincodeValid === '*') setPincodeValid(res.data.pincode);

			setPasswordValid(res.data.password);
			setConPasswordValid(res.data.conPassword);

			setLoader(false);

			// check if all fields are valid
			if(res.data.name === '*' && res.data.phone === '*' && res.data.email === '*' && pincodeValid === '*' && res.data.conPassword === '*') {
				setLoader(true);

				if(!captchaVerifier) {
					const verifier = await new RecaptchaVerifier(auth, 'captcha', { size: "invisible" });
					setCaptchaVerifier(verifier);
				}
				// send OTP to phone
				signInWithPhoneNumber(auth, `+91${phone}`, captchaVerifier).then((result) => {
					// save otp result data
					setPhoneOTPResult(result);
					setOtpDiv(true);
					setLoader(false);
				}).catch((err) => {
					toast.error('Something went wrong', {
						autoClose: 2000,
						pauseOnHover: false
					});
					setLoader(false);
					console.log(err);
				})

			}
		}).catch((err) => {
			console.log(err);
			setLoader(false);
		})
	}

	// submit phone OTP
	const onOTPSubmit = () => {
		setLoader(true);

		// check entered OTP
		phoneOTPResult.confirm(otp).then(() => {

			// call API to add new document
			axios.post('/register', { name, email, phone, district, state, pincode, password, conPassword, phoneOtp: true }).then((res) => {
				if(res.data.status) {
					toast.success('Signup succesfull', {
						autoClose: 2000,
						pauseOnHover: false
					})
					setLoader(false);
					setOtpDiv(false);
					history('/login')
				}
				else {
					// if phone number already exists
					if(res.data.duplicate) {
						toast.error('Phone already exixts', {
							autoClose: 2000,
							pauseOnHover: false
						})
					}
					else {
						toast.error('Registration failed', {
							autoClose: 2000,
							pauseOnHover: false
						})
					}
					setLoader(false);
					setOtpDiv(false);
				}
			})

		}).catch((err) => {
			console.log(err);
			toast.error('Verification failed', {
				autoClose: 2000,
				pauseOnHover: false
			})
			setOtpDiv(false);
			setLoader(false);
		})
	}

	return (
		<div className='new-signup-main'>
			 <div className={ loader ? 'loader-visible' : 'loader-invisible'}>
                <div className="spinner">
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                    <div className="white"></div>
                </div>
            </div>
			{
				(otpDiv) ? (
					<div className="new-otp-div"> {/* Otp check container */}
						<div className="new-otp-div-label">
							Enter the OTP sent to {phone}
						</div>
						<input
							type="text" 
							placeholder='X X X X' 
							onChange={ e => setOtp(e.target.value)}
						/>
						<div className="new-otp-submit-button-div">
							<button className='new-otp-submit-button' onClick={onOTPSubmit}>Submit</button>
						</div>
					</div>
				) : (
					<div className="new-signup-form"> {/* Signup form container */}
						<div className="new-signup-head">Signup Here</div>
						<div className="input-fields-row"> {/* First row */}
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Name</label>
									<span className='new-required-star'>{nameValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Name . . .' 
									value={name} 
									onChange={ e => setName(e.target.value)}
								/>
							</div>
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Email</label>
									<span className='new-required-star'>{emailValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Email . . .' 
									value={email} 
									onChange={ e => setEmail(e.target.value)}
								/>
							</div>
						</div>
						<div className="input-fields-row"> {/* Second row */}
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Phone</label>
									<span className='new-required-star'>{phoneValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Phone . . .' 
									value={phone} 
									onChange={ e => setPhone(e.target.value)}
								/>
							</div>
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Pincode</label>
									<span className='new-required-star'>{pincodeValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Pincode . . .' 
									onChange={onPincodeChange} 
									value={pincode}
								/>
							</div>
						</div>
						<div className="input-fields-row"> {/* Third row */}
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>District</label>
									<span className='new-required-star'>*</span>
								</div>
								<input 
									type="text" 
									placeholder='District . . .' 
									value={district} 
									readOnly
								/>
							</div>
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>State</label>
									<span className='new-required-star'>*</span>
								</div>
								<input 
									type="text" 
									placeholder='State . . .' 
									value={state}
									readOnly
								/>
							</div>
						</div>
						<div className="input-fields-row"> {/* Fourth row */}
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Password</label>
									<span className='new-required-star'>{passwordValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Password . . .' 
									value={password} 
									onChange={ e => setPassword(e.target.value)}
								/>
							</div>
							<div className="new-signup-field-div">
								<div className='new-required-div'>
									<label className='new-signup-labels'>Confirm password</label>
									<span className='new-required-star'>{conPasswordValid}</span>
								</div>
								<input 
									type="text" 
									placeholder='Confirm password . . .' 
									value={conPassword} 
									onChange={ e => setConPassword(e.target.value)}
								/>
							</div>
						</div>
						<div className="new-submit-button-div">
							<button className='new-submit-button' onClick={submitData}>Submit</button>
						</div>
						
						<div className="register-button-div">
							Already have an account ? 
							<span className='login-signup-button' onClick={()=>{history('/login')}}>&nbsp;Login</span>
						</div>
					</div>
				)
			}
			
			<div id="captcha"></div>
		</div>
	)
}

export default Signup