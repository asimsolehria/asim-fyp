import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { useParams, Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem or the request was cancelled.");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username;
    }
    return false;
  }

  async function deleteHandler() {
    const areYouSure = window.confirm("Do you really want to delete this post?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
        if (response.data === "Success") {
          // 1. display a flash message
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted." });

          // 2. redirect back to the current user's profile
          navigate(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("There was a problem.");
      }
    }
  }

  // Convert the image URL from backslashes to forward slashes
  const imageUrl = post.image ? post.image.url.replace(/\\/g, "/") : null;

  return (
    <Page title={post.title}>
      <div className="card post-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title">{post.title}</h2>
            {isOwner() && (
              <span className="pt-2">
                <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
                  <i className="fas fa-edit"></i>
                </Link>
                <ReactTooltip id="edit" className="custom-tooltip" />{" "}
                <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
                  <i className="fas fa-trash"></i>
                </a>
                <ReactTooltip id="delete" className="custom-tooltip" />
              </span>
            )}
          </div>
          <p className="text-muted small mb-4">
            <Link to={`/profile/${post.author.username}`} className="post-author">
              <img className="avatar-tiny" src={post.author.avatar} alt="Author Avatar" />
              <span>{post.author.username}</span>
            </Link>
            <span className="post-date">{dateFormatted}</span>
          </p>
          {imageUrl && <img className="post-image" src={`http://localhost:8080/${imageUrl}`} alt="Post Image" />}
          <div className="post-content">
            <ReactMarkdown
              children={post.body}
              allowedElements={["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li"]}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}

export default ViewSinglePost;
