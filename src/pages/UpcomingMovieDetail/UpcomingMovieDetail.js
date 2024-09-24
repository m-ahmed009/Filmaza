import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { db, auth } from '../../Firebase'; // Ensure Firebase config is correct
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; 
import { Button, Form } from 'react-bootstrap';
import { FaPlayCircle } from 'react-icons/fa';
import './UpcomingMovieDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPaperPlane, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/footer/Footer';

const UpcomingMovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Google Auth and User Handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Fetch Movie Data
  useEffect(() => {
    const getMovieData = async () => {
      try {
        const movieRef = doc(db, "upcomingMovies", id);
        const movieSnap = await getDoc(movieRef);

        if (movieSnap.exists()) {
          setMovie(movieSnap.data());
        } else {
          console.log("No such movie found!");
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    getMovieData();
  }, [id]);

  // Fetch Comments
  useEffect(() => {
    const q = query(collection(db, "upcomingMovies", id, "comments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let commentsList = [];
      snapshot.forEach((doc) => {
        commentsList.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsList);
    });
    return () => unsubscribe();
  }, [id]);

  const handleAddComment = async () => {
    if (!user) {
      alert("You must be logged in to post a comment!");
      return;
    }

    if (comment.trim() === '') {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await addDoc(collection(db, "upcomingMovies", id, "comments"), {
        text: comment,
        user: user.displayName,
        email: user.email,
        profileImage: user.photoURL,
        timestamp: new Date(),
      });
      setComment(''); // Clear comment input after submitting
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  useEffect(() => {
    if (movie && movie.title) {
      document.title = `${movie.title} - Movie Details`;
    }
  }, [movie]);  

  if (!movie) return <div>Loading...</div>;

  return (
    <>
    <div className="bg-dark p-4 mt-1">
      <h1 className="text-light">{movie.title}</h1>
      <p className="text-light">{movie.description}</p>

    {/* Trailer Section */}
    <div className="movie-player mb-4">
    <h4 className="text-light mb-5 play-text mt-5">Trailer <FaPlayCircle /></h4>
    {movie.trailer_url ? (
        <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${movie.trailer_url}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Trailer"
        ></iframe>
    ) : (
        <p className="text-light">No trailer available</p>
    )}
    </div>      

      {/* Comments Section */}
      <h4 className='text-light mt-5'><FontAwesomeIcon icon={faComment} /> Comments</h4>

      {user ? (
        <Form className="mb-4">
          <Form.Group>
            <Form.Label className='text-light d-flex justify-content-end align-items-center'>
              Logout
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="ml-2 cursor-pointer mx-2"
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
                title="Logout"
              />
            </Form.Label>
            <Form.Label className="text-light">Add a Comment:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
          <Button className='mt-2' variant="outline-secondary" onClick={handleAddComment}>
            <FontAwesomeIcon icon={faPaperPlane} /> Submit
          </Button>
        </Form>
      ) : (
        <Button variant=" mb-2 m-0" onClick={handleGoogleSignIn}>
          <img src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Login with Google" />
        </Button>
      )}

      {/* Render Comments */}
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="comment mt-3">
            <div className="d-flex align-items-center">
              {comment.profileImage && (
                <img
                  src={comment.profileImage}
                  alt={comment.user}
                  className="comment-profile-img"
                />
              )}
              <strong className="ml-2">{comment.user}</strong>
            </div>
            <p className="text-light">{comment.text}</p>
          </div>
        ))
      ) : (
        <p className="text-light">No comments yet.</p>
      )}
    </div>
    <Footer />
    </>
  );
};

export default UpcomingMovieDetail;
