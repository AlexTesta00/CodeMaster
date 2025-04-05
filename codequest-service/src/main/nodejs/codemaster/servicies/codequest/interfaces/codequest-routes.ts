import { Router } from "express";
import Controller from "./codequest-controller";

const router = Router();
const controller = new Controller()

router.route("/")
    .get(controller.listCodeQuest)
    .post(controller.addCodeQuest);

router.route("/authors/:author")
    .get(controller.getCodeQuestsByAuthor);

router.route("/languages")
    .get(controller.getCodeQuestsByLanguage)

router.route("/:id")
    .get(controller.getCodeQuestById)
    .delete(controller.deleteCodeQuest);

router.route("/codequest-problem/:id")
    .put(controller.updateProblem);

router.route("/codequest-title/:id")
    .put(controller.updateTitle)

router.route("/codequest-languages/:id")
    .put(controller.updateLanguages)

export default router;