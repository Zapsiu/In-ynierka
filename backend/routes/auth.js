const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // teraz zadziała

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profil", authController.getProfile);

module.exports = router;
