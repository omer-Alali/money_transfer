function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next(); // المستخدم مسجّل دخول
    }
    return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
  }
  
  function isAdmin(req, res, next) {
    if (req.session && req.session.is_admin) {
      return next(); // المستخدم مدير
    }
    return res.status(403).json({ message: 'هذه العملية خاصة بالمدير فقط' });
  }
  
  module.exports = {
    isAuthenticated,
    isAdmin,
  };
  