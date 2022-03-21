const express = require("express");
const router = express.Router({ mergeParams: true });
const Fabric = require("../models/fabric");
const Comment = require("../models/comment");
const middleware = require("../middleware");

router.get(
  "/fabrics/:id/comments/new",
  middleware.isLoggedIn,
  async (req, res) => {
    try {
      id = req.params.id.trim();
      fabric = await Fabric.findById(id);
      res.render("comments/new", { fabric: fabric });
    } catch (err) {
      console.log(err);
      req.flash("error", "Fabric not found");
      res.redirect("back");
    }
  }
);

router.post(
  "/fabrics/:id/comments",
  middleware.isLoggedIn,
  async (req, res) => {
    try {
      id = req.params.id.trim();
      fabric = await Fabric.findById(id);
      comment = await Comment.create(req.body.comment);
      comment.author.id = req.user._id;
      comment.author.username = req.user.username;
      await comment.save();
      fabric.comments.push(comment);
      await fabric.save();
      res.redirect("/fabrics/" + fabric._id);
    } catch (err) {
      console.log(err);
      res.redirect("back");
    }
  }
);

//edit comment route
router.get(
  "/fabrics/:id/comments/:comment_id/edit",
  middleware.checkCommentOwner,
  async (req, res) => {
    try {
      foundfabric = Fabric.findById(req.params.id);
      foundcomment = await Comment.findById(req.params.comment_id);
      res.render("comments/edit", {
        fabric_id: req.params.id,
        comment: foundcomment,
      });
    } catch (err) {
      req.flash("error", "Fabric not found");
    }
  }
);

//comment update
router.put(
  "/fabrics/:id/comments/:comment_id",
  middleware.checkCommentOwner,
  async (req, res) => {
    try {
      updatedcomment = await Comment.findByIdAndUpdate(
        req.params.comment_id,
        req.body.comment
      );
      res.redirect("/fabrics/" + req.params.id);
    } catch (err) {
      req.flash("error", "Comment not found");
      res.redirect("back");
    }
  }
);

//delete comment
router.delete(
  "/fabrics/:id/comments/:comment_id",
  middleware.checkCommentOwner,
  async (req, res) => {
    try {
      await Comment.findByIdAndRemove(req.params.comment_id);
      req.flash("success", "Comment deleted");
      res.redirect("/fabrics/" + req.params.id);
    } catch (err) {
      res.redirect("back");
    }
  }
);

module.exports = router;
