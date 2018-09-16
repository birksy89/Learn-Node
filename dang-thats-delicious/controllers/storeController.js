const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", {
    title: "Add Store"
  });
};

exports.createStore = async (req, res) => {
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

exports.editStore = async (req, res) => {
  // 1 Get store from DB - Given the ID

  const store = await Store.findOne({
    _id: req.params.id
  });

  //res.json(store);
  // 2 Confirm they are the owner

  // 3 Render out the edit form so user can update

  //console.log(stores)
  res.render("editStore", {
    title: `Edit ${store.name}`,
    store: store
  });
};
exports.updateStore = async (req, res) => {
  // 1 Get store from DB - Given the ID

  const store = await Store.findOneAndUpdate(
    {
      _id: req.params.id
    },
    req.body,
    {
      new: true, //return the new store, instead of the old one
      runValidators:true //force model to run the "required" validators
    }
  ).exec();

  req.flash('success', `Updated ${store.name}`);

  // redirect them to the store and tell them it worked
res.redirect(`/stores/${store._id}/edit`);


};
