import React, { useContext, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Store } from "../Store";
import { toast } from "react-toastify";
import getError from "../utils";
import {
	Box,
	TextField,
	Grid,
	Button,
	Card,
	CardContent,
	Typography,
} from "@mui/material";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "UPDATE_REQUEST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };
		default:
			return state;
	}
};

export default function ProfileScreen() {
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { userInfo } = state;
	const [name, setName] = useState(userInfo.name);
	const [middlename, setMiddleName] = useState(userInfo.middlename);
	const [lastname, setLastName] = useState(userInfo.lastname);
	const [suffix, setSuffix] = useState(userInfo.suffix);
	const [email, setEmail] = useState(userInfo.email);
	const [birthday, setBirthday] = useState(
		new Date(userInfo.birthday).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	);
	const [location, setLocation] = useState(userInfo.location);
	const [phoneNum, setPhoneNum] = useState(userInfo.phoneNum);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
		loadingUpdate: false,
	});

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"users/profile",
				{
					id: userInfo.id,
					name,
					lastname,
					middlename,
					suffix,
					location,
					phoneNum,
					password,
					confirmPassword,
				},
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);
			dispatch({
				type: "UPDATE_SUCCESS",
			});
			ctxDispatch({ type: "USER_SIGNIN", payload: data });
			localStorage.setItem("userInfo", JSON.stringify(data));
			toast.success("User updated successfully");
		} catch (err) {
			dispatch({
				type: "FETCH_FAIL",
			});
			toast.error(getError(err));
		}
	};

	return (
		<div className="container flex justify-center mt-10">
			<Helmet>
				<title>User Profile</title>
			</Helmet>

			{/* Card Wrapper */}
			<Card
				sx={{
					maxWidth: 600,
					width: "100%",
					borderRadius: "10px",
					boxShadow: 3,
				}}
			>
				<CardContent>
					<Typography
						variant="h5"
						align="center"
						gutterBottom
						sx={{ fontWeight: 600 }}
					>
						User Profile
					</Typography>

					<form onSubmit={submitHandler} className="space-y-4">
						<Grid container spacing={2}>
							{/* First Name, Middle Name, Last Name */}
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									label="First Name"
									variant="outlined"
									value={name}
									required
									onChange={(e) => setName(e.target.value)}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									label="Middle Name"
									variant="outlined"
									value={middlename}
									required
									onChange={(e) =>
										setMiddleName(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									label="Last Name"
									variant="outlined"
									value={lastname}
									required
									onChange={(e) =>
										setLastName(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>

							{/* Suffix, Birthday */}
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									label="Suffix"
									variant="outlined"
									value={suffix}
									onChange={(e) => setSuffix(e.target.value)}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									label="Birthday"
									variant="outlined"
									value={birthday}
									disabled
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>

							{/* Address */}
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="Address"
									variant="outlined"
									value={location}
									onChange={(e) =>
										setLocation(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>

							{/* Phone Number, Email Address */}
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Phone Number"
									variant="outlined"
									value={phoneNum}
									onChange={(e) =>
										setPhoneNum(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Email Address"
									variant="outlined"
									value={email}
									disabled
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>

							{/* Password and Confirm Password */}
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="New Password"
									variant="outlined"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Confirm Password"
									variant="outlined"
									type="password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
										},
									}}
								/>
							</Grid>
						</Grid>

						{/* Submit Button */}
						<div className="mt-6 flex justify-center">
							<Button
								variant="contained"
								color="primary"
								type="submit"
								disabled={loadingUpdate}
								sx={{
									padding: "10px 20px",
									borderRadius: "20px",
									boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
									textTransform: "none",
									"&:hover": {
										boxShadow:
											"0px 6px 8px rgba(0, 0, 0, 0.15)",
									},
								}}
							>
								{loadingUpdate ? "Updating..." : "Update"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
