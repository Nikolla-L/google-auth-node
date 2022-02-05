const cookieParser = require('cookie-parser');
const express = require('express');

const app = express();

//google auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 5000;



const checkAuthenicated = (req, res, next) => {
    let token = req.cookies['session-token']
    
    let user = {};

    const verify = async () => {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        })
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify().then(() => {
        req.user = user;
        next();
    }).catch(err => res.redirect('/login'))
}

//middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    let token = req.body.token;
    console.log(token)

    const verify = async () => {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        console.log(payload)
    }
    verify()
    .then(() => {
        res.cookie('session-token', token)
        res.send('success')
    })
    .catch(console.error);
})

app.get('/profile', checkAuthenicated, (req, res) => {
    let user = req.user;
    res.render('dashboard', {user})
})

app.get('/protectedroute', checkAuthenicated, (req, res) => {
    res.render('protectedroute.ejs')
})

app.get('/logout', (req, res) => {
    res.clearCookie('session-token')
    res.redirect('/login')
})

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})