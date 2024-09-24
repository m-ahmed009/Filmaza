import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage, auth } from '../../Firebase'; // Ensure Firebase config is correct
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Add signInWithPopup and GoogleAuthProvider
import { faComment, faPaperPlane, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './MovieDetail.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlayCircle } from "react-icons/fa";
import Footer from '../../components/footer/Footer';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  // Handle Google Auth
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

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  // Logout Functionality
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out from Firebase
      setUser(null); // Clear user state
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Fetch Movie Data
  useEffect(() => {
    const getMovieData = async () => {
      try {
        const movieRef = doc(db, "movies", id);
        const movieSnap = await getDoc(movieRef);

        if (movieSnap.exists()) {
          let movieData = movieSnap.data();

          // Convert Firestore timestamp to a readable date format
          if (movieData.release_date && movieData.release_date.seconds) {
            movieData.release_date = new Date(movieData.release_date.seconds * 1000).toLocaleDateString();
          }

          // Fetch image URLs from Firebase Storage
          const bannerUrl = await getDownloadURL(ref(storage, `banners/${movieData.banner_image}`));
          const imageUrl = await getDownloadURL(ref(storage, `images/${movieData.image}`));

          setMovie({ ...movieData, banner_image: bannerUrl, image: imageUrl });
        } else {
          console.log("No such movie found!");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getMovieData();
  }, [id]);

  // Fetch Comments
  useEffect(() => {
    const q = query(collection(db, "movies", id, "comments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let commentsList = [];
      snapshot.forEach((doc) => {
        commentsList.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsList);
    });
    return () => unsubscribe();
  }, [id]);

  const handleWatchTrailer = () => {
    if (movie.id) {
      navigate(`/trailer/${movie.id}`);
    }
  };

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
      await addDoc(collection(db, "movies", id, "comments"), {
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

  // Extract YouTube video ID from URL if necessary
  const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  return (
    <div className='bg-dark m-0'>
      <Container className="mt-1">
        <Row>
          {/* Movie Banner */}
          <Col md={12} className="mb-4">
            <div className="movie-banner" style={{ backgroundImage: `url(${movie.banner_image})` }}>
              <div className="movie-banner-content">
                <Row>
                  <Col md={4} className="banner-poster">
                    <img src={movie.image} alt={movie.title} className="img-fluid" />
                  </Col>
                  <Col md={8} className="banner-info">
                    <h1>{movie.title}</h1>
                    <p className="release-date">Release Date: {movie.release_date}</p>
                    <p>{movie.description}</p>
                    <Button className='mx-2' variant="btn btn-outline-danger" href={movie.movie_url} target="_blank">
                      Watch Now <FaPlayCircle className="material-icons" />
                    </Button>
                    <Button 
                      variant="btn btn-outline-warning" 
                      onClick={handleWatchTrailer}
                      disabled={!movie.trailer_url}
                    >
                      Trailer <FaPlayCircle className="material-icons" />
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          {/* Trailer Section */}
          <Col md={12} className="mb-4 mt-5 pt-5">
            <h4 className='text-light mb-5 play-text'>Trailer <FaPlayCircle className="material-icons" /></h4>
            <div className="movie-player">
              {movie.trailer_url ? (
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${extractVideoId(movie.trailer_url)}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Trailer"
                ></iframe>
              ) : (
                <p className="text-light">No trailer available</p>
              )}
            </div>
          </Col>

          {/* Full Movie Section */}
          <Col md={12}>
            <h4 className='text-light mt-5 play-text'>Full Movie <FaPlayCircle className="material-icons" /></h4>
            <Card className="mb-4 mt-5">
              <Card.Body>
                <div className="trailer-player mt-5">
                  {movie.movie_url ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={movie.movie_url}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Full Movie"
                    ></iframe>
                  ) : (
                    <p className="text-light">No movie available</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Comment Section */}
          <Col md={12} className="mt-5">
          <h4 className='text-light mb-4 mt-5 play-text'><FontAwesomeIcon icon={faComment} /> Comments </h4>
            
            {/* Only show comment form to logged-in users */}
            {user ? (
              <Form className="mb-4">
                <Form.Group>
                <Form.Label className='text-light  d-flex justify-content-end align-items-center'>Logout
                      {user && (
                      <FontAwesomeIcon 
                        icon={faSignOutAlt} 
                        className="ml-2 cursor-pointer mx-2"
                        style={{cursor:'pointer'}}
                        onClick={handleLogout} 
                        title="Logout" 
                      />
                    )}
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
              <>
                <p className="text-light">You must be logged in to post a comment.</p>
                <Button variant=" mb-2" onClick={handleGoogleSignIn}>
                  <img src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Login with Google" />
                </Button>
              </>
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
                        className="comment-profile-img rounded-circle"
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
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MovieDetail;
