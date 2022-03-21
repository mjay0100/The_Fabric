const express = require("express");
const router = express.Router();
const Fabric = require("../models/fabric");
const middleware = require("../middleware");
const multer = require("multer");
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

// add to utililities
let imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter });

let cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "mustaphajay",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// add to utililities

router.get("/fabrics", async (req, res) => {
  try {
    fabrics = await Fabric.find({});
    res.render("fabrics/fabrics", { fabrics: fabrics, page: "fabrics" });
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
  }
});

router.get("/fabrics/new", middleware.isLoggedIn, function (req, res) {
  res.render("fabrics/new");
});

//CREATE - add new fabric to DB
router.post(
  "/fabrics",
  middleware.isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    try {
      await cloudinary.v2.uploader.upload(req.file.path);
      result = await cloudinary.v2.uploader.upload(req.file.path);

      // add cloudinary url for the image to the fabric object under image property
      req.body.fabric.image = result.secure_url;
      // add image's public_id to fabric object
      req.body.fabric.imageId = result.public_id;
      // add author to fabric
      req.body.fabric.author = {
        id: req.user._id,
        username: req.user.username,
      };
      fabric = await Fabric.create(req.body.fabric);
      res.redirect("/fabrics/" + fabric.id);
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    }
  }
);

//shows more info about one fabric
router.get("/fabrics/:id", async function (req, res) {
  try {
    let id = req.params.id.trim();
    foundfabric = await Fabric.findById(id).populate("comments").exec();
    //render show template
    res.render("fabrics/show", { fabric: foundfabric });
  } catch (err) {
    req.flash("error", "fabric not found");
    res.redirect("back");
  }
});

//edit route
router.get("/fabrics/:id/edit", middleware.checkOwner, (req, res) => {
  let id = req.params.id.trim();
  Fabric.findById(id, (err, foundfabric) => {
    res.render("fabrics/edit", { fabric: foundfabric });
  });
});

//update route
router.put("/fabrics/:id", upload.single("image"), async function (req, res) {
  await Fabric.findById(req.params.id);
  fabric = await Fabric.findById(req.params.id);
  try {
    if (req.file) {
      await cloudinary.v2.uploader.destroy(fabric.imageId);
      let result = await cloudinary.v2.uploader.upload(req.file.path);
      fabric.imageId = result.public_id;
      fabric.image = result.secure_url;
    }
    fabric.name = req.body.name;
    fabric.cost = req.body.cost;
    fabric.description = req.body.description;
    await fabric.save();
    req.flash("success", "Successfully Updated!");
    res.redirect("/fabrics/" + fabric._id);
  } catch (err) {
    req.flash("error", err.message);
    console.log(err);
    return res.redirect("back");
  }
});
router.delete("/fabrics/:id", async (req, res) => {
  try {
    await Fabric.findById(req.params.id);
    fabric = await Fabric.findById(req.params.id);
    await cloudinary.v2.uploader.destroy(fabric.imageId);
    await fabric.remove();
    req.flash("success", "fabric deleted successfully!");
    res.redirect("/fabrics");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    return res.redirect("back");
  }
});

module.exports = router;
