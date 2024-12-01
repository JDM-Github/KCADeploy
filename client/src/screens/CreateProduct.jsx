import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import RequestHandler from "../functions/RequestHandler";
const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "UPDATE_REQUEST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

		case "UPLOAD_REQUEST":
			return { ...state, loadingUpload: true, errorUpload: "" };
		case "UPLOAD_SUCCESS":
			return { ...state, loadingUpload: false, errorUpload: "" };
		case "UPLOAD_FAIL":
			return {
				...state,
				loadingUpload: false,
				errorUpload: action.payload,
			};
		default:
			return state;
	}
};

function CreateProduct() {
	const navigate = useNavigate();
	const { state } = useContext(Store);
	const { userInfo } = state;

	const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [image, setImage] = useState("");
	const [images, setImages] = useState([]);
	const [category, setCategory] = useState("");
	const [countInStock, setCountInStock] = useState("0");
	const [brand, setBrand] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			dispatch({ type: "FETCH_REQUEST" });

			setName("Sample Product");
			setPrice(100);
			setImage("");
			setImages([]);
			setCategory("Sample Category");
			setCountInStock(0);
			setBrand("Sample Brand");
			setDescription("Sample Description");
			dispatch({ type: "FETCH_SUCCESS" });
		};
		fetchData();
	}, []);

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			dispatch({ type: "CREATE_REQUEST" });

			const data = await RequestHandler.handleRequest(
				"post",
				"products/create",
				{
					name,
					price,
					image,
					images,
					category,
					brand,
					countInStock,
					description,
				},
				{
					headers: {
						Authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			toast.success("product created successfully");
			dispatch({ type: "CREATE_SUCCESS" });
			navigate("/admin/products");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "UPDATE_FAIL" });
		}
	};

	const uploadFileHandler = async (e, forImages) => {
		const file = e.target.files[0];
		const bodyFormData = new FormData();
		bodyFormData.append("file", file);

		try {
			dispatch({ type: "UPLOAD_REQUEST" });
			const data = await RequestHandler.handleRequest(
				"post",
				"upload",
				bodyFormData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			dispatch({ type: "UPLOAD_SUCCESS" });

			if (forImages) {
				setImages([...images, data]);
			} else {
				setImage(data);
			}
			toast.success("IMAGE UPLOADED. NOW, CLICK ON UPDATE.");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
		}
	};

	const deleteFileHandler = async (fileName) => {
		setImages(images.filter((x) => x !== fileName));
		toast.success("IMAGE HAS BEEN REMOVED. NOW, CLICK ON UPDATE.");
	};

	return (
		<div className="absolute top-[10px] left-[30vw] w-[60vw] mx-auto p-6 bg-white rounded-lg shadow-md">
			<Helmet>
				<title>Create Product {name}</title>
			</Helmet>
			<h1 className="text-2xl font-bold mb-6 text-gray-800">
				Create Product {name}
			</h1>

			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<form onSubmit={submitHandler} className="space-y-4">
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
						/>
					</div>

					<div>
						<label
							htmlFor="price"
							className="block text-gray-700 font-medium"
						>
							Price
						</label>
						<input
							id="price"
							type="number"
							value={price}
							onChange={(e) =>
								setPrice(
									e.target.value >= 100 ? e.target.value : 100
								)
							}
							min="100"
							required
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="imageFile"
							className="block text-gray-700 font-medium"
						>
							Upload Image
						</label>
						<input
							id="imageFile"
							type="file"
							onChange={uploadFileHandler}
							className="w-full px-4 py-2 border rounded-lg"
						/>
						{loadingUpload && <LoadingBox />}
					</div>

					<div>
						<label
							htmlFor="additionalImage"
							className="block text-gray-700 font-medium"
						>
							Additional Images
						</label>
						{images && images.length === 0 && (
							<MessageBox>No Other Images Yet</MessageBox>
						)}
						<ul className="space-y-2">
							{images.map((x) => (
								<li
									key={x}
									className="flex items-center justify-between border rounded-lg p-2 bg-gray-50"
								>
									<input
										type="text"
										value={x}
										readOnly
										className="w-full px-2 py-1 border-none bg-transparent focus:outline-none"
									/>
									<button
										type="button"
										onClick={() => deleteFileHandler(x)}
										className="ml-2 text-red-500 hover:text-red-700"
									>
										<i className="fa fa-times-circle"></i>
									</button>
								</li>
							))}
						</ul>
						<div className="mt-4">
							<label
								htmlFor="additionalImageFile"
								className="block text-gray-700 font-medium"
							>
								Upload Additional Image
							</label>
							<input
								id="additionalImageFile"
								type="file"
								onChange={(e) => uploadFileHandler(e, true)}
								className="w-full px-4 py-2 border rounded-lg"
							/>
							{loadingUpload && <LoadingBox />}
						</div>
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-gray-700 font-medium"
						>
							Category
						</label>
						<input
							id="category"
							type="text"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							required
							placeholder="Enter the product category"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-gray-700 font-medium"
						>
							Description (max 180 characters)
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength="180"
							required
							rows="4"
							placeholder="Enter a detailed description (max 180 characters)"
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="flex justify-end items-center space-x-4 mt-6">
						<button
							type="button"
							className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
							onClick={() => navigate("/admin/products")}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
						>
							Create
						</button>
						{loadingUpdate && <LoadingBox />}
					</div>
				</form>
			)}
		</div>
	);
}

export default CreateProduct;
