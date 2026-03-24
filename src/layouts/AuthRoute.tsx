import { Navigate } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { useSelector, shallowEqual } from "react-redux";

interface MenuItem {
  menuLinkName?: string | null;
  leaf?: number;
  children?: MenuItem[];
}
interface RootState {
  menu: {
    items: MenuItem[];
  };
}
interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactNode;
}
const extractAllowedRoutes = (
  permissionJson: MenuItem[] | null | undefined
): string[] => {
  const routes: string[] = ["/apps/dashboard"];
  if (!permissionJson) return routes;
  const traverse = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (item.leaf === 1 && item.menuLinkName) {
        routes.push(`/apps${item.menuLinkName}`);
      }
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };
  traverse(permissionJson);
  return Array.from(new Set(routes));
};

const AuthRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
}) => {
  const menu = useSelector(
    (state: RootState) => state.menu.items,
    shallowEqual
  );

  const baseUrl = window.location.pathname;
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }
    if (!menu || menu.length === 0) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const allowedRoutes = extractAllowedRoutes(menu);
    const authorized = allowedRoutes.includes(baseUrl);
    setIsAuthorized(authorized);
    setIsChecking(false);

    if (!authorized) {
      setShowRedirect(false);
      setCountdown(5);
    }
  }, [menu, baseUrl, isAuthenticated]);

  useEffect(() => {
    if (!isAuthorized && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    } else if (!isAuthorized && countdown === 0) {
      setShowRedirect(true);
    }
  }, [countdown, isAuthorized]);


  if (!isAuthenticated) return <Navigate to="/" />;

  if (isChecking) return <div>Loading...</div>;

  if (!isAuthorized) {
    return showRedirect ? (
      <>
        <Navigate to="/dashboard" replace />
        {children}
      </>
    ) : (
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#ffebeb",
          color: "#b00020",
        }}
      >
        ⚠️ You do not have permission to access this page. Redirecting in{" "}
        {countdown} second{countdown !== 1 ? "s" : ""}...
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRoute;