import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThankYou.css';

const thankYouQuotes = [
  "Great job! Your dedication brings joy to many doorsteps. Thank you for your effort — have a wonderful day ahead!",
  "Your work makes a difference every day. Thank you for your dedication!",
  "Thanks for delivering smiles and essentials – you're a real hero!",
  "Thank you! Your delivery has made someone’s day easier!",
];

const ThankYou = () => {
  const navigate = useNavigate();

  const randomQuote = thankYouQuotes[Math.floor(Math.random() * thankYouQuotes.length)];

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/delivery-dashboard'); // ✅ Go directly to Home
    }, 2000); // ✅ After 2 seconds

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="thank-you-page">
      <h1>🎉 Delivered Successfully!</h1>
      <h2>Thank you!</h2>
      <p className="quote">{randomQuote}</p>
    </div>
  );
};

export default ThankYou;
