const {Router} = require("express")
const multer = require("multer")
const path = require("path")
const Blog = require("../models/blog")
const Comment = require("../models/comment")
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", 
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({storage})

router.get("/add-new",(req,res)=>{
    return res.render("addBlog",{
        user: req.user
    })
})

router.get("/:id",async(req,res)=>{
    const blog = await Blog.findById(req.params.id).populate('createdBy')
    const comments = await Comment.find({blogId:req.params.id}).populate(
        "createdBy"
    )
    return res.render("blog",{
        user:req.user,
        blog,
        comments,
    })
})

router.post('/comment/:blogId',async(req,res)=>{
    await Comment.create({
        content: req.body.content,
        blogId:req.params.blogId,
        createdBy:req.user._id,
    }) 
    return res.redirect(`/blog/${req.params.blogId}`)
})

router.post("/", upload.single('coverImageURL'), async (req, res) => {
  try {
    const { title, body } = req.body;

    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file.path, 
    });

    return res.redirect("/");
  } catch (err) {
    console.error("Error uploading blog:", err);
    return res.status(500).send("Something went wrong!");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Check if the current user is the creator
    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this blog");
    }

    //Delete image from Cloudinary if it exists
    if (blog.coverImageURL) {
      const publicId = blog.coverImageURL
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0]; // Extract public ID from URL
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete blog
    await Blog.findByIdAndDelete(req.params.id);

    return res.redirect("/");
  } catch (err) {
    console.error("Error deleting blog:", err);
    return res.status(500).send("Something went wrong while deleting the blog");
  }
});





module.exports = router