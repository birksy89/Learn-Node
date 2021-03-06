const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
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
  const page = req.params.page || 1;
  const limit = 3;
  const skip = page * limit - limit;

  // 1 Get stores from DB
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({created:'desc'})

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if(!stores.length && skip){
    req.flash('info', `Hey, you asked for page ${page} - But that doesn't exist... So I put you on page ${pages}`)

    res.redirect(`/stores/page/${pages}`)

    return;
  }

  //console.log(stores)
  res.render("stores", {
    title: "Stores",
    stores,
    page,
    pages,
    count
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
  }).populate("author reviews");

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

exports.searchStores = async (req, res, next) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      store: { $meta: "textScore" }
    }
  )
    .sort({
      store: { $meta: "textScore" }
    })
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  //res.json(coordinates)

  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };
  const stores = await Store.find(q)
    .select("slug name description location photo")
    .limit(10);
  res.json(stores);
};

exports.mapPage = async (req, res) => {
  res.render("map", {
    title: "Map"
  });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => {
    return obj.toString();
  });

  //Will the heart be added or removed?
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id }
    },
    { new: true }
  );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  //My way - Populating extra field "Hearts"
  const user = await User.findById(req.user._id).populate("hearts");
  const heartedStores = user.hearts;

  //Alternative Method - Wes does this in Lesson 36
  const heartedStores2 = await Store.find({
    _id: { $in: req.user.hearts }
  });

  //console.log(heartedStores);
  //console.log(heartedStores2);

  res.render("stores", {
    title: "Hearted Stores",
    stores: heartedStores
  });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();

  //res.json(stores)

  res.render("topStores", {
    title: "Top Stores",
    stores: stores
  });
};
