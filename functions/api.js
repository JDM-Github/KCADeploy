const express = require("express");

const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const bodyParser = require("body-parser");

const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");

const {
	chatRouter,
	customRouter,
	orderRouter,
	productRouter,
	seedRouter,
	uploadImageRouter,
	uploadRouter,
	sequelize,
} = require("./routers");

const { Product } = require("./models2.js");

const { userRouter } = require("./userRouter.js");
const app = express();
const router = express.Router();

DEVELOPMENT = false;
if (DEVELOPMENT) {
	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
			optionSuccessStatus: 200,
		})
	);
} else {
	app.use(cors());
}

cron.schedule("0 0 * * *", async () => {
	try {
		const now = new Date();
		const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

		const result = await Product.deleteMany({
			isArchived: true,
			archivedAt: { $lte: thirtyDaysAgo },
		});

		console.log(
			`Deleted ${result.deletedCount} archived products older than 30 days.`
		);
	} catch (error) {
		console.error("Error deleting archived products:", error);
	}
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

router.get("/keys/paypal", (req, res) => {
	res.send(
		"AdDnGewpUUZU1nX1VQKUae6mdQGpaRVUVI9G1e2VSjAMqK1ARhlc4bxbnIKCgiCTGm78brDnImhLgUyy" ||
			"sb"
	);
});

router.use("/uploadImage", uploadImageRouter);
router.use("/upload", uploadRouter);
router.use("/seed", seedRouter);
router.use("/products", productRouter);
router.use("/users", userRouter);
router.use("/orders", orderRouter);
router.use("/custom", customRouter);
router.use("/chats", chatRouter);

router.get("/connect", async (req, res) => {
	try {
		await sequelize.sync({ force: true });
		await sequelize.authenticate();
		res.status(200).json(
			"Connection to database has been established successfully."
		);
	} catch (error) {
		res.status(500).json("Unable to connect to the database:");
	}
});

// router.get("/save-product", async (req, res) => {
// 	try {
// 		const users = await Product.findAll();
// 		const userBackup = JSON.stringify(users);
// 		fs.writeFileSync("productBackup.json", userBackup);
// 		console.log("User data backed up successfully.");
// 	} catch (error) {
// 		res.status(500).send({
// 			message: "Error resetting users",
// 			error: error.message,
// 		});
// 	}
// });

// router.get("/reset-account", async (req, res) => {
// 	try {
// 		await Chat.truncate();
// 		await User.truncate();
// 		res.send({ message: "All users have been reset successfully." });
// 	} catch (error) {
// 		res.status(500).send({
// 			message: "Error resetting users",
// 			error: error.message,
// 		});
// 	}
// });

// router.get("/reset-chats", async (req, res) => {
// 	try {
// 		await Chat.truncate();
// 		res.send({ message: "All chats have been reset successfully." });
// 	} catch (error) {
// 		res.status(500).send({
// 			message: "Error resetting chats",
// 			error: error.message,
// 		});
// 	}
// });

router.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../client/build"), "index.html");
});
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
