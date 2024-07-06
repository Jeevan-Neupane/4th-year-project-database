const express = require('express');
var router = express.Router();
const Project = require('../models/project');
// const Comment = require('../models/comment');
const middleware = require('../middleware/index1');
const User = require("../models/user");
const { isNull } = require('url/util');

router.get('/', function (req, res) {
  Project.find({}, function (err, allProjects) {
    if (err) {
      console.log(err);
    }
    else {
      res.render('projects/index', { projects: allProjects })
    }
  })
})

router.get('/new', middleware.isLoggedIn, function (req, res) {
  res.render('projects/new')
})

//Add project
router.post('/', middleware.isLoggedIn, function (req, res) {
  var title = req.body.title
  var year = req.body.year
  var description = req.body.description
  var link = req.body.link
  var image = req.body.image
  var supervisor = req.body.supervisor
  // var authors = req.body.authors
  var namearray = [];
  var pending = req.body.member.length;
  req.body.member.forEach(Username => {
    User.findOne({ username: Username }, function (err, foundUser) {
      if (err || !foundUser) {
        // console.log("cant find user with username/rollno:", Username)
        pending--;
      } else {
        namearray.push(foundUser.user);
        // console.log("added user to project contributor: ", foundUser.user)
        // console.log("\n User object: ", foundUser)
        pending--;
      }
      if (pending == 0) {
        // console.log("array of name", namearray)
        var author = {
          id: req.user._id,
          username: req.body.member,
          user: namearray
        }
        // console.log("the pushed data ", author)
        var reviewStatus = false
        var abstract = req.body.abstract

        var newProject = { title: title, image: image, description: description, author: author, year: year, link: link, supervisor: supervisor, reviewStatus: reviewStatus, abstract: abstract }

        Project.create(newProject, function (err, newProj) {
          if (err) {
            // console.log("error", err);
          }
          else {
            res.redirect('/projects')
          }
        })
      }
    })
  });


})


//my project
router.get('/myprojects/:id', middleware.isLoggedIn, (req, res) => {
  try {
    Project.find({ "author.username": req.params.id }, function (err, allProjects) {
      if (err) {
        console.log(err);
      }
      else {
        res.render('projects/index', { projects: allProjects })
      }
    })

  } catch (error) {
    console.log(error);
  }
});



//search
router.get('/search', (req, res) => {
  try {
    Project.find({ $or: [{ title: { '$regex': new RegExp(req.query.dsearch, "i") } }, { supervisor: { '$regex': new RegExp(req.query.dsearch, "i") } }] }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render('projects/index', { projects: data });
      }
    })
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', function (req, res) {
  Project.findById(req.params.id).populate('comments').exec(function (err, foundGround) {
    if (err) {
      console.log("ERRORORORORO:", err);
    }
    else {
      res.render('projects/show', { project: foundGround })
    }
  })
})

// edit route
router.get('/:id/edit', middleware.checkProjectOwnership, function (req, res) {
  Project.findById(req.params.id, function (err, foundProject) {
    res.render("projects/edit", { project: foundProject })
  })
})

// Update Route
router.put("/:id", middleware.checkProjectOwnership, function (req, res) {
  console.log("\n")
  console.log("front to back data:", req.body.project.author);
  var namearray=[];
  pending = req.body.project.author[0].username.length
  req.body.project.author[0].username.forEach(Username => {
    User.findOne({ username: Username }, function (err, foundUser) {
      if (err || !foundUser) {
        // console.log("cant find user with username/rollno:", Username)
        pending--;
      } else {
        namearray.push(foundUser.user);
        // console.log("added user to project contributor: ", foundUser.user)
        // console.log("\n User object: ", foundUser)
        pending--;
      }
      if (pending == 0) {
        req.body.project.author[0].user = namearray;
        console.log("Updated author data:", req.body.project.author);
        Project.findByIdAndUpdate(req.params.id, req.body.project, function (err, updatedproject) {
          if (err) {
            res.redirect('/projects')
          }
          else {
            res.redirect('/projects/' + req.params.id)
          }
        })
      }
    })
  })
  


})


// DESTROY PROJECT ROUTE
router.delete('/:id', middleware.checkProjectOwnership, function (req, res) {
  Project.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      res.redirect('/projects/' + req.params.id)
    }
    console.log("deleted")
    res.redirect('/projects')
  })
})




module.exports = router