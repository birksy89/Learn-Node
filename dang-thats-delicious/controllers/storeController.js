const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next(
        {
          message: "That file type isnt allowed"
        },
        false
      );
    }
  }
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next(); //skip to the next middleware
    return;
  }
  const extention = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extention}`;
  //Now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //Once we have written the photo to file system - Keep going!
  next();
};

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", {
    title: "Add Store"
  });
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;

  const store = await new Store(req.body).save();
  //console.log("It worked");
  req.flash(
    "success",
    `Sucessfully Created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1 Get stores from DB
  const stores = await Store.find();
  //console.log(stores)
  res.render("stores", {
    title: "Stores",
    stores: stores
  });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error("You Must own the store in order to edit it!");
  }
};

exports.editStore = async (req, res) => {
  // 1 Get store from DB - Given the ID

  const store = await Store.findOne({
    _id: req.params.id
  });

  //res.json(store);
  // 2 Confirm they are the owner
  confirmOwner(store, req.user);

  // 3 Render out the edit form so user can update

  //console.log(stores)
  res.render("editStore", {
    title: `Edit ${store.name}`,
    store: store
  });
};
exports.updateStore = async (req, res) => {
  //set the location data to be a point
  req.body.location.type = "Point";

  // 1 Get store from DB - Given the ID

  const store = await Store.findOneAndUpdate(
    {
      _id: req.params.id
    },
    req.body,
    {
      new: true, //return the new store, instead of the old one
      runValidators: true //force model to run the "required" validators
    }
  ).exec();

  req.flash("success", `Updated ${store.name}`);

  // redirect them to the store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
};

//Detail View

exports.getStoreBySlug = async (req, res, next) => {
  // 1 Get store from DB - Given the slug

  const store = await Store.findOne({
    slug: req.params.slug
  }).populate("author");

  //If the DB response is null - call next!!! - Move along the middleware
  if (!store) {
    return next();
  }

  //Check what's coming through is right
  //res.json(store);
  //console.log(store)

  // 3 Render out the detail view

  res.render("store", {
    title: `${store.name}`,
    store: store
  });
};

exports.getStoresByTag = async (req, res, next) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  //res.json(tags);
  //res.json(stores);

  res.render("tag", {
    tags: tags,
    tag: tag,
    title: "Tags",
    stores: stores
  });
};

exports.searchStores = async (req, res, next)=>{
  res.json(req.query)
}
