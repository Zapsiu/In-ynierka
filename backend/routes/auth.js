const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/profil", authController.getProfile);

router.patch("/profil", authController.updateProfile);
router.post("/profil/change-password", authController.changePasswordProfile);

module.exports = router;
