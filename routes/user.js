const router = require("express").Router();
const {
  loginController,
  createTagController,
  getAllTagsController,
  deleteTag,
  updateTag,
  applyTag,
  removeTag,
  getAllUsers,
} = require("../controllers/user.controller");

router.get("/", getAllUsers);

router.post("/login", loginController);

router.post("/:userId/tags/create", createTagController);

router.get("/:userId/tags", getAllTagsController);

router.put("/:userId/tags/:tagId", updateTag);

router.get("/:userId/tags/:tagId/connection/:connectionId/apply", applyTag);

router.delete(
  "/:userId/tags/:tagId/connection/:connectionId/remove",
  removeTag
);

router.delete("/:userId/tags/:tagId", deleteTag);

module.exports = router;
