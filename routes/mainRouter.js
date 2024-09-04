const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController")
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/" + "../public/uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const redirect = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

const adminredirect = (req, res, next) => {
  if (!req.session.admin) {
    res.redirect("/admin/login");
  } else {
    next();
  }
};


router.get("/login", controller.getLogin)

router.post("/login", controller.postLogin);

router.get("/home", redirect, controller.getHome);

router.get("/products", controller.getProducts);

router.post("/products", controller.postSearch);

router.get("/orders", controller.getOrders);

router.post("/orders", controller.postInsertOrder);

router.post("/finalize-order", controller.getFinalOrder);

router.post("/cancel-order", controller.postCancelOrder);

router.get("/logout", controller.userLogout);

router.get("/register", controller.getRegister);

router.post("/register", controller.postRegister);

router.get("/verify/:auth", controller.getVerify);

router.get("/forgot-password", controller.getForgot);

router.post("/forgot-password", controller.postForgot);

router.get("/new-password/:auth", controller.getNew);

router.post("/new-password/", controller.postNew);

router.get("/admin/", controller.getAdminLogin);

router.get("/admin/login", controller.getAdminLogin);

router.post("/admin/login", controller.postAdminLogin);

router.get("/admin/home", adminredirect, controller.getAdminHome);

router.post("/admin/home", controller.productDelete);

router.get("/admin/add-product", controller.getAddProduct);

router.post("/admin/add-product", upload.single("p_image"), controller.postAddProduct);

router.post("/admin/add-feature", controller.addFeature);

router.get("/edit-product/:id", controller.getEdit);

router.post("/admin/edit-product/:id", upload.single("p_image"), controller.updateProduct);

router.get("/admin/featured-products", controller.getFeatured);

router.post("/admin/featured-products", controller.delFeatured);

router.get("/admin/categories", controller.getCategories);

router.post("/admin/categories", controller.addCategories);

router.post("/admin/delete-category", controller.delCat);

router.get("/admin/client-orders", controller.getClientOrders);

router.post("/admin/approve-order", controller.approveOrder);

router.post("/admin/disapprove-order", controller.disapproveOrder);

router.get("/admin/client-users", controller.getClientUsers);

router.post("/admin/ban-user", controller.banUser);

router.post("/admin/undo-action", controller.undoAction);

router.get("/admin/logout", controller.getLogout);

module.exports = router;