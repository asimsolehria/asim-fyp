import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';
import Page from './Page';

function CreatePost(props) {
	const [title, setTitle] = useState();
	const [body, setBody] = useState();
	// const [image, setImage] = useState();
	let image;
	const navigate = useNavigate();
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);

	async function handleSubmit(e) {
		e.preventDefault();
		console.log(image);
		try {
			const formData = new FormData();
			formData.append('image', image);
			formData.append('title', title);
			formData.append('body', body);
			formData.append('token', appState.user.token);
			console.log(formData);
			// const response = await Axios.post('/create-post', {
			// 	title,
			// 	body,
			// 	token: appState.user.token,
			// 	image,
			// });
			const response = await Axios.post('/create-post', formData);
			// Redirect to new post url
			appDispatch({
				type: 'flashMessage',
				value: 'Congrats, you created a new post.',
			});
			navigate(`/post/${response.data}`);
			console.log('New post was created.');
		} catch (e) {
			console.log('There was a problem.');
		}
	}

	return (
		<Page title="Create New Post">
			<form onSubmit={handleSubmit} encType="multipart/form-data">
				<div className="form-group">
					<label htmlFor="post-title" className="text-muted mb-1">
						<small>Title</small>
					</label>
					<input
						onChange={(e) => setTitle(e.target.value)}
						autoFocus
						name="title"
						id="post-title"
						className="form-control form-control-lg form-control-title"
						type="text"
						placeholder=""
						autoComplete="off"
					/>
					<input
						onChange={(e) => {
							image = e.target.files[0];
							console.log(image);
						}}
						type="file"
						name="image"
					></input>
				</div>

				<div className="form-group">
					<label htmlFor="post-body" className="text-muted mb-1 d-block">
						<small>Body Content</small>
					</label>
					<textarea
						onChange={(e) => setBody(e.target.value)}
						name="body"
						id="post-body"
						className="body-content tall-textarea form-control"
						type="text"
					></textarea>
				</div>

				<button className="btn btn-primary">Save New Post</button>
			</form>
		</Page>
	);
}

export default CreatePost;
