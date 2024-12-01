require("dotenv").config();
const pg = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
	"postgresql://jdm:gA00MXJG6XdxLl7tZvCuEA@jdm-master-15017.7tt.aws-us-east-1.cockroachlabs.cloud:26257/kca?sslmode=verify-full",
	{
		dialect: "postgres",
		dialectModule: pg,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	}
);

const Chat = sequelize.define(
	"Chat",
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		messages: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

// Customize Model
const Customize = sequelize.define(
	"Customize",
	{
		name: { type: DataTypes.STRING, allowNull: false, unique: true },
		lastname: { type: DataTypes.STRING, allowNull: false },
		image: { type: DataTypes.STRING, allowNull: false },
		images: { type: DataTypes.ARRAY(DataTypes.STRING) },
		phoneNum: { type: DataTypes.INTEGER, allowNull: false },
		description: { type: DataTypes.STRING, allowNull: false },
	},
	{
		timestamps: true,
	}
);

// Order Model
const Order = sequelize.define(
	"Order",
	{
		orderItems: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
		shippingAddress: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
		paymentMethodName: { type: DataTypes.STRING, allowNull: false },
		referenceNumber: { type: DataTypes.STRING, allowNull: false },
		paymentImage: { type: DataTypes.STRING, allowNull: false },
		paymentResult: {
			type: DataTypes.JSONB,
		},
		itemsPrice: { type: DataTypes.FLOAT, allowNull: false },
		shippingPrice: { type: DataTypes.FLOAT, allowNull: false },
		taxPrice: { type: DataTypes.FLOAT, allowNull: false },
		totalPrice: { type: DataTypes.FLOAT, allowNull: false },
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
		paidAt: { type: DataTypes.DATE },
		proofOfDeliveryImage: { type: DataTypes.STRING },
		isDelivered: { type: DataTypes.BOOLEAN, defaultValue: false },
		deliveredAt: { type: DataTypes.DATE },
	},
	{
		timestamps: true,
	}
);

// Payment Model
const Payment = sequelize.define(
	"Payment",
	{
		paymentMethod: { type: DataTypes.STRING, allowNull: false },
		referenceNumber: { type: DataTypes.STRING, allowNull: false },
		paymentImage: { type: DataTypes.STRING, allowNull: false },
	},
	{
		timestamps: true,
	}
);

// Review Model
// const Review = sequelize.define(
// 	"Review",
// 	{
// 		name: { type: DataTypes.STRING, allowNull: false },
// 		comment: { type: DataTypes.STRING, allowNull: false },
// 		rating: { type: DataTypes.INTEGER, allowNull: false },
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// Product Model
const Product = sequelize.define(
	"Product",
	{
		name: { type: DataTypes.STRING, allowNull: false, unique: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		image: { type: DataTypes.STRING, allowNull: false },
		images: { type: DataTypes.ARRAY(DataTypes.STRING) },
		brand: { type: DataTypes.STRING, allowNull: false },
		category: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING(500), allowNull: false },
		price: { type: DataTypes.FLOAT, allowNull: false },
		countInStock: { type: DataTypes.INTEGER, allowNull: false },
		rating: { type: DataTypes.FLOAT, allowNull: false },
		numReviews: { type: DataTypes.INTEGER, allowNull: false },
		isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
		archivedAt: { type: DataTypes.DATE },
		orderCount: { type: DataTypes.INTEGER, defaultValue: 0 },
	},
	{
		timestamps: true,
	}
);

// User Model
const User = sequelize.define(
	"User",
	{
		name: { type: DataTypes.STRING, allowNull: false },
		middlename: { type: DataTypes.STRING, allowNull: true },
		lastname: { type: DataTypes.STRING, allowNull: false },
		suffix: { type: DataTypes.STRING, allowNull: true },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		birthday: { type: DataTypes.DATE, defaultValue: null },
		location: { type: DataTypes.STRING, defaultValue: "" },
		phoneNum: { type: DataTypes.STRING, defaultValue: "" },
		password: { type: DataTypes.STRING, allowNull: false },

		isAdmin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		isRider: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		isCustomer: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
		verificationToken: { type: DataTypes.STRING },
		passwordResetToken: { type: DataTypes.STRING },
		passwordResetExpires: { type: DataTypes.DATE },
	},
	{
		timestamps: true,
	}
);

// Image Model
const UploadedImage = sequelize.define(
	"UploadedImage",
	{
		imageUrl: { type: DataTypes.STRING, allowNull: false },
		paymentMethod: { type: DataTypes.STRING, allowNull: false },
		referenceNumber: { type: DataTypes.STRING, allowNull: false },
	},
	{
		timestamps: true,
	}
);

const Review = sequelize.define("Review", {
	comment: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: "Users",
			key: "id",
		},
	},
	productId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: "Products",
			key: "id",
		},
	},
	rating: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 1,
			max: 5,
		},
	},
	reviewImage: { type: DataTypes.STRING, defaultValue: null },
});

User.hasMany(Review, { foreignKey: "userId" });
Product.hasMany(Review, { foreignKey: "productId" });
Review.belongsTo(User, { foreignKey: "userId" });
Review.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Chat, { foreignKey: "userId" });
Chat.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Payment, { foreignKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId" });

// Export Models
module.exports = {
	Chat,
	Customize,
	Order,
	Payment,
	Product,
	User,
	UploadedImage,
	Review,
	sequelize,
};
