const { validateToken } = require("../services/authentication")

function checkForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        // cookie-parser populates req.cookies; guard if undefined
        const cookies = req.cookies || {}
        const tokenCookieValue = cookies[cookieName]
        if(!tokenCookieValue){
           return next()
        }

        try {
            const userPayload = validateToken(tokenCookieValue)
            req.user = userPayload
        } catch (error) {
            // swallow token validation errors but continue request lifecycle
        }
       return next()
    }
}

module.exports = {
    checkForAuthenticationCookie,
}