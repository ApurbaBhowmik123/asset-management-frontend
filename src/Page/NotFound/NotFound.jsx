import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          Oops! The page you're looking for seems to have wandered off into the digital void.
        </p>
        <div style={styles.actions}>
          <button onClick={handleGoBack} style={styles.secondaryButton}>
            Go Back
          </button>
          <button onClick={handleGoHome} style={styles.primaryButton}>
            Go Home
          </button>
        </div>
        <div style={styles.animationContainer}>
          <div style={styles.astronaut}>👨‍🚀</div>
          <div style={styles.planet}>🪐</div>
          <div style={styles.star1}>⭐</div>
          <div style={styles.star2}>⭐</div>
          <div style={styles.star3}>⭐</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #751111ff 0%, #eb3f48ff 100%)',
    padding: '20px',
  },
  content: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  errorCode: {
    fontSize: '120px',
    fontWeight: 'bold',
    color: '#db3027',
    margin: '0',
    lineHeight: '1',
    opacity: '0.8',
    textShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: '20px 0 10px',
    fontWeight: '600',
  },
  message: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  primaryButton: {
    padding: '12px 30px',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #db3027 0%, #764ba2 100%)',
    color: 'white',
  },
  secondaryButton: {
    padding: '12px 30px',
    border: '2px solid #db3027',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    color: '#667eea',
  },
  animationContainer: {
    position: 'relative',
    height: '120px',
  },
  astronaut: {
    fontSize: '40px',
    position: 'absolute',
    top: '50%',
    left: '30%',
    transform: 'translate(-50%, -50%)',
    animation: 'float 6s ease-in-out infinite',
  },
  planet: {
    fontSize: '60px',
    position: 'absolute',
    top: '50%',
    right: '30%',
    transform: 'translate(50%, -50%)',
  },
  star1: {
    fontSize: '20px',
    position: 'absolute',
    top: '20%',
    left: '20%',
    animation: 'twinkle 4s ease-in-out infinite',
  },
  star2: {
    fontSize: '25px',
    position: 'absolute',
    top: '60%',
    left: '10%',
    animation: 'twinkle 5s ease-in-out infinite 1s',
  },
  star3: {
    fontSize: '18px',
    position: 'absolute',
    top: '30%',
    right: '15%',
    animation: 'twinkle 3s ease-in-out infinite 0.5s',
  },
};

// Add the keyframes to the document
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes float {
    0% { transform: translate(-50%, -50%); }
    50% { transform: translate(-50%, -60%); }
    100% { transform: translate(-50%, -50%); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes twinkle {
    0% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0.5; transform: scale(1); }
  }
`, styleSheet.cssRules.length);

export default NotFound;
