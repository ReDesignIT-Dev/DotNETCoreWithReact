import { useSelector } from "react-redux";
import { RootState } from "reduxComponents/store";

export const useAuth = (): boolean => {
  const isLoggedIn: boolean = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn;
};