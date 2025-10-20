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
console.log('Attempting to connect to MongoDB URL:', process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then((e)=>console.log("Mongodb connected"))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
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

app.get('/signup', (req, res) => {
    return res.redirect('/user/signup')
})

app.use('/user',userRoute)
app.use('/blog',blogRoute)

app.listen(PORT,()=>console.log(`Server started at PORT ${PORT}`))