import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Store } from "../Store";
import { useNavigate, useParams } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";

import { toast } from "react-toastify";

function reducer(state, action) {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true, error: "" };
		case "FETCH_SUCCESS":
			return {
				...state,
				loading: false,
				order: action.payload,
				error: "",
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		default:
			return state;
	}
}

function ShippingAddressScreen() {
	const navigate = useNavigate();
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const {
		userInfo,
		cart: { shippingAddress },
	} = state;

	const handleChange = (event) => {
		const newValue = event.target.value.replace(/[^a-zA-Z0-9 ,.#]/g, "");
		setAddress(newValue);
	};

	const handleLastName = (event) => {
		const newValue = event.target.value.replace(/[^a-zA-Z ]/g, "");
		setLastName(newValue);
	};

	const handleFullName = (event) => {
		const newValue = event.target.value.replace(/[^a-zA-Z ]/g, "");
		setFullName(newValue);
	};

	const handlePhoneNumber = (event) => {
		const digits = event.target.value.replace(/[^0-9 ]/g, "");
		const newValue = digits.slice(0, 11);
		setPostalCode(newValue);
	};

	const [fullName, setFullName] = useState(
		shippingAddress.fullName || userInfo.name
	);
	const [LastName, setLastName] = useState(
		shippingAddress.LastName || userInfo.lastname
	);
	const [address, setAddress] = useState(shippingAddress.address || "");
	const [city, setCity] = useState(shippingAddress.city || "");
	const [postalCode, setPostalCode] = useState(
		shippingAddress.postalCode || ""
	);

	useEffect(() => {
		if (!userInfo) {
			navigate("/signin?redirect=/shipping");
		}
	}, [userInfo, navigate]);

	const submitHandler = (e) => {
		e.preventDefault();

		if (postalCode.length !== 11) {
			toast.error("Please enter 11 digits of number.");
			return;
		}
		ctxDispatch({
			type: "SAVE_SHIPPING_ADDRESS",
			payload: {
				LastName,
				fullName,
				address,
				city,
				postalCode,
			},
		});
		localStorage.setItem(
			"shippingAddress",
			JSON.stringify({
				LastName,
				fullName,
				address,
				city,
				postalCode,
			})
		);
		navigate("/payment");
	};
	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<Helmet>
				<title>Shipping Address</title>
			</Helmet>
			<CheckoutSteps step1 step2 />

			<div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-2xl font-semibold mb-6 text-center">
					Shipping Address
				</h1>
				<form onSubmit={submitHandler} className="space-y-4">
					<div className="flex gap-4">
						<div className="w-1/2">
							<label
								htmlFor="fullName"
								className="block text-sm font-medium mb-2"
							>
								First Name
							</label>
							<input
								type="text"
								id="fullName"
								required
								value={fullName}
								onChange={handleFullName}
								placeholder="Enter your first name"
								className={`w-full p-3 border ${
									fullName.length > 0 &&
									!/^[a-zA-Z ]+$/.test(fullName)
										? "border-red-500"
										: "border-gray-300"
								} rounded-lg`}
							/>
							<p className="text-sm text-gray-500">
								Letters Only
							</p>
						</div>

						<div className="w-1/2">
							<label
								htmlFor="surname"
								className="block text-sm font-medium mb-2"
							>
								Surname
							</label>
							<input
								type="text"
								id="surname"
								required
								value={LastName}
								onChange={handleLastName}
								placeholder="Enter your surname"
								className={`w-full p-3 border ${
									LastName.length > 0 &&
									!/^[a-zA-Z ]+$/.test(LastName)
										? "border-red-500"
										: "border-gray-300"
								} rounded-lg`}
							/>
							<p className="text-sm text-gray-500">
								Letters Only
							</p>
						</div>
					</div>

					<div>
						<label
							htmlFor="address"
							className="block text-sm font-medium mb-2"
						>
							House Number/Purok/Sitio/Village/Subdivision
						</label>
						<input
							type="text"
							id="address"
							required
							value={address}
							onChange={handleChange}
							placeholder="Enter your address"
							className={`w-full p-3 border ${
								address.length > 0 &&
								!/^[a-zA-Z0-9 ,.#]+$/.test(address)
									? "border-red-500"
									: "border-gray-300"
							} rounded-lg`}
						/>
						<p className="text-sm text-gray-500">
							Enter: a-z A-Z 0-9 , . #
						</p>
					</div>

					<div>
						<label
							htmlFor="city"
							className="block text-sm font-medium mb-2"
						>
							Barangay
						</label>
						<select
							id="city"
							value={city}
							onChange={(e) => setCity(e.target.value)}
							required
							className="w-full p-3 border border-gray-300 rounded-lg"
						>
							<option value="Bagong Kalsada">
								Bagong Kalsada
							</option>
							<option value="Banadero">Banadero</option>
							<option value="Barandal">Barandal</option>
							<option value="Batino">Batino</option>
							<option value="Bucal">Bucal</option>
							<option value="Bunggo">Bunggo</option>
							<option value="Halang">Halang</option>
							<option value="Hornalan">Hornalan</option>
							<option value="Lawa">Lawa</option>
							<option value="Lecheria">Lecheria</option>
							<option value="Lingga">Lingga</option>
							<option value="Makiling">Makiling</option>
							<option value="Majada Out">Majada Out</option>
							<option value="Mayapa">Mayapa</option>
							<option value="Milagrosa">Milagrosa</option>
							<option value="Paciano Rizal">Paciano Rizal</option>
							<option value="Palingon">Palingon</option>
							<option value="Parian">Parian</option>
							<option value="Real">Real</option>
							<option value="Saimsim">Saimsim</option>
							<option value="Sampiruhan">Sampiruhan</option>
							<option value="San Cristobal">San Cristobal</option>
							<option value="San Juan">San Juan</option>
							<option value="Sirang Lupa">Sirang Lupa</option>
							<option value="Tulo">Tulo</option>
							<option value="Turbina">Turbina</option>
							<option value="Uno">Uno</option>
							{/* Add more options as needed */}
						</select>
					</div>

					<div>
						<label
							htmlFor="postalCode"
							className="block text-sm font-medium mb-2"
						>
							Phone Number
						</label>
						<input
							min={11}
							type="tel"
							id="postalCode"
							required
							value={postalCode}
							onChange={handlePhoneNumber}
							placeholder="Enter your phone number"
							className="w-full p-3 border border-gray-300 rounded-lg"
						/>
					</div>

					<div className="text-center">
						<button
							type="submit"
							className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition"
						>
							Continue
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ShippingAddressScreen;
