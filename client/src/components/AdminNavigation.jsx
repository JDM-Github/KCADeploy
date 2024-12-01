import React from "react";
import "./AdminNavigation.css";
import AdminChatScreen from "../components/AdminChatScreen";

import { Link, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../LOGO.png";
import ChatScreen from "./ChatHead";

export default function AdminNavigation({ userInfo, signoutHandler }) {
	const location = useLocation();

	const isActive = (path) => {
		return location.pathname === path ? "active" : "";
	};

	return (
		<>
			<div
				className="min-h-screen fixed flex flex-col justify-between items-center p-6 w-[20vw]"
				style={{
					background: "linear-gradient(180deg, #1a1a1a, #333333)",
					color: "#FFD700",
				}}
			>
				{/* Logo Section */}
				<div className="flex flex-col items-center w-full">
					<img src={logo} alt="Logo" className="w-48 h-48 mb-4" />
					<div className="text-2xl font-bold uppercase">
						{userInfo.isAdmin ? "Admin" : "Rider"}
					</div>
				</div>

				{/* Navigation Links */}
				<div className="flex flex-col w-full space-y-4 mt-10">
					{userInfo.isAdmin && (
						<>
							<Link
								className="no-underline block text-center py-2 px-4 bg-gray-800 text-yellow-300 rounded-lg hover:bg-yellow-400 hover:text-black transition"
								to="/admin/dashboard"
							>
								Dashboard
							</Link>

							<Link
								className="no-underline block text-center py-2 px-4 bg-gray-800 text-yellow-300 rounded-lg hover:bg-yellow-400 hover:text-black transition"
								to="/admin/sales"
							>
								Sales Report
							</Link>

							<Link
								className="no-underline block text-center py-2 px-4 bg-gray-800 text-yellow-300 rounded-lg hover:bg-yellow-400 hover:text-black transition"
								to="/admin/products"
							>
								Product List
							</Link>

							<Link
								className="no-underline block text-center py-2 px-4 bg-gray-800 text-yellow-300 rounded-lg hover:bg-yellow-400 hover:text-black transition"
								to="/admin/users"
							>
								User List
							</Link>
						</>
					)}
					<Link
						className="no-underline block text-center py-2 px-4 bg-gray-800 text-yellow-300 rounded-lg hover:bg-yellow-400 hover:text-black transition"
						to="/admin/orders"
					>
						Order List
					</Link>

					{/* SalesReport */}
				</div>

				{/* Sign Out Button */}
				<button
					className="w-full py-2 px-4 bg-gray-700 text-yellow-200 rounded-lg hover:bg-red-600 hover:text-white transition mt-auto"
					onClick={signoutHandler}
					style={{ position: "relative", bottom: "0" }}
				>
					<i className="fas fa-sign-out-alt mr-2"></i> Sign Out
				</button>
			</div>
			<AdminChatScreen userInfo={userInfo} />
		</>
	);
}
