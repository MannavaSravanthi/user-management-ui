
import Cookies from 'js-cookie';

export const useAuth = () => {
  const authToken = Cookies.get('authToken');
  return !!authToken;
};
