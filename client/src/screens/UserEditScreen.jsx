import React, { useContext, useEffect, useReducer } from "react";
import { Store } from "../Store";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import getError from "../utils";
import axios from "axios";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "UPDATE_REQUST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

		default:
			return state;
	}
};

function UserEditScreen() {
	const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
		loading: true,
		error: "",
	});

	const { state } = useContext(Store);
	const { userInfo } = state;
	const params = useParams();
	const { id: userId } = params;
	const navigate = useNavigate();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`users/${userId}`,
					{ headers: { Authorization: `Bearer ${userInfo.token}` } }
				);
				setName(data.name);
				setEmail(data.email);
				setIsAdmin(data.isAdmin);
				dispatch({ type: "FETCH_SUCCESS" });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		fetchData();
	}, [userId, userInfo]);

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			dispatch({ type: "UPDATE_REQUEST" });

			await RequestHandler.handleRequest(
				"put",
				`users/${userId}`,
				{ id: userId, name, email, isAdmin },
				{ headers: { Authorization: `Bearer ${userInfo.token}` } }
			);

			dispatch({ type: "UPDATE_SUCCESS" });

			toast.success("USER INFO UPDATED");
			navigate("/admin/users");
		} catch (error) {
			toast.error(getError(error));
			dispatch({ type: "UPDATE_FAIL" });
		}
	};
	return (
		<div
			style={{
				position: "absolute",
				top: "0",
				left: "20vw",
				width: "calc(80vw - 20px)", // Adjust width with padding
				padding: "20px",
				boxSizing: "border-box",
			}}
		>
			<Helmet>
				<title>Edit User ${userId}</title>
			</Helmet>
			<h1 className="text-lg font-semibold">Edit User Info {userId}</h1>

			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox />
			) : (
				<form onSubmit={submitHandler} className="space-y-4">
					{/* Name Field */}
					<div>
						<label
							htmlFor="name"
							className="block text-gray-700 font-medium"
						>
							Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter user name"
						/>
					</div>

					{/* Email Field */}
					<div>
						<label
							htmlFor="email"
							className="block text-gray-700 font-medium"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter user email"
						/>
					</div>

					{/* Is Admin Checkbox */}
					<div className="flex items-center space-x-2">
						<input
							id="isAdmin"
							type="checkbox"
							checked={isAdmin}
							onChange={(e) => setIsAdmin(e.target.checked)}
							className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label
							htmlFor="isAdmin"
							className="text-gray-700 font-medium"
						>
							Is Admin
						</label>
					</div>

					{/* Buttons */}
					<div className="flex justify-end space-x-4 mt-4">
						<button
							type="button"
							onClick={() => navigate("/admin/users")}
							className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
						>
							Update
						</button>
					</div>
					{loadingUpdate && <LoadingBox />}
				</form>
			)}
		</div>
	);
}

export default UserEditScreen;
