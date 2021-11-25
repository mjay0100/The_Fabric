var middlewareObj ={};
var Fabric = require("../models/fabric")
var Comment = require("../models/comment")


middlewareObj.checkOwner = function checkOwner (req, res, next){
    if(req.isAuthenticated()){
        var id = (req.params.id).trim()
        Fabric.findById(id, (err, foundfabric)=>{
        if(err || !foundfabric){
            req.flash("error", "fabric not found")
            res.redirect("/fabrics")
        } else{
            //does user own a fabric
            if(foundfabric.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else{
                req.flash("error", "You cant do that")
                res.redirect("back")
            }
        }
    });
} else {
    req.flash('error', 'You need to be Logged in to do that!')
    res.redirect("back")
    }
}

middlewareObj.checkCommentOwner = function checkCommentOwner (req, res, next){
    if(req.isAuthenticated()){
        var id = (req.params.comment_id).trim()
        Comment.findById(id, (err, foundcomment)=>{
        if(err || !foundcomment){
            req.flash("error", "Comment not found")
            res.redirect("back")
        } else{
            //does user own a fabric comment
            if(foundcomment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else{
                req.flash('error', "You don't have permission to do that!")
                res.redirect("back")
            }
        }
    });
} else {
    req.flash('error', 'You need to be Logged in to do that!')
    res.redirect("back")
    }
}

//MiddleWare
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }   
    req.flash('error', 'You need to be Logged in to do that!')
    res.redirect("/login")
}




module.exports = middlewareObj