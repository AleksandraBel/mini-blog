import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold mb-4">403 - Доступ заборонено</h1>
      <p className="mb-4">У вас немає прав для перегляду цієї сторінки.</p>
      <Link to="/" className="text-blue-500 underline">
        Повернутися на головну
      </Link>
    </div>
  );
};

export default Unauthorized;
