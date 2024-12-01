import React, { useReducer, useEffect, useState, useRef } from "react";
import logger from "use-reducer-logger";
import { Form, Button, Spinner } from "react-bootstrap";
import "./ChatHead.css";
import RequestHandler from "../functions/RequestHandler.js";
import ChatImage from "./ChatImage.jsx";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, chats: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		case "SEND_REQUEST":
			return { ...state, sending: true };
		case "SEND_SUCCESS":
			return {
				...state,
				sending: false,
			};
		case "SEND_FAIL":
			return { ...state, sending: false, error: action.payload };
		default:
			return state;
	}
};

export default function AdminChatScreen({ userInfo }) {
	const [{ loading, error, chats, sending }, dispatch] = useReducer(
		logger(reducer),
		{
			loading: true,
			chats: [],
			error: "",
			sending: false,
		}
	);

	const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false);
	const [selectedUserChat, setSelectedUserChat] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef(null);
	const [selectedImage, setSelectedImage] = useState(null);

	const [isZoomed, setIsZoomed] = useState(false);
	const [zoomedImage, setZoomedImage] = useState(null);

	const handleImageClick = (imageSrc) => {
		setIsZoomed(true);
		setZoomedImage(imageSrc);
	};

	const closeModal = () => {
		setIsZoomed(false);
		setZoomedImage(null);
	};

	const selectUser = (user) => {
		setSelectedUserChat(user);
		setIsMessageBoxVisible(true);
	};
	const toggleMessageBox = () => {
		setIsMessageBoxVisible((prev) => !prev);
	};

	const fetchAllChats = async () => {
		dispatch({ type: "FETCH_REQUEST" });
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				`chats/admin/get_all_chats`,
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);

			dispatch({ type: "FETCH_SUCCESS", payload: data });
		} catch (error) {
			dispatch({
				type: "FETCH_FAIL",
				payload: error.response
					? error.response.data.message
					: error.message,
			});
		}
	};

	const handleSendMessage = async () => {
		if (inputValue.trim() && selectedUserChat) {
			dispatch({ type: "SEND_REQUEST" });
			try {
				const newMessage = {
					message: inputValue,
					user: userInfo.id,
					image: selectedImage,
				};

				const data = await RequestHandler.handleRequest(
					"post",
					`chats/admin/reply/${selectedUserChat.userId}`,
					newMessage,
					{
						headers: {
							Authorization: `Bearer ${userInfo.token}`,
							"Content-Type": "multipart/form-data",
						},
					}
				);

				const updatedChat = {
					...selectedUserChat,
					messages: [
						...selectedUserChat.messages,
						{
							user: userInfo.id,
							text: inputValue,
							image: data.image,
							sender: "admin",
							createdAt: Date.now(),
						},
					],
				};
				setSelectedImage(null);
				setSelectedUserChat(updatedChat);

				dispatch({ type: "SEND_SUCCESS" });
				setInputValue("");
			} catch (error) {
				dispatch({
					type: "SEND_FAIL",
					payload: error.response
						? error.response.data.message
						: error.message,
				});
			}
		}
	};

	const scrollDown = (behavior) => {
		if (messagesEndRef.current)
			messagesEndRef.current.scrollIntoView({ behavior: behavior });
	};

	useEffect(() => {
		if (userInfo) fetchAllChats();
		scrollDown("smooth");
	}, [userInfo]);

	useEffect(() => scrollDown("instant"), [isMessageBoxVisible]);
	useEffect(() => scrollDown("smooth"), [selectedUserChat]);

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	if (!userInfo) {
		return null;
	}

	return (
		<div
			style={{
				position: "absolute",
				top: "0",
				left: "0",
				padding: "20px",
				zIndex: "999",
			}}
		>
			{isZoomed && zoomedImage && (
				<div className="message-modal" onClick={closeModal}>
					<img
						className="modal-content"
						src={zoomedImage}
						alt="Zoomed"
					/>
				</div>
			)}
			{loading ? (
				<p>Loading chats...</p>
			) : error ? (
				<p className="error">{error}</p>
			) : (
				<div className="chat-dashboard">
					<img
						src="https://cdn-icons-png.flaticon.com/512/309/309666.png"
						alt="Chat Icon"
						className="chat-heads"
						onClick={toggleMessageBox}
					/>
					{isMessageBoxVisible ? (
						<div
							className={`user-list ${
								selectedUserChat ? "opened" : ""
							}`}
						>
							<div
								style={{
									backgroundColor: "black",
									padding: "10px 10px",
									color: "white",
								}}
							>
								All User
							</div>
							<div className="user-list-container">
								{chats.map((chat) => (
									<div
										key={chat.User.name}
										onClick={() => selectUser(chat)}
									>
										{chat.User.name}
									</div>
								))}
							</div>
						</div>
					) : null}

					<div
						className={`message-box ${
							isMessageBoxVisible ? "expand" : "collapse"
						}`}
					>
						{selectedUserChat ? (
							<>
								<div
									style={{
										backgroundColor: "black",
										padding: "10px 10px",
										color: "white",
									}}
								>
									{selectedUserChat.User.name}
								</div>

								<div className="message-container z-100">
									{selectedUserChat.messages.map(
										(msg, index) => (
											<>
												<ChatImage
													handleImageClick={
														handleImageClick
													}
													msg={msg}
													userInfo={userInfo}
												/>
												<div
													key={index}
													className={`message ${
														msg.sender === "admin"
															? "your-message"
															: "their-message"
													}`}
												>
													<strong>
														{msg.sender === "admin"
															? "Service"
															: selectedUserChat
																	.User.name}
														:
													</strong>{" "}
													{msg.text}
												</div>
											</>
										)
									)}
									<div ref={messagesEndRef} />
								</div>

								{selectedImage && (
									<div className="image-preview">
										<img
											src={URL.createObjectURL(
												selectedImage
											)}
											alt="Uploaded"
										/>
									</div>
								)}

								<div className="chat-input">
									<input
										type="text"
										value={inputValue}
										onChange={(e) =>
											setInputValue(e.target.value)
										}
										onKeyDown={handleKeyPress}
										placeholder="Type a reply..."
									/>
									<Form.Control
										type="file"
										id="file-input"
										onChange={(e) =>
											setSelectedImage(e.target.files[0])
										}
										accept="image/*"
									/>
									<label
										htmlFor="file-input"
										className="image-icon"
									>
										<img
											style={{
												width: "40px",
												height: "40px",
											}}
											src="https://i.pinimg.com/474x/e8/ee/07/e8ee0728e1ba12edd484c111c1f492f2.jpg"
											alt="Upload"
										/>
									</label>
									<button
										onClick={handleSendMessage}
										className="send-button"
										disabled={sending}
									>
										{sending ? "Sending..." : "Send"}
									</button>
								</div>
							</>
						) : null}
					</div>
				</div>
			)}
		</div>
	);
}
