const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized." 
    });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
    });
    }
    next();
  };
};

export default authorizeRole;