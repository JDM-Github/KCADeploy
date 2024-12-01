import React, { useContext, useEffect, useReducer } from "react";
import { Store } from "../Store";
import axios from "axios";
import getError from "../utils";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, users: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "DELETE_REQUEST":
			return { ...state, loadingDelete: true, successDelete: false };
		case "DELETE_SUCCESS":
			return { ...state, loadingDelete: false, successDelete: true };
		case "DELETE_FAIL":
			return { ...state, loadingDelete: false };
		case "DELETE_RESET":
			return { ...state, loadingDelete: false, successDelete: false };

		default:
			return state;
	}
};

function UserListScreen() {
	const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	const { state } = useContext(Store);
	const { userInfo } = state;
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });

				const data = await RequestHandler.handleRequest(
					"get",
					`users`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		if (successDelete) {
			dispatch({ type: "DELETE_RESET" });
		} else {
			fetchData();
		}
	}, [userInfo, successDelete]);

	const deleteHandler = async (user) => {
		if (window.confirm("You Are About To Delete A User. Confirm?")) {
			try {
				dispatch({ type: "DELETE_REQUEST" });

				await RequestHandler.handleRequest(
					"delete",
					`users/${user.id}`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("USER HAS BEEN DELETED");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (err) {
				toast.error(getError(err));
				dispatch({ type: "DELETE_FAIL" });
			}
		}
	};

	return (
		<div className="absolute top-0 left-[20vw] w-[80vw] p-5 box-border bg-white text-gray-800">
			<Helmet>
				<title>USERS</title>
			</Helmet>
			<h1 className="text-3xl font-semibold text-gray-800">USERS</h1>
			{loadingDelete && <LoadingBox />}

			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<table className="w-full text-left border border-gray-300 text-gray-800">
					<thead className="bg-gray-100 text-gray-700">
						<tr>
							<th className="px-4 py-2">USER'S ID</th>
							<th className="px-4 py-2">NAME</th>
							<th className="px-4 py-2">EMAIL</th>
							<th className="px-4 py-2">IS ADMIN</th>
							<th className="px-4 py-2 text-center">ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr
								key={user.id}
								className="hover:bg-gray-200 transition cursor-pointer"
							>
								<td className="px-4 py-2">{user.id}</td>
								<td className="px-4 py-2">{user.name}</td>
								<td className="px-4 py-2">{user.email}</td>
								<td className="px-4 py-2">
									{user.isAdmin ? "Admin" : "Not Admin"}
								</td>
								<td className="px-4 py-2 flex justify-center space-x-2">
									<div className="flex justify-evenly space-x-2">
										<button
											type="button"
											className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition duration-200 shadow"
											onClick={() =>
												navigate(
													`/admin/user/${user.id}`
												)
											}
										>
											Edit
										</button>
										<button
											type="button"
											className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-200 shadow"
											onClick={() => deleteHandler(user)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default UserListScreen;
