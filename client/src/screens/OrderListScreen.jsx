import React, { useContext, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import getError from "../utils";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, orders: action.payload, loading: false };
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

function reverseArr(input) {
	var ret = new Array();
	for (var i = input.length - 1; i >= 0; i--) {
		ret.push(input[i]);
	}
	return ret;
}

function OrderListScreen() {
	const navigate = useNavigate();
	const { state } = useContext(Store);
	const { userInfo } = state;

	const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`orders`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};
		if (successDelete) {
			dispatch({ type: "DELETE_RESET" });
		} else {
			fetchData();
		}
	}, [userInfo, successDelete]);

	const deleteHandler = async (order) => {
		if (window.confirm("You Are About To Delete An Order. Confirm?")) {
			try {
				dispatch({ type: "DELETE_REQUEST" });
				await RequestHandler.handleRequest(
					"delete",
					`orders/${order.id}`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Order Has Been Deleted");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (error) {
				toast.error(getError(error));
				dispatch({ type: "DELETE_FAIL" });
			}
		}
	};

	return (
		<div className="absolute top-0 left-[20vw] w-[80vw] p-5 box-border bg-white text-gray-800">
			<Helmet>
				<title>Orders</title>
			</Helmet>
			<h1 className="text-2xl font-bold mb-6">Customer Orders</h1>
			{loadingDelete && <LoadingBox />}

			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<table className="w-full text-left border border-gray-300 text-gray-800">
					<thead className="bg-gray-100 text-gray-700">
						<tr>
							<th className="px-4 py-2">ID</th>
							<th className="px-4 py-2">USER</th>
							<th className="px-4 py-2">DATE</th>
							<th className="px-4 py-2">TOTAL</th>
							<th className="px-4 py-2">PAID</th>
							<th className="px-4 py-2">STATUS</th>
							<th className="px-4 py-2 text-center">ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr
								key={order.id}
								className="hover:bg-gray-200 transition cursor-pointer"
							>
								<td className="px-4 py-2">{order.id}</td>
								<td className="px-4 py-2">
									{order.User
										? order.User.name
										: "DELETED USER"}
								</td>
								<td className="px-4 py-2">
									{order.createdAt.substring(0, 10)}
								</td>
								<td className="px-4 py-2">
									{order.totalPrice.toFixed(2)}
								</td>
								<td className="px-4 py-2">
									{order.isPaid
										? order.paidAt.substring(0, 10)
										: "Not Yet Paid"}
								</td>
								<td className="px-4 py-2">
									{order.isDelivered
										? order.deliveredAt.substring(0, 10)
										: "Not Yet Delivered"}
								</td>
								<td className="px-4 py-2">
									<div className="flex justify-evenly space-x-2">
										<button
											type="button"
											className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition duration-200 shadow"
											onClick={() =>
												navigate(`/order/${order.id}`)
											}
										>
											View
										</button>
										<button
											type="button"
											className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-200 shadow"
											onClick={() => deleteHandler(order)}
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

export default OrderListScreen;
