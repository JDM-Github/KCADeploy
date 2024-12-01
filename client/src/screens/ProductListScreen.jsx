import React, { useContext, useEffect, useReducer, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import getError from "../utils";
import Modal from "react-bootstrap/Modal";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return {
				...state,
				products: action.payload.products,
				page: action.payload.page,
				pages: action.payload.pages,
				loading: false,
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "CREATE_REQUEST":
			return { ...state, loadingCreate: true };
		case "CREATE_SUCCESS":
			return { ...state, loadingCreate: false };
		case "CREATE_FAIL":
			return { ...state, loadingCreate: false };

		case "DELETE_REQUEST":
			return { ...state, loadingDelete: true, successDelete: false };
		case "DELETE_SUCCESS":
			return { ...state, loadingDelete: false, successDelete: true };
		case "DELETE_FAIL":
			return { ...state, loadingDelete: false, successDelete: false };
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

function ProductListScreen() {
	const [
		{
			loading,
			error,
			products,
			pages,
			loadingCreate,
			loadingDelete,
			successDelete,
		},
		dispatch,
	] = useReducer(reducer, {
		loading: true,
		error: "",
	});

	const navigate = useNavigate();
	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const page = sp.get("page") || 1;

	const { state } = useContext(Store);
	const { userInfo } = state;
	const [showArchived, setShowArchived] = useState(false);
	const [archivedProducts, setArchivedProducts] = useState([]);
	const [loadingArchived, setLoadingArchived] = useState(false);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/admin?page=${page}`,
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
	}, [page, userInfo, successDelete]);

	const createHandler = async () => {
		if (window.confirm("Are You Sure To Create?")) {
			try {
				// dispatch({ type: "CREATE_REQUEST" });

				// const data = await RequestHandler.handleRequest(
				// 	"post",
				// 	"products",
				// 	{},
				// 	{
				// 		headers: {
				// 			Authorization: `Bearer ${userInfo.token}`,
				// 		},
				// 	}
				// );

				// toast.success("product created successfully");
				// dispatch({ type: "CREATE_SUCCESS" });
				navigate(`/admin/product/create`);
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "CREATE_FAIL",
				});
			}
		}
	};

	const deleteHandler = async (product) => {
		if (window.confirm("YOU ARE ABOUT TO DELETE AN ITEM. CONFIRM?")) {
			try {
				await RequestHandler.handleRequest(
					"delete",
					`products/${product.id}`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("PRODUCT HAS BEEN DELETED");
				dispatch({ type: "DELETE_SUCCESS" });
				fetchArchivedProducts();
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "DELETE_FAIL",
				});
			}
		}
	};
	const archiveHandler = async (product) => {
		if (window.confirm("Are you sure to archive this product?")) {
			try {
				await RequestHandler.handleRequest(
					"put",
					`products/${product.id}/archive`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Product has been archived");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "DELETE_FAIL",
				});
			}
		}
	};

	const fetchArchivedProducts = async () => {
		setLoadingArchived(true);
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				"products/archived",
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);
			setArchivedProducts(data);
			setLoadingArchived(false);
		} catch (error) {
			toast.error(getError(error));
			setLoadingArchived(false);
		}
	};

	const restoreHandler = async (product) => {
		if (window.confirm("Are you sure to restore this product?")) {
			try {
				await RequestHandler.handleRequest(
					"put",
					`products/${product.id}/unarchive`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Product has been restored");
				fetchArchivedProducts(); // Refresh the archived products list
			} catch (error) {
				toast.error(getError(error));
			}
		}
	};

	const handleShowArchived = () => {
		setShowArchived(true);
		fetchArchivedProducts();
	};
	return (
		<div
			className="absolute top-0 left-[20vw] w-[80vw] h-[100vh] p-5 box-border"
			style={{
				background: "linear-gradient(180deg, #FFFFFF, #F8F8F8)",
				color: "#333333", // Darker text for better readability
			}}
		>
			{/* Page Header */}
			<Row className="mb-4 items-center">
				<Col>
					<h1 className="text-3xl font-semibold text-gray-800">
						PRODUCTS
					</h1>
				</Col>
				<Col className="text-end">
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							className="bg-yellow-400 text-black py-2 px-4 rounded hover:bg-yellow-500 transition duration-200"
							onClick={createHandler}
						>
							Create Product
						</button>
						<button
							className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
							onClick={handleShowArchived}
						>
							View Archived Products
						</button>
					</div>
				</Col>
			</Row>

			{/* Loading/Error State */}
			{loadingCreate && <LoadingBox />}
			{loadingDelete && <LoadingBox />}
			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<>
					{/* Products Table */}
					<table className="w-full text-left border border-gray-300 text-gray-800">
						<thead className="bg-gray-100 text-gray-700">
							<tr>
								<th className="px-4 py-2">ID</th>
								<th className="px-4 py-2">NAME</th>
								<th className="px-4 py-2">PRICE</th>
								<th className="px-4 py-2">CATEGORY</th>
								<th className="px-4 py-2 text-center">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{reverseArr(products).map((product) => (
								<tr
									key={product.id}
									className="hover:bg-gray-200 transition cursor-pointer"
								>
									<td className="px-4 py-2">{product.id}</td>
									<td className="px-4 py-2">
										{product.name}
									</td>
									<td className="px-4 py-2">
										₱ {product.price.toFixed(2)}
									</td>
									<td className="px-4 py-2">
										{product.category}
									</td>

									<td className="px-4 py-2 flex justify-center space-x-2">
										<button
											type="button"
											className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition duration-200 shadow-md"
											onClick={() =>
												navigate(
													`/admin/product/${product.id}`
												)
											}
										>
											Edit
										</button>
										<button
											type="button"
											className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition duration-200 shadow-md"
											onClick={() =>
												archiveHandler(product)
											}
										>
											Archive
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Pagination */}
					<div className="mt-4 flex justify-center space-x-2">
						{[...Array(pages).keys()].map((x) => (
							<Link
								key={x + 1}
								to={`/admin/products?page=${x + 1}`}
								className={`px-4 py-2 rounded text-gray-800 ${
									x + 1 === Number(pages)
										? "bg-yellow-500 text-black"
										: "bg-gray-200 text-gray-600 hover:bg-gray-300"
								} transition duration-200`}
							>
								{x + 1}
							</Link>
						))}
					</div>
				</>
			)}

			{/* Archived Products Modal */}
			<Modal
				show={showArchived}
				onHide={() => setShowArchived(false)}
				size="lg"
				className="text-gray-800"
			>
				<Modal.Header closeButton className="bg-gray-100 text-gray-800">
					<Modal.Title>Archived Products</Modal.Title>
				</Modal.Header>
				<Modal.Body className="bg-white">
					{loadingArchived ? (
						<LoadingBox />
					) : archivedProducts.length === 0 ? (
						<MessageBox>No archived products found</MessageBox>
					) : (
						<table className="w-full text-left border border-gray-300 text-gray-800">
							<thead className="bg-gray-100 text-gray-700">
								<tr>
									<th className="px-4 py-2">ID</th>
									<th className="px-4 py-2">NAME</th>
									<th className="px-4 py-2">PRICE</th>
									<th className="px-4 py-2 text-center">
										ACTIONS
									</th>
								</tr>
							</thead>
							<tbody>
								{archivedProducts.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-gray-50 transition cursor-pointer"
									>
										<td className="px-4 py-2">
											{product.id}
										</td>
										<td className="px-4 py-2">
											{product.name}
										</td>
										<td className="px-4 py-2">
											${product.price.toFixed(2)}
										</td>
										<td className="px-4 py-2 flex justify-center space-x-2">
											<button
												type="button"
												className="bg-green-400 text-white py-1 px-3 rounded shadow hover:bg-green-500 hover:shadow-lg transition duration-200"
												onClick={() =>
													restoreHandler(product)
												}
											>
												Restore
											</button>
											<button
												type="button"
												className="bg-red-400 text-white py-1 px-3 rounded shadow hover:bg-red-500 hover:shadow-lg transition duration-200"
												onClick={() =>
													deleteHandler(product)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</Modal.Body>
				<Modal.Footer className="bg-gray-100">
					<Button
						variant="secondary"
						className="bg-gray-200 hover:bg-gray-300 transition duration-200"
						onClick={() => setShowArchived(false)}
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default ProductListScreen;
