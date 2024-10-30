const checkAccess = (requiredRoles) => {
    return (req, res, next) => {
        //here is our collection and we are accessing that from the req
        if (!requiredRoles.includes(req.user.role)) {
            return res.status(403).send("Access Denied")
        }
        next()
    }
}


module.exports = checkAccess