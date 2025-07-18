import { useSelector } from "react-redux";
import { RootState } from "reduxComponents/store";

export const useUser = () => {
  return useSelector((state: RootState) => state.auth);
};
