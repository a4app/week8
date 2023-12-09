const express = require('express');
const session = require('express-session');
const Models = require(__dirname + '/mongo_db/models.js');
const connectDB = require(__dirname + '/mongo_db/db_connect.js');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();

const UserModel = Models.user;
const AdminModel = Models.admins;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// configure session
app.use(
    session({
        secret: 'secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        }
    })
);

app.use(adminRoutes);
app.use(userRoutes);

// connect to mongodb
connectDB();

// app.get('/connect', async (req, res) => {
//     const connection = await connectDB();
//     connection ? res.send(true) :  res.send(false);
// })

// handle user login form
app.post('/login', async (req, res) => {
    const out = {status: false, phone: true, pass: true, error: false, id: ''}
    const { phone, password } = req.body;

    // validate two fields
    if( phone === '' || password === '') {
        if(password === '') {
            out.pass = false;
        }
        if(phone === '') {
            out.phone = false;
        }
        return res.json(out);
    }
    else {
        try {
            // get corresponding document
            const data = await UserModel.findOne({phone: phone, password: password});

            // check if user exists
            if(data) {
                out.status = true;
                out.id = data.id;

                // set session values for user
                req.session.login = { auth: 'user', id: data.id, username: data.name };

                return res.json(out);
            }
            else {
                return res.json(out);
            }
        }
        catch(err) {
            console.log(err);
            out.error = true;
            setTimeout(()=>{return res.json(out);},1000)
        }
    }
})

// handle admin login
app.post('/signin', async (req, res) => {
    const out = {status: false, username: true, pass: true, error: false, id: ''}
    const { username, password } = req.body;

    // validate fields
    if( username === '' || password === '') {
        if(password === '') {
            out.pass = false;
        }
        if(username === '') {
            out.username = false;
        }
        return res.json(out);
    }
    else {
        try {
            // get corresponding document of admin
            const data = await AdminModel.findOne({username: username, password: password});

            // check if exists
            if(data) {
                out.status = true;
                out.id = data.id;
                
                // set admin data in session
                req.session.login = { auth: 'admin', id: data.id, username: data.username, image: data.image }
                
                return res.json(out);
            }
            else {
                return res.json(out);
            }
        }
        catch(err) {
            console.log(err);
            out.error = true;
            setTimeout(()=>{return res.json(out);},1000)
        }
    }
})

// handle user signup
app.post('/register', async (req, res) => {

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const out = { name: '*', email: '*', phone: '*', pincode: '*', password: '*', conPassword: '*' }
    const { name, email, phone, district, state, pincode, password, conPassword, phoneOtp } = req.body;

    if(phoneOtp) {
        try {
            // add new userdata
            const newUser = new UserModel({ 
                name: name, 
                email: email, 
                phone: phone, 
                district: district, 
                state: state, 
                pincode: pincode, 
                password: password 
            })
            await newUser.save()
            res.json({status: true, duplicate: false});
        }
        catch(err) {
            // check if duplicate field exixts
            if(err.code === 11000) {
                res.json({status: false, duplicate: true});
            }
            else {
                res.json({status: false, duplicate: false});
            }
        }
    }
    else {
        if(name.trim() === '') out.name = 'required *';

        if(email.trim() === '') out.email = 'required *';
        else if(!emailRegex.test(email)) out.email = 'invalid email !';

        if(phone.trim() === '') out.phone = 'required *';
        else if(phone.length !== 10 || isNaN(phone)) out.phone = 'invalid !';

        if(pincode.trim() === '') out.pincode = 'required *';
        else if(pincode.length !== 6) out.pincode = 'invalid !';

        if(password.trim() === '') out.password = 'required *';

        if(password !== '' && password !== conPassword) out.conPassword = 'not matching !'
        else if(conPassword.trim() === '') out.conPassword = 'required *';

        return res.send(out)
    }
})

// get session data
app.get('/auth', (req, res) => {
    const logged = req.session.login;
    return res.send(logged);
})

// destroy session data
app.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.send(true);
    }
    catch(err) {
        console.log(err);
        res.sendStatus(false);
    }
})





app.listen(5500, () => {
    console.log('server is started');
});