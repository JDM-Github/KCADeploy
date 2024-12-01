const express = require("express");
const moment = require("moment");
const expressAsyncHandler = require("express-async-handler");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const nodemailer = require("nodemailer");

const { Op } = require("sequelize");
const { isAuth, isAdmin } = require("./utils.js");
const {
	Chat,
	Customize,
	Order,
	User,
	Product,
	Payment,
	UploadedImage,
	Review,
	sequelize,
} = require("./models2");

const upload = multer();

const streamUploadImage = (req) => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream((error, result) => {
			if (result) {
				resolve(result);
			} else {
				reject(error);
			}
		});
		streamifier.createReadStream(req.file.buffer).pipe(stream);
	});
};

class ChatRouter {
	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.get(
			"/user/:id",
			isAuth,
			expressAsyncHandler(this.getChatByUser)
		);
		this.router.post(
			"/user/:id",
			isAuth,
			upload.single("image"),
			expressAsyncHandler(this.postUserMessage)
		);
		this.router.post(
			"/admin/reply/:id",
			isAuth,
			isAdmin,
			upload.single("image"),
			expressAsyncHandler(this.replyToChat)
		);
		this.router.get(
			"/admin/get_all_chats",
			isAuth,
			isAdmin,
			expressAsyncHandler(this.getAllChats)
		);
	}

	async getChatByUser(req, res) {
		const chat = await Chat.findOne({
			where: { userId: req.params.id },
			include: [
				{
					model: User,
					attributes: ["name", "email"],
				},
			],
		});
		if (chat) {
			res.send(chat);
		} else {
			res.status(404).send({ message: "Chat not found" });
		}
	}

	async postUserMessage(req, res) {
		let firstChat = false;
		let chat = await Chat.findOne({ where: { userId: req.params.id } });
		if (!chat) {
			firstChat = true;
			chat = await Chat.create({ userId: req.params.id, messages: [] });
		}
		let imageUrl = null;
		if (req.file) {
			try {
				const result = await streamUploadImage(req);
				imageUrl = result.secure_url;
			} catch (err) {
				imageUrl = null;
				console.error(err.message);
				return res.status(500).send({
					message: "Image upload failed",
					error: err.message,
				});
			}
		}
		const newMessage = {
			image: imageUrl,
			text: req.body.message,
			sender: "user",
			user: req.body.user,
			createdAt: Date.now(),
		};
		const updatedMessages = [...chat.messages, newMessage];
		await chat.update({ messages: updatedMessages });

		if (firstChat) {
			const newMessage = {
				image: null,
				text: "Hello! 👋 Welcome to the RYB Official Store. We're your go-to place for premium jerseys and sportswear. How can we assist you today? Please wait while an admin responds to your inquiry.",
				sender: "admin",
				user: null,
				createdAt: Date.now(),
			};
			const updatedMessages = [...chat.messages, newMessage];
			await chat.update({ messages: updatedMessages });
		}
		res.send(chat);
	}

	async replyToChat(req, res) {
		const chat = await Chat.findOne({ where: { userId: req.params.id } });
		if (chat) {
			let imageUrl = null;
			if (req.file) {
				try {
					const result = await streamUploadImage(req);
					imageUrl = result.secure_url;
				} catch (err) {
					imageUrl = null;
					console.error(err.message);
					return res.status(500).send({
						message: "Image upload failed",
						error: err.message,
					});
				}
			}
			const newMessage = {
				image: imageUrl,
				text: req.body.message,
				sender: "admin",
				user: req.body.user,
				createdAt: Date.now(),
			};
			const updatedMessages = [...chat.messages, newMessage];
			await chat.update({ messages: updatedMessages });
			res.send({ message: "Reply sent", chat, image: imageUrl });
		} else {
			res.status(404).send({ message: "Chat not found" });
		}
	}

	async getAllChats(req, res) {
		const chats = await Chat.findAll({
			include: {
				model: User,
				attributes: ["name", "email"],
			},
		});
		res.send(chats);
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

class CustomRouter {
	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
		this.configureCloudinary();
	}

	initializeRoutes() {
		this.router.get("/", expressAsyncHandler(this.getAllCustomizations));
		this.router.post(
			"/",
			isAuth,
			expressAsyncHandler(this.createCustomization)
		);
		this.router.put(
			"/:id",
			isAuth,
			expressAsyncHandler(this.updateCustomization)
		);
		this.router.post(
			"/",
			isAuth,
			upload.single("file"),
			expressAsyncHandler(this.uploadFile)
		);
		this.router.get("/:id", expressAsyncHandler(this.getCustomizationById));
	}

	configureCloudinary() {
		cloudinary.config({
			cloud_name: "dv1lnu2cn",
			api_key: "684211599172577",
			api_secret: "qoFLVxbDTWYQoXfrxSyAAcEvVTU",
		});
	}

	async getAllCustomizations(req, res) {
		const custom = await Customize.findAll();
		res.send(custom);
	}

	async createCustomization(req, res) {
		const newCustomize = new Customize({
			name: "first name" + Date.now(),
			lastname: "last name" + Date.now(),
			image: " ",
			images: " ",
			phoneNum: " ",
			description: "item description",
		});
		const custom = await newCustomize.save();
		res.send({ message: "Customization Request Saved", custom });
	}

	async updateCustomization(req, res) {
		const customId = req.params.id;
		const custom = await Customize.findByPk(customId);
		if (custom) {
			custom.name = req.body.name;
			custom.image = req.body.image;
			custom.images = req.body.images;
			custom.phoneNum = req.body.phoneNum;
			custom.description = req.body.description;
			await custom.save();
			res.send({ message: "Customized Request Successfully Updated" });
		} else {
			res.status(404).send({
				message: "Customized Request Error. Error 404",
			});
		}
	}

	async uploadFile(req, res) {
		const streamUpload = (req) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					(error, result) => {
						if (result) {
							resolve(result);
						} else {
							reject(error);
						}
					}
				);
				streamifier.createReadStream(req.file.buffer).pipe(stream);
			});
		};
		const result = await streamUpload(req);
		res.send(result);
	}

	async getCustomizationById(req, res) {
		const custom = await Customize.findByPk(req.params.id);
		if (custom) {
			res.send(custom);
		} else {
			res.status(404).send({ message: "CUSTOM REQUEST NOT FOUND" });
		}
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

class OrderRouter {
	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.get(
			"/summary",
			isAuth,
			expressAsyncHandler(this.getOrderSummary)
		);

		this.router.get("/", isAuth, expressAsyncHandler(this.getOrders));
		this.router.post("/", isAuth, expressAsyncHandler(this.createOrder));
		this.router.get(
			"/mine/:id",
			isAuth,
			expressAsyncHandler(this.getMyOrders)
		);
		this.router.get("/:id", isAuth, expressAsyncHandler(this.getOrderById));
		this.router.put("/:id/pay", isAuth, expressAsyncHandler(this.payOrder));
		this.router.put(
			"/:id/deliver",
			isAuth,
			upload.single("image"),
			expressAsyncHandler(this.deliverOrder)
		);
		this.router.put(
			"/:id/confirmPayment",
			isAuth,
			isAdmin,
			expressAsyncHandler(this.confirmPayment)
		);
		this.router.delete(
			"/:id",
			isAuth,
			expressAsyncHandler(this.deleteOrder)
		);
		this.router.post("/getAllSales", expressAsyncHandler(this.getAllSales));
	}

	async getOrders(req, res) {
		try {
			const orders = await Order.findAll({
				include: [
					{
						model: User,
						attributes: ["name"],
					},
				],
				order: [["createdAt", "DESC"]],
			});
			res.send(orders);
		} catch (error) {
			console.error(error);
			res.status(500).send({
				message: "Error fetching orders.",
				success: false,
			});
		}
	}

	async createOrder(req, res) {
		let checkOrder = await Order.findOne({
			where: { referenceNumber: req.body.referenceNumber },
		});

		if (checkOrder) {
			res.status(500).send({
				message: "This reference number is already been used",
			});
			return;
		}

		const newOrder = new Order({
			orderItems: req.body.orderItems.map((x) => ({
				...x,
				product: x.id,
			})),
			shippingAddress: req.body.shippingAddress,
			paymentMethodName: req.body.paymentMethodName,
			referenceNumber: req.body.referenceNumber,
			paymentImage: req.body.paymentImage,
			itemsPrice: req.body.itemsPrice,
			shippingPrice: req.body.shippingPrice,
			taxPrice: req.body.taxPrice,
			totalPrice: req.body.totalPrice,
			userId: req.body.userId,
		});
		const order = await newOrder.save();
		res.status(201).send({ message: "New Order Created", order });
	}

	async getMyOrders(req, res) {
		const orders = await Order.findAll({
			where: { userId: req.params.id },
		});
		res.send(orders);
	}

	async getOrderById(req, res) {
		const order = await Order.findByPk(req.params.id);
		if (order) {
			res.send(order);
		} else {
			res.status(404).send({ message: "ORDER NOT FOUND" });
		}
	}

	async payOrder(req, res) {
		const order = await Order.findByPk(req.params.id);
		if (order) {
			order.isPaid = true;
			order.paidAt = Date.now();
			order.paymentResult = {
				id: req.body.id,
				status: req.body.status,
				update_time: req.body.update_time,
				email_address: req.body.email_address,
			};

			const updatedOrder = await order.save();
			res.send({ message: "ORDER PAID", order: updatedOrder });
		} else {
			res.status(404).send({ message: "ORDER NOT FOUND" });
		}
	}

	async getAllSales(req, res) {
		const { year, month } = req.query;

		try {
			const startDate = moment(`${year}-${month}-01`)
				.startOf("month")
				.toDate();
			const endDate = moment(`${year}-${month}-01`)
				.endOf("month")
				.toDate();

			const orders = await Order.findAll({
				where: {
					isPaid: true,
					createdAt: {
						[Op.gte]: startDate,
						[Op.lte]: endDate,
					},
				},
			});

			const productSales = {};
			orders.forEach((order) => {
				order.orderItems.forEach((item) => {
					const productId = item.id;
					const productName = item.name;
					const totalSales = item.quantity * item.price;

					if (!productSales[productId]) {
						productSales[productId] = {
							name: productName,
							salesCount: 0,
							totalSales: 0,
						};
					}
					productSales[productId].salesCount += item.quantity;
					productSales[productId].totalSales += totalSales;
				});
			});
			const salesReport = Object.values(productSales);
			return res.send(salesReport);
		} catch (error) {
			console.error("Error fetching sales data:", error);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async deliverOrder(req, res) {
		let imageUrl;
		try {
			const result = await streamUploadImage(req);
			imageUrl = result.secure_url;
		} catch (err) {
			console.error("Error uploading image:", err);
			res.status(500).json({ message: "Error uploading image" });
		}

		const order = await Order.findByPk(req.params.id);
		if (order) {
			order.proofOfDeliveryImage = imageUrl;
			order.isDelivered = true;
			order.deliveredAt = Date.now();

			for (let item of order.orderItems) {
				const product = await Product.findByPk(item.id);
				if (product) {
					product.orderCount += item.quantity;
					await product.save();
				}
			}
			await order.save();

			const user = await User.findByPk(order.userId);
			if (user) {
				console.log(user);
				const mailOptions = {
					from: `"RYB Officials"<${"kcaligam@ccc.edu.ph"}>`,
					to: user.email,
					subject: "Your order has arrived!",
					html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #4CAF50;">🎉 Order Delivered Successfully!</h2>
                        <p>Hi ${user.name},</p>
                        <p>We are pleased to inform you that your order <strong>#${
							order.id
						}</strong> has been successfully delivered.</p>
                        <p>Here is the proof of delivery:</p>
                        <img src="${imageUrl}" alt="Proof of Delivery" style="max-width: 100%; height: auto; border-radius: 10px;"/>
                        <p>Thank you for shopping with us!</p>
                        <hr style="border: none; border-top: 1px solid #eee;"/>
                        <p style="font-size: 0.9em;">For any queries, please contact us at <a href="mailto:kcaligam@ccc.edu.ph">kcaligam@ccc.edu.ph</a></p>
                        <p style="font-size: 0.8em; color: #888;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                    </div>`,
				};

				const transporter = nodemailer.createTransport({
					service: "gmail",
					auth: {
						user: "kcaligam@ccc.edu.ph",
						pass: "qmcm hhlk pohs vyrh",
					},
				});
				await transporter.sendMail(mailOptions);
			}
			res.send(order);
		} else {
			res.status(404).send({ message: "ORDER NOT FOUND" });
		}
	}

	async confirmPayment(req, res) {
		const order = await Order.findByPk(req.params.id);
		if (order) {
			if (order.isPaid) {
				return res
					.status(400)
					.send({ message: "Order is already paid" });
			}
			order.isPaid = true;
			order.paidAt = Date.now();
			order.paymentReferenceNumber = req.body.referenceNumber;
			const updatedOrder = await order.save();
			res.send({ message: "Payment confirmed", order: updatedOrder });
		} else {
			res.status(404).send({ message: "Order not found" });
		}
	}

	async deleteOrder(req, res) {
		const order = await Order.findByPk(req.params.id);
		if (order) {
			await order.destroy();
			res.send({ message: "ORDER IS SUCCESSFULLY DELETED" });
		} else {
			res.status(404).send({ message: "ORDER DO NOT EXIST. ERROR" });
		}
	}

	async getOrderSummary(req, res) {
		try {
			const orders = await Order.findAll({
				attributes: [
					[sequelize.fn("COUNT", sequelize.col("id")), "numOrders"],
					[
						sequelize.fn("SUM", sequelize.col("totalPrice")),
						"totalSales",
					],
				],
			});

			const users = await User.findAll({
				attributes: [
					[sequelize.fn("COUNT", sequelize.col("id")), "numUsers"],
				],
			});

			const dailyOrders = await sequelize.query(
				`
                SELECT 
                    TO_CHAR("createdAt", 'MM-DD-YYYY') AS "date", 
                    COUNT("id") AS "orders", 
                    SUM("totalPrice") AS "sales" 
                FROM "Orders" 
                GROUP BY TO_CHAR("createdAt", 'MM-DD-YYYY') 
                ORDER BY MIN("createdAt") ASC;
                `,
				{ model: Order, mapToModel: true }
			);

			const productCategories = await Product.findAll({
				attributes: [
					"category",
					[sequelize.fn("COUNT", sequelize.col("id")), "count"],
				],
				group: ["category"],
			});

			res.send({ users, orders, dailyOrders, productCategories });
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			res.status(500).send("Server error");
		}
	}

	// async getOrderSummary(req, res) {
	//  const orders = await Order.aggregate([
	//      {
	//          $group: {
	//              id: null,
	//              numOrders: { $sum: 1 },
	//              totalSales: { $sum: "$totalPrice" },
	//          },
	//      },
	//  ]);

	//  const users = await User.aggregate([
	//      {
	//          $group: {
	//              id: null,
	//              numUsers: { $sum: 1 },
	//          },
	//      },
	//  ]);

	//  const dailyOrders = await Order.aggregate([
	//      {
	//          $group: {
	//              id: {
	//                  $dateToString: {
	//                      format: "%m-%d-%Y",
	//                      date: "$createdAt",
	//                  },
	//              },
	//              orders: { $sum: 1 },
	//              sales: { $sum: "$totalPrice" },
	//          },
	//      },
	//      { $sort: { id: 1 } },
	//  ]);

	//  const productCategories = await Product.aggregate([
	//      {
	//          $group: {
	//              id: "$category",
	//              count: { $sum: 1 },
	//          },
	//      },
	//  ]);

	//  res.send({ users, orders, dailyOrders, productCategories });
	// }

	// Multer upload configuration
	// get upload() {
	//  const storage = multer.diskStorage({
	//      destination(req, file, cb) {
	//          cb(null, "uploads/proofOfDelivery/");
	//      },
	//      filename(req, file, cb) {
	//          cb(null, `${Date.now()}-${file.originalname}`);
	//      },
	//  });

	//  return multer({
	//      storage,
	//      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
	//  });
	// }

	// async uploadProofOfDelivery(req, res) {
	//  const order = await Order.findByPk(req.params.id);
	//  if (order) {
	//      order.isDelivered = true;
	//      order.deliveredAt = Date.now();
	//      order.proofOfDeliveryImage = req.file.path.replace(/\\/g, "/");
	//      await order.save();
	//      res.send({ message: "Order is being delivered", order });
	//  } else {
	//      res.status(404).send({ message: "Order not found" });
	//  }
	// }
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
const PAGE_SIZE = 10;

class ProductController {
	constructor() {
		this.router = express.Router();
		this.routes();
	}

	routes() {
		this.router.get("/", this.getProducts);
		this.router.post("/", isAuth, expressAsyncHandler(this.createProduct));
		this.router.post(
			"/create",
			isAuth,
			expressAsyncHandler(this.createProductParam)
		);
		this.router.get(
			"/archived",
			isAuth,
			isAdmin,
			expressAsyncHandler(this.getArchivedProducts)
		);
		this.router.put(
			"/:id/archive",
			isAuth,
			expressAsyncHandler(this.archiveProduct)
		);
		this.router.put(
			"/:id/unarchive",
			isAuth,
			expressAsyncHandler(this.unarchiveProduct)
		);
		this.router.put(
			"/:id",
			isAuth,
			expressAsyncHandler(this.updateProduct)
		);
		this.router.delete("/:id", expressAsyncHandler(this.deleteProduct));
		this.router.get(
			"/admin",
			isAuth,
			expressAsyncHandler(this.getAdminProducts)
		);
		// this.router.post(
		//  "/:id/reviews",
		//  isAuth,
		//  expressAsyncHandler(this.addReview)
		// );
		this.router.post(
			"/review-check",
			expressAsyncHandler(this.reviewCheck)
		);
		this.router.post(
			"/check",
			expressAsyncHandler(this.checkOrderComplete)
		);
		this.router.get("/search", expressAsyncHandler(this.searchProducts));
		this.router.get("/categories", expressAsyncHandler(this.getCategories));
		this.router.get("/slug/:slug", this.getProductBySlug);

		this.router.get("/:id", this.getProductById);

		this.router.get(
			"/:id/reviews",
			expressAsyncHandler(this.getProductReviews)
		);
		this.router.post(
			"/:id/reviews",
			isAuth,
			upload.single("image"),
			expressAsyncHandler(this.createReview)
		);
	}

	async reviewCheck(req, res) {
		const userId = req.body.id;
		const productId = req.body.productId;

		console.log(req.body);

		const review = await Review.findOne({
			where: { userId, productId },
		});

		return res.status(200).json({ reviewed: !!review });
	}

	async checkOrderComplete(req, res) {
		const userId = req.body.id;
		const productId = req.body.productId;

		const orders = await Order.findAll({
			where: { userId, isDelivered: true },
		});

		let hasOrderedProduct = false;
		orders.forEach((e) => {
			e.orderItems.some((item) => {
				console.log(JSON.stringify(item.id));
				if (productId == item.id) hasOrderedProduct = true;
			});
		});

		return res.status(200).json({ hasOrdered: hasOrderedProduct });
	}

	async createReview(req, res) {
		try {
			const productId = req.params.id;
			const { comment, rating } = req.body;
			const userId = req.body.id;

			const product = await Product.findByPk(productId);
			if (!product) {
				console.error(err.message);
				return res.status(404).send({ message: "Product not found" });
			}

			let imageUrl = null;
			if (req.file) {
				try {
					const result = await streamUploadImage(req);
					imageUrl = result.secure_url;
				} catch (err) {
					imageUrl = null;
					console.error(err.message);
					return res.status(500).send({
						message: "Image upload failed",
						error: err.message,
					});
				}
			}
			const review = await Review.create({
				comment,
				userId,
				productId,
				rating,
				reviewImage: imageUrl,
			});

			const reviews = await Review.findAll({
				where: { productId },
				attributes: ["rating"],
			});

			const numReviews = reviews.length;
			const averageRating =
				reviews.reduce(
					(acc, review) => acc + Number(review.rating),
					0
				) / numReviews;

			console.log(averageRating);

			await Product.update(
				{ rating: averageRating, numReviews },
				{ where: { id: productId } }
			);

			res.status(201).send({ message: "Review added", review });
		} catch (error) {
			console.error(error.message);
			res.status(500).send({ message: error.message });
		}
	}

	async getProductReviews(req, res) {
		try {
			const productId = req.params.id;
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;

			const offset = (page - 1) * limit;

			const reviews = await Review.findAll({
				where: { productId },
				include: [{ model: User, attributes: ["name", "email"] }],
				limit,
				offset,
			});

			const totalReviews = await Review.count({
				where: { productId },
			});

			res.send({
				reviews,
				totalPages: Math.ceil(totalReviews / limit),
				currentPage: page,
			});
		} catch (error) {
			res.status(500).send({ message: error.message });
		}
	}

	async getProducts(req, res) {
		const products = await Product.findAll({
			where: {
				isArchived: false,
			},
		});
		res.send(products);
	}

	async createProduct(req, res) {
		const newProduct = new Product({
			name: "Sample Name",
			slug: "Sample Name",
			image: "",
			images: [],
			price: 100,
			category: "",
			brand: "",
			countInStock: 0,
			rating: 0,
			numReviews: 0,
			description: "",
			isArchived: false,
		});
		const product = await newProduct.save();
		res.send({ message: "Product Created", product });
	}

	async createProductParam(req, res) {
		try {
			const existingProduct = await Product.findOne({
				where: { name: req.body.name },
			});
			if (existingProduct) {
				return res.status(400).send({
					message:
						"Product name already exists. Please choose a different name.",
				});
			}

			const newProduct = await Product.create({
				name: req.body.name,
				slug: req.body.name.replace(/\s+/g, "-").toLowerCase(), // Generate slug
				image: req.body.image || "",
				images: req.body.images.length ? req.body.images : null,
				price: req.body.price,
				category: req.body.category,
				brand: req.body.brand,
				countInStock: req.body.countInStock || 0,
				rating: 0,
				numReviews: 0,
				description: req.body.description,
				isArchived: false,
			});

			res.send({ message: "Product Created", product: newProduct });
		} catch (error) {
			console.error("Error creating product:", error);
			res.status(500).send({
				message: "Error creating product",
				error: error.message,
			});
		}
	}

	async getArchivedProducts(req, res) {
		const archivedProducts = await Product.findAll({
			where: {
				isArchived: true,
			},
		});
		res.send(archivedProducts);
	}

	async archiveProduct(req, res) {
		const product = await Product.findByPk(req.params.id);
		if (product) {
			product.isArchived = true;
			product.archivedAt = new Date();
			await product.save();
			res.send({ message: "Product Archived" });
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}

	async unarchiveProduct(req, res) {
		const product = await Product.findByPk(req.params.id);
		if (product) {
			product.isArchived = false;
			await product.save();
			res.send({ message: "Product Unarchived" });
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}

	async updateProduct(req, res) {
		const product = await Product.findByPk(req.params.id);
		if (product) {
			product.name = req.body.name;
			product.slug = req.body.name;
			product.price = req.body.price;
			product.image = req.body.image;
			product.images = req.body.images;
			product.category = req.body.category;
			product.brand = req.body.brand;
			product.countInStock = req.body.countInStock;
			product.description = req.body.description;
			await product.save();
			res.send({ message: "Product Successfully Updated" });
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}

	async deleteProduct(req, res) {
		const product = await Product.findByPk(req.params.id);
		if (product) {
			await product.destroy();
			res.send({ message: "Product Deleted" });
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}

	async getAdminProducts(req, res) {
		const { query } = req;
		const page = query.page || 1;
		const pageSize = query.pageSize || PAGE_SIZE;

		const products = await Product.findAll({
			where: { isArchived: false },
			limit: pageSize,
			offset: pageSize * (page - 1),
		});
		const countProducts = await Product.count({
			where: {
				isArchived: false,
			},
		});
		res.send({
			products,
			countProducts,
			page,
			pages: Math.ceil(countProducts / pageSize),
		});
	}

	// async addReview(req, res) {
	//  const product = await Product.findByPk(req.params.id);
	//  if (product) {
	//      if (product.reviews.find((x) => x.name === req.user.name)) {
	//          return res
	//              .status(400)
	//              .send({ message: "You Already Submitted a Review" });
	//      }

	//      const review = {
	//          name: req.user.name,
	//          rating: Number(req.body.rating),
	//          comment: req.body.comment,
	//      };
	//      product.reviews.push(review);
	//      product.numReviews = product.reviews.length;
	//      product.rating =
	//          product.reviews.reduce((a, c) => c.rating + a, 0) /
	//          product.reviews.length;
	//      const updatedProduct = await product.save();
	//      res.status(201).send({
	//          message: "Review Created",
	//          review: updatedProduct.reviews[
	//              updatedProduct.reviews.length - 1
	//          ],
	//          numReviews: product.numReviews,
	//          rating: product.rating,
	//      });
	//  } else {
	//      res.status(404).send({ message: "Product Not Found" });
	//  }
	// }

	async searchProducts(req, res) {
		const { query } = req;
		const pageSize = query.pageSize || PAGE_SIZE;
		const page = query.page || 1;
		const category = query.category || "";
		const price = query.price || "";
		const rating = query.rating || "";
		const order = query.order || "";
		const searchQuery = query.query || "";

		// Filters
		const queryFilter =
			searchQuery && searchQuery !== "all"
				? {
						name: {
							[Op.iLike]: `%${searchQuery}%`,
						},
				  }
				: {};
		const categoryFilter =
			category && category !== "all" ? { category } : {};
		const ratingFilter =
			rating && rating !== "all"
				? {
						rating: {
							[Op.gte]: Number(rating),
						},
				  }
				: {};
		const priceFilter =
			price && price !== "all"
				? {
						price: {
							[Op.gte]: Number(price.split("-")[0]),
							[Op.lte]: Number(price.split("-")[1]),
						},
				  }
				: {};

		let sortOrderField, sortOrderDirection;
		switch (order) {
			case "featured":
				sortOrderField = "featured";
				sortOrderDirection = "DESC";
				break;
			case "lowest":
				sortOrderField = "price";
				sortOrderDirection = "ASC";
				break;
			case "highest":
				sortOrderField = "price";
				sortOrderDirection = "DESC";
				break;
			case "toprated":
				sortOrderField = "rating";
				sortOrderDirection = "DESC";
				break;
			case "newest":
				sortOrderField = "createdAt";
				sortOrderDirection = "DESC";
				break;
			default:
				sortOrderField = "id";
				sortOrderDirection = "DESC";
				break;
		}

		const products = await Product.findAll({
			where: {
				isArchived: false,
				...queryFilter,
				...categoryFilter,
				...priceFilter,
				...ratingFilter,
			},
			order: [[sortOrderField, sortOrderDirection]],
			limit: pageSize,
			offset: pageSize * (page - 1),
		});

		// Count products
		const countProducts = await Product.count({
			where: {
				isArchived: false,
				...queryFilter,
				...categoryFilter,
				...priceFilter,
				...ratingFilter,
			},
		});

		res.send({
			products,
			countProducts,
			page,
			pages: Math.ceil(countProducts / pageSize),
		});
	}

	async getCategories(req, res) {
		const categories = await Product.findAll({
			attributes: [
				[
					sequelize.fn("DISTINCT", sequelize.col("category")),
					"category",
				],
			],
		});
		res.send(categories);
	}

	async getProductBySlug(req, res) {
		const product = await Product.findOne({
			where: { slug: req.params.slug },
		});
		if (product) {
			res.send(product);
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}

	async getProductById(req, res) {
		const product = await Product.findByPk(req.params.id);
		if (product) {
			res.send(product);
		} else {
			res.status(404).send({ message: "Product Not Found" });
		}
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
	await Product.deleteMany({});
	const createdProducts = await Product.insertMany(data.products);
	await User.deleteMany({});
	const createdUsers = await User.insertMany(data.users);
	await Customize.deleteMany({});
	const createdCustomize = await Customize.insertMany(data.custom);
	res.send({ createdProducts, createdUsers, createdCustomize });
});

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

class UploadController {
	constructor() {
		this.router = express.Router();
		// this.storage = multer.diskStorage({
		//  destination(req, file, cb) {
		//      cb(null, "uploads/");
		//  },
		//  filename(req, file, cb) {
		//      cb(null, `${Date.now()}-${file.originalname}`);
		//  },
		// });

		// this.upload = multer({
		//  storage: this.storage,
		//  limits: { fileSize: 5 * 1024 * 1024 },
		// });

		this.routes();
	}

	routes() {
		this.router.post(
			"/",
			upload.single("file"),
			this.uploadFile.bind(this)
		);
	}

	async uploadFile(req, res) {
		try {
			const result = await streamUploadImage(req);
			const imageUrl = result.secure_url;
			res.send(imageUrl);
		} catch (err) {
			console.error("Error uploading image:", err);
			res.status(500).json({ message: "Error uploading image" });
		}
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

class UploadImageController {
	constructor() {
		this.router = express.Router();
		this.upload = multer({ storage: multer.memoryStorage() });

		cloudinary.config({
			cloud_name: "dv1lnu2cn",
			api_key: "684211599172577",
			api_secret: "qoFLVxbDTWYQoXfrxSyAAcEvVTU",
		});

		this.routes();
	}

	routes() {
		this.router.post(
			"/",
			this.upload.single("image"),
			this.uploadFile.bind(this)
		);
	}

	async uploadFile(req, res) {
		try {
			const result = await streamUploadImage(req);
			const imageUrl = result.secure_url;

			const uploadedImage = new UploadedImage({
				imageUrl,
				paymentMethod: req.body.paymentMethod,
				referenceNumber: req.body.referenceNumber,
			});
			await uploadedImage.save();
			res.status(201).json({ filename: imageUrl });
		} catch (err) {
			console.error("Error uploading image:", err);
			res.status(500).json({ message: "Error uploading image" });
		}
	}
}

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

const uploadImageRouter = new UploadImageController().router;
const uploadRouter = new UploadController().router;
const productRouter = new ProductController().router;
const orderRouter = new OrderRouter().router;
const chatRouter = new ChatRouter().router;
const customRouter = new CustomRouter().router;
module.exports = {
	chatRouter,
	customRouter,
	orderRouter,
	productRouter,
	seedRouter,
	uploadRouter,
	uploadImageRouter,
	sequelize,
};
