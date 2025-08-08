import { FRONTEND_LOGIN_URL } from 'config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activateUser } from 'services/apiRequestsUser';
import Loading from "components/Loading";


const UserActivation: React.FC = () => {
  const { userId, token } = useParams<Record<string, string>>();
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const activate = async () => {
      console.log()
      const parsedUserId = userId ? Number(userId) : NaN;
      if (token && !success && !isNaN(parsedUserId)) {
        setLoading(true);
        try {
          const response = await activateUser(parsedUserId, token);
          if (response && response.status === 200) {
            setSuccess(true);
            navigate(`${FRONTEND_LOGIN_URL}`, { replace: true });
          } else {
            setMessage("Failed to activate.");
          }
        } catch (error) {
          setMessage("An error occurred. Contact administrator.");
        } finally {
          setLoading(false);
        }
      } else if (isNaN(parsedUserId)) {
        setMessage("Invalid user ID.");
      }
    };

    activate();
  }, [token, success, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center">
      {loading ? (
        <Loading />
      ) : (
        <h2>{message}</h2>
      )}
    </div>
  );
};

export default UserActivation;