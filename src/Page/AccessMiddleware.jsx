import React from "react";
import { Navigate } from "react-router-dom";

const AccessMiddleware = ({
  children,
  requiredPermission,
  requiredPermissions,
  has_permission,
}) => {
  // Get access object from localStorage
  const accessObj = JSON.parse(localStorage.getItem("myAccess") || "{}");
  // Use slugs array as the actual permissions
  const accessData = accessObj?.data?.slugs || [];

  if (requiredPermission && requiredPermissions) {
    throw new Error(
      "Only one of 'requiredPermission' or 'requiredPermissions' should be provided."
    );
  }

  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = accessData.includes(requiredPermission);
  } else if (requiredPermissions) {
    if (requiredPermissions.type === "AND") {
      hasAccess = requiredPermissions.permissions.every((permission) =>
        accessData.includes(permission)
      );
    } else {
      hasAccess = requiredPermissions.permissions.some((permission) =>
        accessData.includes(permission)
      );
    }
  }

  if (has_permission) {
    const required = Array.isArray(has_permission)
      ? has_permission
      : [has_permission];
    const anyHas = required.some((permission) =>
      accessData.includes(permission)
    );
    if (!anyHas) return null;
    hasAccess = true;
  }

  return hasAccess ? children : <Navigate to="/no-access" />;

};

export default AccessMiddleware;
