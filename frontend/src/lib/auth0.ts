import {Auth0Client} from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
    authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email'
    },
    enableParallelTransactions: false,  // Use single transaction cookie
    async beforeSessionSaved(session) {
    // Only keep essential user info to reduce cookie size
    return {
        ...session,             // Keep tokenSet and internal
        user: {
            sub: session.user.sub,           // User ID (required)
            name: session.user.name,         // Name
            email: session.user.email,       // Email
            picture: session.user.picture,   // Profile picture
        },
    };
    },


});
