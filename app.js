require("dotenv").config()

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")

const Blog = require('./models/blog')

const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const { checkForAuthenticationCookie } = require("./middleware/authentication")

const app = express()
const PORT = process.env.PORT 

mongoose.connect(process.env.MONGO_URL).then((e)=>console.log("mongodb connected"))

// Body parsers so POST data is available on req.body
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// cookieParser must be invoked to return the middleware function
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

app.get('/',async(req,res)=>{
    const allBlogs = await Blog.find({})
    res.render('home',{
        user: req.user,
        blogs: allBlogs
    })
})

// convenience redirect: /signup -> /user/signup (route is mounted under /user)
app.get('/signup', (req, res) => {
    return res.redirect('/user/signup')
})

app.use('/user',userRoute)
app.use('/blog',blogRoute)

app.listen(PORT,()=>console.log(`Server started at PORT ${PORT}`))